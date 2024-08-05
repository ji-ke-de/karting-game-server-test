import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import { MatchmakingRoom } from "./MatchmakingRoom";
import { playground } from "@colyseus/playground";

const port = Number(process.env.PORT || 2567);
const app = express();

// app.use("/", express.static(__dirname + "/../client"));
app.use("/colyseus", playground);

const server = createServer(app);
const gameServer = new Server({
  server,
});

gameServer.define("matchmaking", MatchmakingRoom);

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
