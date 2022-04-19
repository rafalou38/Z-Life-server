import { Connection } from "./connection";
import { Position } from "./types";

export class Player {
  connection: Connection;
  id: string;
  position: Position;
  constructor(con: Connection, id: string) {
    this.connection = con;
    this.id = id;
    this.position = { x: 0, y: 0 };
  }
  move(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
  }
}
