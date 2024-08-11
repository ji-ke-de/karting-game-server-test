import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import { KartRoom } from "./KartRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(express.static('client'));


const server = createServer(app);
const gameServer = new Server({
  server,
});

gameServer.define("kart", KartRoom)

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
