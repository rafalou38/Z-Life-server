import { Chunk } from "./chunk";
import { Connection } from "./connection";
import { Position } from "./types";

export class Player {
  connection: Connection;
  id: string;
  position: Position;
  chunk: Chunk;
  static players: Map<string, Player> = new Map();
  constructor(con: Connection, id: string) {
    this.connection = con;
    this.id = id;
    this.position = { x: 0, y: 0 };
    this.chunk = Chunk.get("A0");
    Player.players.set(id, this);
  }
  static isConnected(id: string) {
    return Player.players.has(id);
  }
  changeChunk(code: string) {
    this.chunk?.removePlayer(this);
    this.chunk = Chunk.get(code);
    this.chunk.addPlayer(this);
  }
  move(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
  }
}
