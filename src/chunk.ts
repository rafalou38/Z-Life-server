import { Connection } from "./connection";
import { Player } from "./player";
import { OutData } from "./types";

export class Chunk {
  static chunks: Map<string, Chunk> = new Map();
  players: Player[] = [];
  constructor(code: string) {
    Chunk.chunks.set(code, this);
  }
  static get(code: string) {
    return Chunk.chunks.get(code) || new Chunk(code);
  }
  removePlayer(player: Player) {
    const index = this.players.indexOf(player);
    if (index !== -1) this.players.splice(index, 1);
  }
  addPlayer(player: Player) {
    this.players.push(player);
  }

  dispatch(data: OutData) {
    this.players.forEach((player) =>
      player.connection.ws.send(JSON.stringify(data))
    );
  }
}
