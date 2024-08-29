import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import { KartRoom } from "./KartRoom";
import { playground } from "@colyseus/playground";
import { monitor } from "@colyseus/monitor";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(express.static('client'));
app.use("/playground", playground);
app.use("/monitor", monitor());


const server = createServer(app);
const gameServer = new Server({
  server,
});
// gameServer
//   .define("lobby", LobbyRoom);

gameServer
  .define("kart", KartRoom)
  .enableRealtimeListing();

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
