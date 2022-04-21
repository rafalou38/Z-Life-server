import { Chunk } from "./chunk";
import { Connection } from "./connection";
import { Position } from "./types";
import { log } from "./utils/log";

export class Player {
  connection: Connection;
  id: string;
  position: Position;
  chunk: Chunk | null = null;
  static players: Map<string, Player> = new Map();
  constructor(con: Connection, id: string) {
    this.connection = con;
    this.id = id;
    this.position = { x: 0, y: 0 };
    Player.players.set(id, this);
  }
  static isConnected(id: string) {
    return Player.players.has(id);
  }
  disconnect() {
    log(this.id, "disconnected");
    this.chunk?.removePlayer(this);
    Player.players.delete(this.id);
  }
  changeChunk(code: string) {
    log(this.id, "changed chunk", this.chunk?.code, "->", code);
    this.chunk?.removePlayer(this);
    this.chunk = Chunk.get(code);
    this.chunk.addPlayer(this);
  }
  move(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
  }
}
