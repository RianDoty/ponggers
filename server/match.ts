import { Socket } from 'socket.io';
import {v4 as uuid} from 'uuid'

export default class Match {
    sockets: [Socket, Socket]
    id: string

    constructor(sockets: [Socket, Socket]) {
        this.sockets = sockets;
        this.id = uuid()/* TODO: remove this once servers are working well */.substring(0,5) 

        //Join each socket to this room
        sockets.forEach((s: Socket) => s.join(this.id))
    }

    start() {

    }
}