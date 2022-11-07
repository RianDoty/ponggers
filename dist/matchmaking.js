"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Matchmaker {
    constructor() {
        this.waiting = null;
        this.listeners = new Set();
    }
    addSocket(socket) {
        var _a;
        if ((_a = this.waiting) === null || _a === void 0 ? void 0 : _a.disconnected)
            this.waiting = null;
        const waiting = this.waiting;
        if (waiting) {
            console.log('Match found.');
            this.listeners.forEach(l => l([waiting, socket]));
            this.waiting = null;
            socket.emit('found');
        }
        else {
            console.log('Socket is waiting for matchmaking.');
            this.waiting = socket;
            socket.emit('waiting');
        }
    }
    onMatch(listener) {
        this.listeners.add(listener);
    }
    offMatch(listener) {
        this.listeners.delete(listener);
    }
}
exports.default = Matchmaker;
//# sourceMappingURL=matchmaking.js.map