import { RawData, WebSocket } from "ws";
import { Chunk } from "./chunk";
import { Player } from "./player";
import { InData, Position } from "./types";
import { log } from "./utils/log";

export class Connection {
  initialized = false;
  currentChunk: Chunk | null = null;
  ws: WebSocket;
  player: Player | null = null;
  static connections: Connection[] = [];
  constructor(ws: WebSocket) {
    this.ws = ws;
    this.ws.on("message", (data) => this.handleMessage(data.toString()));
    Connection.connections.push(this);
  }

  handleMessage(message: string) {
    const data: InData = JSON.parse(message);
    if (data.type === "init") {
      if (Player.isConnected(data.userID)) {
        log("😡", "Player already connected:", data.userID);

        this.ws.send(
          JSON.stringify({
            message: "error",
            details: "already connected",
          })
        );
        this.ws.close();
        const index = Connection.connections.indexOf(this);
        if (index > -1) Connection.connections.splice(index, 1);
        return;
      } else {
        this.initialized = true;
        this.player = new Player(this, data.userID);

        log("🌍 ", "Client connected:", this.player.id);

        this.ws.send(JSON.stringify({ message: "connected" }));
      }
    } else if (data.type === "event") {
      log("📬 ", "Event received", data.details.type);

      if (data.details.type === "chunk") {
        this.moveToChunk(data.details.code);
        this.move(data.details.position);
      }
    }
  }

  moveToChunk(chunk_code: string) {
    if (!this.player || !this.initialized) return this.fail();

    this.currentChunk?.removePlayer(this.player);

    this.currentChunk = Chunk.get(chunk_code);
    this.currentChunk.addPlayer(this.player);
  }

  move(new_pos: Position) {
    if (!this.player || !this.initialized) return this.fail();

    this.player.move(new_pos.x, new_pos.y);

    this.currentChunk?.dispatch({
      type: "event",
      details: {
        type: "move",
        player: {
          id: this.player.id,
          position: new_pos,
        },
      },
    });
  }

  fail() {
    this.ws.send(JSON.stringify({ message: "fail" }));
  }
}
