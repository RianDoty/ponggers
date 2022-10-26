import express from "express";
import { Server } from "socket.io";
import http from "http";

async function createServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const io = new Server(httpServer);
  const nsp = io.of("/");

  let port = 3001;
  console.log("❇️ NODE_ENV is probably development, idk");
  console.log("⚠️ Running development server");

  // Start the listener!
  httpServer.listen(port, () => {
    console.log(`❇️ Express server is running on port ${port}`);
  });
}

createServer();
