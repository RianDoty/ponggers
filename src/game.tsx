import React, { useCallback, useEffect, useRef, useState } from "react";
import { Song, SongLoader } from "./songs";
import pingPongMan from "/images/pongman.png";
import table from "/images/table.png";
import rally1Data from "./rally1.json";
import rally1AudioLink from "/sounds/rally.mp3";
import whistleLink from "/sounds/whistle.mp3";
import ballhit1Link from "/sounds/ballhit1.mp3";
import ballhit2Link from "/sounds/ballhit2.mp3";
import SFXNode from "./sfx";
import "./styles/game.css";
import Ping from "./ping";
import { arraysEqual } from "./util";

// Load audio context
const audioContext = new AudioContext();

const songLoader = new SongLoader(audioContext);
const rally1 = songLoader.load(rally1Data, rally1AudioLink);

rally1.audio.volume = 0.25;
const whistle = new SFXNode(audioContext, whistleLink);
const ballhit1 = new SFXNode(audioContext, ballhit1Link);
const ballhit2 = new SFXNode(audioContext, ballhit2Link);

function panNode(pan: number) {
  const node = new StereoPannerNode(audioContext, { pan });
  node.connect(audioContext.destination);
  return node;
}

/** Offset from note appearing to when it needs to be hit (ms) */
const noteOffset = 662;
const greatHitOffset = 20;

/** @returns [renderAbove, renderBelow] */
const getNoteWindow = (now: number) => [now - 50, now + noteOffset + 50];
function getVerdict(noteTimestamp: number) {
  /** in ms. positive = late, negative = early */
  const now = rally1.time;
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

function HitBar({ flip, song }: { flip?: boolean; song: Song }) {
  const notes = song.notes;

  const upcomingNotesRef = useRef<number[]>();
  const renderedNotes = useRef<number[]>([]);
  const [_, setFrame] = useState(0);
  const animateRef = useRef<number>(0);

  const animate = useCallback(function localAnimate() {
    //Render notes that are within the window defined by noteOffset
    //+-50 to make sure the notes can slide in and out from the sides
    const now = rally1.time;
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

  const now = rally1.time;
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

  const songRef = useRef<Song>(rally1);
  const upcomingNotesRef = useRef<number[]>([...songRef.current.notes]);

  const [verdict, setVerdict] = useState("");

  //Music loading
  useEffect(() => {
    // Immediately cancel if the audio is already loaded
    if (rally1.audio.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA)
      return setMusicLoaded(true);

    //Wait for sound effects and music to load
    rally1.audio.oncanplaythrough = async () => {
      await Promise.all([whistle.onLoad, ballhit1.onLoad, ballhit2.onLoad]);
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
    const now = rally1.time;
    const difference = now - note;

    //Notes hit if they aren't more than 200ms off
    if (Math.abs(difference) < 200) {
      upcomingNotesRef.current!.shift();
      console.log(`${now}, ${note}`);

      setVerdict(`${getVerdict(note)} (${now - note}ms)`);

      //TODO: remove second half of sounds,
      //replace with multiplayer
      const nearestBeat = rally1.toContextTime(rally1.roundToBeat(rally1.time));
      const beat = (i) => rally1.beat(i);
      ballhit1.play(0, panNode(-0.5));
      ballhit2.play(beat(1) + nearestBeat, panNode(0.25));
      ballhit1.play(beat(2) + nearestBeat, panNode(0.5));
      ballhit2.play(beat(3) + nearestBeat, panNode(-0.25));
    } else setVerdict("miss");
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

  //Misses
  setInterval(() => {
    const now = rally1.time;
    const upcoming = upcomingNotesRef.current;
    for (let i = 0; now > upcoming[i] && i < upcoming.length; i++) {
      const thisNote = upcomingNotesRef.current[i];

      if (thisNote + 100 < now) {
        //The note is more than 100ms late to be pressed, count it as a miss.
        upcoming.splice(i, 1);
        setVerdict("miss");
      }
    }
  });

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
