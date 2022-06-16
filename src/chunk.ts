import { Connection } from "./connection";
import { Entity } from "./entity";
import { Player } from "./player";
import { OutData } from "./types";

export class Chunk {
  static chunks: Map<string, Chunk> = new Map();
  code: string;
  players: Player[] = [];
  entities: Entity[] = [];
  constructor(code: string) {
    Chunk.chunks.set(code, this);
    this.code = code;
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
  addEntity(entity: Entity) {
    this.entities.push(entity);
  }

  dispatch(data: OutData, exclude?: Player) {
    this.players
      .filter((p) => p != exclude)
      .forEach((player) => player.connection.ws.send(JSON.stringify(data)));
  }
}
