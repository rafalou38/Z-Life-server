import { RawData, WebSocket } from "ws";
import { Chunk } from "./chunk";
import { GameEvent } from "./types";
import { log } from "./utils/log";

export class Connection {
  initialized = false;
  currentChunk: Chunk | null = null;
  ws: WebSocket;
  userID: string | null = null;
  constructor(ws: WebSocket) {
    this.ws = ws;

    this.ws.on("message", (data) => this.handleMessage(data.toString()));
  }

  handleMessage(message: string) {
    const data: GameEvent = JSON.parse(message);
    if (data.type === "init") {
      this.initialized = true;
      this.userID = data.userID;
      log("🌍 ", "Client connected:", this.userID);
      this.ws.send(JSON.stringify({ message: "connected" }));
    } else if (data.type === "event") {
      log("📬 ", "Event received", data.details.type);

      if (data.details.type === "chunk") {
        this.moveToChunk(data.details.code);
      }
    }
  }

  moveToChunk(chunk_code: string) {
    this.currentChunk?.removePlayer(this);

    this.currentChunk = Chunk.get(chunk_code);
    this.currentChunk.addPlayer(this);
  }
}
