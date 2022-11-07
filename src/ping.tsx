import React, { useEffect, useState } from 'react'
import socket from './socket'

/** A small text display that shows the current latency. */
export default function Ping() {
    const [ping, setPing] = useState('Ping is loading...')

    useEffect(()=>{
        console.log('Beginning ping.')
        //Check the ping every 2s
        const updatePing = ()=>{
            const startTime = Date.now()

            socket.emit('ping', () => {
                //Ping signal has returned from server when this code is reached
                setPing(`${Date.now() - startTime}ms`)
            })
        }

        updatePing();
        const interval = setInterval(updatePing, 2000);

        //Close the socket on decoupling
        return () => clearInterval(interval) 
    },[])

    return <>{ping}</>
}