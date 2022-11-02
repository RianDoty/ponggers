import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'

/** A small text display that shows the current latency. */
export default function Ping() {
    const [ping, setPing] = useState('Loading...')

    useEffect(()=>{
        const socket = io('localhost:3000')

        //Check the ping every 2s
        const interval = setInterval(() => {
            const startTime = Date.now()
            socket.emit('ping', () => {
                //Ping signal has returned from server when this code is reached
                setPing(`${Date.now() - startTime}ms`)
            })
        }, 2000)

        //Close the socket on decoupling
        return () => {
            socket.close();
            clearInterval(interval)
        }   
    },[])

    return <>{ping}</>
}