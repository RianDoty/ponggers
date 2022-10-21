"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const path = require("path");
const app = (0, express_1.default)();
const http = require("http").Server(app);
const io = new socket_io_1.Server(http);
const nsp = io.of("/");
//  Boring server stuff
// Swap over non-https connections to https
function checkHttps(request, response, next) {
    // Check the protocol — if http, redirect to https.
    const proto = request.get("X-Forwarded-Proto");
    if (proto && proto.indexOf("https") !== -1) {
        return next();
    }
    else {
        response.redirect("https://" + request.hostname + request.url);
    }
}
app.all("*", checkHttps);
// Express port-switching logic
// no touch
let port;
console.log("❇️ NODE_ENV is", process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
    //When NODE_ENV is production, serve the client-side in a static package
    port = process.env.PORT || 3000;
    app.use(express_1.default.static(path.join(__dirname, "../build")));
    app.get("*", (_, response) => {
        response.sendFile(path.join(__dirname, "../build", "index.html"));
    });
}
else {
    port = 3001;
    console.log("⚠️ Running development server");
}
// Start the listener!
http.listen(port, () => {
    console.log(`❇️ Express server is running on port ${port}`);
});
//# sourceMappingURL=server.js.map