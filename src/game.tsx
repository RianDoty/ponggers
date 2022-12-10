import React, { useCallback, useEffect, useRef, useState } from "react";

import pingPongMan from "/images/pongman.png";
import table from "/images/table.png";

import rally from "/sounds/rally.mp3";
import whistle from "/sounds/whistle.mp3";
import ballhit1 from "/sounds/ballhit1.mp3";
import ballhit2 from "/sounds/ballhit2.mp3";

import "./styles/game.css";
import Ping from "./ping";

// Load audio
const rallymusicdata = new Audio(rally);
rallymusicdata.volume = 0.25;
const bpm = 182;
const beat = (n: number) => (n * 60 * 1000) / bpm;
const measure = (n: number) => beat(n * 4);

const whistlesfxdata = new Audio(whistle);
const ballhit1sfxdata = new Audio(ballhit1);
const ballhit2sfxdata = new Audio(ballhit2);

// Load audio context
const audioContext = new AudioContext();

function convertToContext(audio: HTMLAudioElement) {
  const contextAudio = audioContext.createMediaElementSource(audio);
  contextAudio.connect(audioContext.destination);
  return contextAudio;
}

const rallymusic = convertToContext(rallymusicdata);
const whistlesfx = convertToContext(whistlesfxdata);
const ballhit1sfx = convertToContext(ballhit1sfxdata);
const ballhit2sfx = convertToContext(ballhit2sfxdata);

/** Returns true when two arrays contain equal data in the same order. */
const arraysEqual = (a: any[], b: any[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

/** Offset from note appearing to when it needs to be hit (ms) */
const noteOffset = 662;
const greatHitOffset = 20;

/** @returns [renderAbove, renderBelow] */
const getNoteWindow = (now: number) => [now - 50, now + noteOffset + 50];
function getVerdict(noteTimestamp: number) {
  /** (ms) positive = late, negative = early */
  const difference = Date.now() - noteTimestamp;
  console.log(`${Math.abs(difference)}ms ${difference > 0 ? "late" : "early"}`);

  if (Math.abs(difference) <= 50) return "great" as const;
  if (Math.abs(difference) <= 100) return "good" as const;
  if (difference < 100) return "early" as const;
  if (difference > 100) return "late" as const;
  return "miss" as const;
}

const Note = ({ pos }: { pos: number }) => (
  <div className="note" style={{ left: `${(1 - pos) * 100}%` }} />
);

class Song {
  startTime: number;
  whistleTime: number;
  audio: HTMLAudioElement;
  notes: number[];

  constructor({
    whistle,
    notes,
    audio
  }: {
    whistle: number;
    notes: number[];
    audio: HTMLAudioElement;
  }) {
    this.notes = notes;
    this.audio = audio;
    this.whistleTime = whistle;
    this.startTime = -99999999;
  }

  start() {
    this.audio.play();
    this.startTime = Date.now() - this.audio.currentTime;
  }
}

function HitBar({ flip, song }: { flip?: boolean; song: Song }) {
  const notes = song.notes;

  const upcomingNotesRef = useRef<number[]>();
  const renderedNotes = useRef<number[]>([]);
  const [_, setFrame] = useState(0);
  const animateRef = useRef<number>(0);
  const [verdict, setVerdict] = useState<string>();

  const animate = useCallback(function localAnimate() {
    //Render notes that are within the window defined by noteOffset
    //+-50 to make sure the notes can slide in and out from the sides
    const now = rallymusic.currentTime + song.startTime;
    const [renderAbove, renderBelow] = getNoteWindow(now);

    const upcoming = upcomingNotesRef.current;
    //Render notes within the defined window
    const toRender: number[] =
      upcoming?.filter((t) => renderBelow > t && t > renderAbove) ?? [];
    //Remove notes that have already been fully played out
    upcomingNotesRef.current = upcoming?.filter((t) => {
      const noteMissed = t < now - 200;
      if (noteMissed) setVerdict("late");
      return !noteMissed;
    });

    let currentSize = 0;
    if (!arraysEqual(renderedNotes.current, toRender)) {
      currentSize = toRender.length;
      renderedNotes.current = toRender;
    } else currentSize = renderedNotes.current.length;

    //Refresh component if there are rendered notes
    if (currentSize > 0) setFrame((f) => f + 1);

    animateRef.current = requestAnimationFrame(localAnimate);
  }, []);

  // Start animating
  useEffect(() => {
    console.log("Refreshing animate loop");

    upcomingNotesRef.current = [...notes]; //No side effects
    animateRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animateRef.current);
  }, [notes, animate]);

  function onNoteHit(note: number) {
    const difference = Date.now() - note;
    if (Math.abs(difference) < 200) {
      upcomingNotesRef.current!.shift();
      setVerdict(`${getVerdict(note)} (${Date.now() - note}ms)`);
    } else setVerdict("miss");

    ballhit1sfx.play();

    function play(audio: HTMLAudioElement) {
      const newAudio = audio.cloneNode(false) as HTMLAudioElement;
      newAudio.play();
    }

    setTimeout(() => play(ballhit2sfx), 1326 / 4);
    setTimeout(() => play(ballhit1sfx), 1326 / 2);
    setTimeout(() => play(ballhit2sfx), (1326 * 3) / 4);
  }

  //Hit Registration
  useEffect(() => {
    function onKeyDown(ev: KeyboardEvent) {
      if (ev.repeat) return;

      const note = upcomingNotesRef.current?.[0];
      if (!note) return setVerdict("miss");

      onNoteHit(note);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const noteComponents = renderedNotes.current.map((nTime) => {
    const pos = (Date.now() - nTime + noteOffset + greatHitOffset) / noteOffset;
    return <Note pos={pos} key={nTime} />;
  });

  const divClass = `hit-bar${flip ? " flipped" : ""}` as const;
  return (
    <>
      {verdict}
      <div className={divClass}>
        <div className="hit-bar-green" />
        <div className="hit-bar-yellow" />
        <div className="hit-bar-red" />
        {noteComponents}
      </div>
    </>
  );
}

//Manages the visuals associated with the game, and also sounds!
function GameVisual() {
  return (
    <div>
      <img
        src={pingPongMan}
        id="man1"
        alt="man playing ping pong"
        draggable={false}
      />
      <img
        src={pingPongMan}
        id="man2"
        alt="man playing ping pong"
        draggable={false}
      />
      <img src={table} id="table" alt="ping pong table" draggable={false} />
    </div>
  );
}

function StartPopup({
  isLoaded,
  onConfirm
}: {
  isLoaded: boolean;
  onConfirm: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <div className="screen-popup">
      <div>
        {isLoaded ? (
          <button onClick={onConfirm}>Start</button>
        ) : (
          <h1>Loading...</h1>
        )}
      </div>
    </div>
  );
}

export default function Game() {
  const [gameStarted, setGameStarted] = useState(false);
  const [musicLoaded, setMusicLoaded] = useState(false);
  const songRef = useRef<Song>(
    new Song({
      audio: rallymusic,
      whistle: 0,
      notes: (() => {
        const note = (i: number) => Date.now() + 1315.6 * i;
        const out: number[] = [];
        for (let i = 3; i < 20 + 3; i++) {
          out.push(note(i));
        }
        return out;
      })()
    })
  );

  //Music loading
  useEffect(() => {
    if (rallymusic.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA)
      return setMusicLoaded(true);
    rallymusic.oncanplaythrough = () => setMusicLoaded(true);
  }, []);

  const startGame: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (gameStarted) return;

    songRef.current.start();

    setGameStarted(true);
  };

  return (
    <>
      <Ping />
      {gameStarted ? null : (
        <StartPopup isLoaded={musicLoaded} onConfirm={startGame} />
      )}
      <div id="game">
        <GameVisual />
        <HitBar song={songRef.current} />
      </div>
    </>
  );
}
