import { Schema, type, MapSchema } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("number") xPos: number = 0; // x position
  @type("number") yPos: number = 0; // y position
  @type("number") zPos: number = 0; // z position
  @type("number") xRot: number = 0; // x rotation
  @type("number") yRot: number = 0; // y rotation
  @type("number") zRot: number = 0; // z rotation
  @type("number") wRot: number = 0; // w rotation
  @type("string") name = "Unknown"; // player name
}

export class KartRoomState extends Schema {
  @type({ map: PlayerState })
  players: MapSchema<PlayerState> = new MapSchema<PlayerState>();

  @type("string") status: string = "waiting"; // waiting, playing, finished

  createPlayer(sessionId: string) {
    this.players.set(sessionId, new PlayerState());
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId);
  }

  movePlayer(sessionId: string, movement: any) {
    const player = this.players.get(sessionId);
    if (player) {
      player.xPos += movement.x;
      player.yPos += movement.y;
      player.zPos += movement.z;

      player.xRot = movement.xRot;
      player.yRot = movement.yRot;
      player.zRot = movement.zRot;
      player.wRot = movement.wRot;

      // this.players.set(sessionId, player);
    }
  }
}
