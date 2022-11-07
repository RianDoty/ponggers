"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class Match {
    constructor(sockets) {
        this.sockets = sockets;
        this.id = (0, uuid_1.v4)() /* TODO: remove this once servers are working well */.substring(0, 5);
        sockets.forEach(s => s.join(this.id));
    }
    start() {
    }
}
exports.default = Match;
//# sourceMappingURL=match.js.map