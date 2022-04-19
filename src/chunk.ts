import { Connection } from "./connection";

export class Chunk {
  static chunks: Map<string, Chunk> = new Map();
  players: Connection[] = [];
  constructor(code: string) {
    Chunk.chunks.set(code, this);
  }
  static get(code: string) {
    return Chunk.chunks.get(code) || new Chunk(code);
  }
  removePlayer(conn: Connection) {
    const index = this.players.indexOf(conn);
    if (index !== -1) this.players.splice(index, 1);
  }
  addPlayer(conn: Connection) {
    this.players.push(conn);
  }
}
