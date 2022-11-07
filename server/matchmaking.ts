import { Socket } from "socket.io";

type MatchListener = (match: [Socket, Socket]) => void
export default class Matchmaker {
    waiting: Socket|null;
    listeners: Set<MatchListener>

    constructor() {
        this.waiting = null;
        this.listeners = new Set()
    }

    addSocket(socket: Socket) {
        if (this.waiting?.disconnected) this.waiting = null;

        const waiting = this.waiting
        if (waiting) {
            console.log('Match found.')
            this.listeners.forEach(l => l([waiting, socket]))
            this.waiting = null;
            socket.emit('found')
        }
        else {
            console.log('Socket is waiting for matchmaking.')
            this.waiting = socket
            socket.emit('waiting')
        }
    }

    onMatch(listener: MatchListener) {
        this.listeners.add(listener)
    }

    offMatch(listener: MatchListener) {
        this.listeners.delete(listener)
    }
}