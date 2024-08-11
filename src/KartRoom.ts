import { Room, Client } from "colyseus";
import { State } from "./KartRoomState";

export class KartRoom extends Room<State> {
  maxClients = 5;

  onCreate(options: any) {
    console.log("KartRoom created!", options);

    this.setState(new State());

    this.onMessage("move", (client, data) => {
      console.log(
        "KartRoom received message from",
        client.sessionId,
        ":",
        data
      );
      this.state.movePlayer(client.sessionId, data);
    });
  }

  // onAuth(client, options, req) {
  //     return true;
  // }

  onJoin(client: Client) {
    console.log(client.sessionId, "joined!");
    this.state.createPlayer(client.sessionId);
  }

  onLeave(client: { sessionId: string }) {
    console.log(client.sessionId, "left!");
    this.state.removePlayer(client.sessionId);
  }

  onDispose() {
    console.log("Dispose StateHandlerRoom");
  }
}
