import React, { ReactNode, useEffect, useRef, useState } from "react";
import pingPongMan from "/images/pongman.png";
import table from "/images/table.png";
import "../styles/game.css";

/** Returns true when two arrays contain equal data in the same order. */
const arraysEqual = (a: any[], b: any[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

/** Offset from note appearing to when it needs to be hit (ms) */
const noteOffset = 331.5;
const greatHitOffset = 20;

const Note = ({ pos }: { pos: number }) => (
  <div className="note" style={{ left: `${(1 - pos) * 100}%` }} />
);

function HitBar({ flip, notes = [] }: { flip?: boolean; notes: number[] }) {
  const [renderedNotes, setRenderedNotes] = useState<number[]>([]);
  const [frame, setFrame] = useState(0);
  const animateRef = useRef<number>(0);

  function animate() {
    const renderBelow = Date.now() + noteOffset + 50;
    const renderAbove = Date.now() - 50;

    const toRender: number[] = [];
    notes.forEach((t) => {
      if (renderAbove < t && t < renderBelow) toRender.push(t);
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
    animateRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animateRef.current);
  }, [notes]);

  const noteComponents = renderedNotes.map((nTime) => {
    const pos = (Date.now() - nTime + noteOffset + greatHitOffset) / noteOffset;
    return <Note pos={pos} key={nTime} />;
  });

  const divClass = `hit-bar${flip ? " flipped" : ""}` as const;
  return (
    <>
      {frame}
      <div className={divClass}>
        <div className="hit-bar-green" />
        <div className="hit-bar-yellow" />
        <div className="hit-bar-red" />
        {noteComponents}
      </div>
    </>
  );
}

export default function Game() {
  const note = (i: number) => Date.now() + 1326 * i;
  const [debugNotes] = useState(() => {
    const out = [];
    for (let i = 1; i < 100; i++) {
      out.push(note(i / 5));
    }
    return out;
  });

  return (
    <div id="game">
      <img src={pingPongMan} id="man1" alt="man playing ping pong" />
      <img src={pingPongMan} id="man2" alt="man playing ping pong" />
      <img src={table} id="table" alt="ping pong table" />
      <HitBar notes={debugNotes} />
    </div>
  );
}
