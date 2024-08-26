import { Room, Client } from "colyseus";
import { KartRoomState } from "./schema/KartRoomState";

export class KartRoom extends Room<KartRoomState> {
  maxClients = 4;
  gameStartTimeout: NodeJS.Timeout | null = null;
  gameEndTimeout: NodeJS.Timeout | null = null;


  onCreate(options: any) {
    console.log("KartRoom created!", options);

    this.setState(new KartRoomState());

    this.onMessage("move", (client, data) => {
      console.log(
        "KartRoom received message from",
        client.sessionId,
        ":",
        data
      );
      this.state.movePlayer(client.sessionId, data);
    });

    this.onMessage("ready", (client) => {
      this.state.setPlayerReady(client.sessionId);
      if (this.state.allPlayersReady(this.maxClients)) {
        this.startGameCountdown();
      }
    });

    this.onMessage("finished", (client) => {
      this.state.playerFinished(client.sessionId);
      if (this.state.finishedCount === this.maxClients) {
        this.endGame();
      }
    });

  }

  onJoin(client: Client, options: { name: string; appearance: any; }) {
    console.log(client.sessionId, "joined!");

    this.state.createPlayer(client.sessionId, options.name, options.appearance);
    if(this.clients.length === this.maxClients){
      this.broadcast("ready_check");      
    }
  }

  onLeave(client: { sessionId: string }) {
    console.log(client.sessionId, "left!");
    this.state.removePlayer(client.sessionId);
  }
  startGameCountdown() {
    this.state.status = "loading";
    this.broadcast("loading");
    
    this.gameStartTimeout = setTimeout(() => {
      this.startGame();
    }, 5000);
  }
  startGame() {
    this.state.status = "playing";
    this.state.startTime = Date.now();
    this.broadcast("start");

    // Set a timeout to end the game after 1 minute if not all players have finished
    this.gameEndTimeout = setTimeout(() => {
      this.endGame();
    }, 60000);
  }

  endGame() {
    if (this.gameEndTimeout) {
      clearTimeout(this.gameEndTimeout);
    }

    this.state.status = "finished";
    const results = Array.from(this.state.players.entries())
      .map(([sessionId, player]) => ({
        sessionId,
        name: player.name,
        finished: player.finished,
        finishTime: player.finishTime,
        score: player.score
      }))
      .sort((a, b) => b.score - a.score);

    this.broadcast("gameOver", { results });
  }

  onDispose() {
    console.log("Dispose StateHandlerRoom");
  }
}
