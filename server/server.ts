import express from "express";
import { Server } from "socket.io";
import http from "http";
import Matchmaker from "./matchmaking";
import Match from "./match";

async function createServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const io = new Server(httpServer);
  const nsp = io.of("/");

  const matchmaker = new Matchmaker();

  const matches = new Map();
  matchmaker.onMatch((sockets) => {
    console.log('Match recieved.')

    const match = new Match(sockets)
    matches.set(match.id, match)
    match.start()
  })

  nsp.on('connect', socket => {
    //Basic ping function
    socket.on('ping', ack => ack())

    //Start the socket's matchmaking
    matchmaker.addSocket(socket);
  })

  let port = 3001;
  console.log("❇️ NODE_ENV is probably development, idk");
  console.log("⚠️ Running development server");

  // Start the listener!
  httpServer.listen(port, () => {
    console.log(`❇️ Express server is running on port ${port}`);
  });
}

createServer();
