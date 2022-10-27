import React, { ReactNode, useEffect, useRef, useState } from "react";
import pingPongMan from "/images/pongman.png";
import table from "/images/table.png";
import "./styles/game.css";
import { render } from "react-dom";

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
const getNoteWindow = () => [Date.now() - 50, Date.now() + noteOffset + 50];
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

function HitBar({ flip, notes = [] }: { flip?: boolean; notes: number[] }) {
  const upcomingNotesRef = useRef<number[]>();
  const [renderedNotes, setRenderedNotes] = useState<number[]>([]);
  const [frame, setFrame] = useState(0);
  const animateRef = useRef<number>(0);
  const [verdict, setVerdict] = useState<string>();

  function animate() {
    //Render notes that are within the window defined by noteOffset
    //+-50 to make sure the notes can slide in and out from the sides
    const [renderAbove, renderBelow] = getNoteWindow();

    const upcoming = upcomingNotesRef.current;
    //Render notes within the defined window
    const toRender: number[] =
      upcoming?.filter((t) => renderBelow > t && t > renderAbove) ?? [];
    //Remove notes that have already been fully played out
    upcomingNotesRef.current = upcoming?.filter((t) => {
      const noteMissed = t < Date.now() - 200;
      if (noteMissed) setVerdict("late");
      return !noteMissed;
    });

    let currentSize = 0;
    setRenderedNotes((currentlyRendered) => {
      if (!arraysEqual(currentlyRendered, toRender)) {
        currentSize = toRender.length;
        return toRender;
      }
      currentSize = currentlyRendered.length;
      return currentlyRendered;
    });

    if (currentSize > 0) setFrame((f) => f + 1);
    animateRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    upcomingNotesRef.current = [...notes]; //No side effects
    animateRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animateRef.current);
  }, [notes]);

  //Hit Registration
  useEffect(() => {
    function onKeyDown(ev: KeyboardEvent) {
      if (ev.repeat) return;

      const note = upcomingNotesRef.current?.[0];

      const difference = Date.now() - note;
      if (note && Math.abs(difference) < 200) {
        upcomingNotesRef.current!.shift();
        setVerdict(`${getVerdict(note)} (${Date.now() - note}ms)`);
      } else setVerdict("miss");
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const noteComponents = renderedNotes.map((nTime) => {
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

function GameVisual() {
  return (
    <div>
      <img src={pingPongMan} id="man1" alt="man playing ping pong" />
      <img src={pingPongMan} id="man2" alt="man playing ping pong" />
      <img src={table} id="table" alt="ping pong table" />
    </div>
  );
}

export default function Game() {
  const note = (i: number) => Date.now() + 1326 * i;
  const [debugNotes] = useState(() => {
    const out: number[] = [];
    for (let i = 1; i < 100; i++) {
      out.push(note(i));
    }
    return out;
  });

  return (
    <div id="game">
      <GameVisual />
      <HitBar notes={debugNotes} />
    </div>
  );
}
