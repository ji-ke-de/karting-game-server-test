import { Client, Room } from "colyseus.js";

export class MatchmakingClient {
  private client: Client;
  private room: Room | null = null;

  constructor(endpoint: string) {
    this.client = new Client(endpoint);
  }

  async joinMatchmaking(): Promise<void> {
    try {
      this.room = await this.client.joinOrCreate("matchmaking");
      console.log("Joined matchmaking room");

      this.room.onStateChange((state) => {
        console.log("Matchmaking state changed:", state);
      });

      this.room.onMessage("matchFound", (message) => {
        console.log("Match found:", message);
        // Here you can handle the logic of a successful match, such as joining a game room
      });

    } catch (e) {
      console.error("Error joining matchmaking room:", e);
    }
  }

  leaveMatchmaking(): void {
    if (this.room) {
      this.room.leave();
      this.room = null;
      console.log("Left matchmaking room");
    }
  }
}
