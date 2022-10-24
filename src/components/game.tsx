import React, { ReactNode, useEffect, useRef, useState } from 'react'
import pingPongMan from '/images/pongman.png';
import table from '/images/table.png';
import '../styles/game.css'

/** Returns true when two arrays contain equal data in the same order. */
const arraysEqual = (a: any[], b: any[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false
    }
    return true
}

/** Offset from note appearing to when it needs to be hit (ms) */
const noteOffset = 750

const Note = ({ pos }: { pos: number }) => <div className='note' style={{ left: `${(1 - pos) * 100}%` }} />

function HitBar({ flip, notes = [] }: { flip?: boolean, notes: number[] }) {
    const [renderedNotes, setRenderedNotes] = useState<number[]>([]);
    const [frame, setFrame] = useState(0)
    const animateRef = useRef<number>(0)

    function animate() {
        const renderBelow = Date.now() + noteOffset
        const renderAbove = Date.now()

        const toRender: number[] = []
        notes.forEach(t => { if (renderAbove < t && t < renderBelow) toRender.push(t) })

        let currentSize = 0;
        setRenderedNotes(currentlyRendered => {
            if (!arraysEqual(currentlyRendered, toRender)) {
                currentSize = toRender.length
                return toRender
            }
            currentSize = currentlyRendered.length
            return currentlyRendered
        })

        if (currentSize > 0) setFrame(f => f + 1)
        animateRef.current = requestAnimationFrame(animate)
    }

    useEffect(() => {
        animateRef.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animateRef.current)
    }, [notes])

    const noteComponents = renderedNotes.map(nTime => {
        const pos = (Date.now() - nTime + noteOffset) / noteOffset
        return <Note pos={pos} key={nTime} />
    })

    const divClass = `hit-bar${flip ? ' flipped' : ''}` as const
    return (
        <>
            {frame}
            <div className={divClass}>
                <div className='hit-bar-green' />
                <div className='hit-bar-yellow' />
                <div className='hit-bar-red' />
                {noteComponents}
            </div>
        </>
    )
}

export default function Game() {
    const [debugNote] = useState(Date.now() + 5000)

    return (
        <div id='game'>
            <img src={pingPongMan} id='man1' />
            <img src={pingPongMan} id='man2' />
            <img src={table} id='table' />
            <HitBar notes={[debugNote]} />
        </div>
    )
}