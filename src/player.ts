import { Connection } from "./connection";
import { Position } from "./types";

export class Player {
  connection: Connection;
  id: string;
  position: Position;
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
  move(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
  }
}
