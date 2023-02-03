import React, { useCallback, useEffect, useRef, useState } from "react";

import pingPongMan from "/images/pongman.png";
import table from "/images/table.png";

import rallyLink from "/sounds/rally.mp3";
import whistleLink from "/sounds/whistle.mp3";
import ballhit1Link from "/sounds/ballhit1.mp3";
import ballhit2Link from "/sounds/ballhit2.mp3";

import SFXNode from "./sfx";

import "./styles/game.css";
import Ping from "./ping";

// Load audio context
const audioContext = new AudioContext();

const rallymusicdata = new Audio(rallyLink);

//Make the rally music play through the audio context
audioContext
  .createMediaElementSource(rallymusicdata)
  .connect(audioContext.destination);

rallymusicdata.volume = 0.25;
const bpm = 182;
const beat = (n: number) => (n * 60 * 1000) / bpm;
const measure = (n: number) => beat(n * 4);

const whistle = new SFXNode(audioContext, whistleLink);
const ballhit1 = new SFXNode(audioContext, ballhit1Link);
const ballhit2 = new SFXNode(audioContext, ballhit2Link);

function panNode(pan: number) {
  const node = new StereoPannerNode(audioContext, { pan });
  node.connect(audioContext.destination);
  return node;
}

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
  /** in ms. positive = late, negative = early */
  const now = rallymusicdata.currentTime * 1000;
  const difference = now - noteTimestamp;
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
    audio,
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

  roundToBeat(n: number) {
    const offset = this.startTime % beat(1);
    return Math.floor((n - offset) / beat(1)) * beat(1) + offset;
  }
}

function HitBar({ flip, song }: { flip?: boolean; song: Song }) {
  const notes = song.notes;

  const upcomingNotesRef = useRef<number[]>();
  const renderedNotes = useRef<number[]>([]);
  const [_, setFrame] = useState(0);
  const animateRef = useRef<number>(0);

  const animate = useCallback(function localAnimate() {
    //Render notes that are within the window defined by noteOffset
    //+-50 to make sure the notes can slide in and out from the sides
    const now = rallymusicdata.currentTime * 1000;
    const [renderAbove, renderBelow] = getNoteWindow(now);

    const upcoming = upcomingNotesRef.current;
    //Render notes within the defined window
    const toRender: number[] =
      upcoming?.filter((t) => renderBelow > t && t > renderAbove) ?? [];
    //Remove notes that have already been fully played out
    upcomingNotesRef.current = upcoming?.filter((t) => {
      const noteMissed = t < now - 200;
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

  const now = rallymusicdata.currentTime * 1000;
  const noteComponents = renderedNotes.current.map((nTime) => {
    const pos = (now - nTime + noteOffset + greatHitOffset) / noteOffset;
    return <Note pos={pos} key={nTime} />;
  });

  const divClass = `hit-bar${flip ? " flipped" : ""}` as const;
  return (
    <div className={divClass}>
      <div className="hit-bar-green" />
      <div className="hit-bar-yellow" />
      <div className="hit-bar-red" />
      {noteComponents}
    </div>
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
  onConfirm,
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
      audio: rallymusicdata,
      whistle: 0,
      notes: (() => {
        const out: number[] = [];
        for (let i = 3; i < 40 + 3; i++) {
          out.push(measure(i) + beat(1));
        }
        return out;
      })(),
    })
  );
  const upcomingNotesRef = useRef<number[]>([...songRef.current.notes]);

  const [verdict, setVerdict] = useState("");

  //Music loading
  useEffect(() => {
    if (rallymusicdata.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA)
      return setMusicLoaded(true);

    const sfxload = new Promise<void>(async (r) => {
      ballhit1sfxdata = await getBuffer(ballhit1);
      ballhit2sfxdata = await getBuffer(ballhit2);

      r();
    });

    //Wait for sound effects and music to load
    rallymusicdata.oncanplaythrough = async () => {
      await sfxload;
      setMusicLoaded(true);
    };
  }, []);

  const startGame: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (gameStarted) return;

    audioContext.resume();
    songRef.current.start();
    console.log("Starting game");

    setGameStarted(true);
  };

  function onNoteHit(note: number) {
    const now = rallymusicdata.currentTime * 1000;
    const difference = now - note;

    //Notes hit if they aren't more than 200ms off
    if (Math.abs(difference) < 200) {
      upcomingNotesRef.current!.shift();
      console.log(`${now}, ${note}`);
      setVerdict(`${getVerdict(note)} (${now - note}ms)`);
    } else setVerdict("miss");

    //TODO: remove second half of sounds,
    //replace with multiplayer
    console.log("Playing hit sounds");
    const contextTime = audioContext.currentTime * 1000;
    playBuffer(ballhit1sfxdata, contextTime, panNode(-0.5));
    playBuffer(ballhit2sfxdata, contextTime + beat(1), panNode(0.25));
    playBuffer(ballhit1sfxdata, contextTime + beat(2), panNode(0.5));
    playBuffer(ballhit2sfxdata, contextTime + beat(3), panNode(-0.25));
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

  return (
    <>
      <Ping />
      {gameStarted ? null : (
        <StartPopup isLoaded={musicLoaded} onConfirm={startGame} />
      )}
      <div id="game">
        {verdict}
        <GameVisual />
        <HitBar song={songRef.current} />
      </div>
    </>
  );
}
