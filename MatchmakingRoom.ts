import { Room, Client } from "colyseus";
import { Schema, type, ArraySchema } from "@colyseus/schema";

class Player extends Schema {
  @type("string") id: string;
  @type("number") rating: number = 1500; // default rating

  constructor(id: string) {
    super();
    this.id = id;
  }
}

class MatchmakingState extends Schema {
  @type([Player]) players = new ArraySchema<Player>();
}

export class MatchmakingRoom extends Room<MatchmakingState> {
  maxClients = 100;

  onCreate (options: any) {
    this.setState(new MatchmakingState());
    this.setSimulationInterval(() => this.update());
  }

  onJoin (client: Client, options: any) {
    const player = new Player(client.sessionId);
    this.state.players.push(player);
    console.log(client.sessionId, "joined matchmaking.");
  }

  onLeave (client: Client, consented: boolean) {
    const index = this.state.players.findIndex(p => p.id === client.sessionId);
    if (index !== -1) {
      this.state.players.splice(index, 1);
    }
    console.log(client.sessionId, "left matchmaking.");
  }

  update() {
    if (this.state.players.length >= 5) {
      const playersForMatch = this.state.players.slice(0, 10); // match 10 players
      this.startMatch(playersForMatch);
    }
  }

  startMatch(players: Player[]) {
    // Here you can create a new room for the match, or send a message to the clients to join a room
    console.log("Starting a new match with", players.length, "players");
    players.forEach(player => {
      const client = this.clients.find(c => c.sessionId === player.id);
      if (client) {
        client.send("matchFound", { matchId: "someUniqueId" });
        const index = this.state.players.findIndex(p => p.id === player.id);
        if (index !== -1) {
          this.state.players.splice(index, 1);
        }
      }
    });
  }
}
