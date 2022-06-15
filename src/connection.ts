import { RawData, WebSocket } from "ws";
import { Chunk } from "./chunk";
import { Player } from "./player";
import { InData, OutData, Position } from "./types";
import { log } from "./utils/log";

export class Connection {
  initialized = false;
  ws: WebSocket;
  player: Player | null = null;
  static connections: Connection[] = [];
  constructor(ws: WebSocket) {
    this.ws = ws;
    this.ws.on("message", (data) => this.handleMessage(data.toString()));
    this.ws.on("close", (code, reason) => {
      this.handleClose();
    });
    Connection.connections.push(this);
  }

  handleClose() {
    if (!this.player) return;
    this.player.chunk?.dispatch(
      {
        type: "event",
        details: {
          type: "chunkLeft",
          player: {
            id: this.player.id,
          },
        },
      },
      this.player
    );
    this.player.disconnect();

    const index = Connection.connections.indexOf(this);
    if (index > -1) Connection.connections.splice(index, 1);
  }

  handleMessage(message: string) {
    const data: InData = JSON.parse(message);
    log(`Received:`, data);
    if (data.type === "ping") {
      this.ws.send(JSON.stringify({ type: "pong", data: data.data }));
    } else if (data.type === "init") {
      if (Player.isConnected(data.credentials.username)) {
        log("😡", "Player already connected:", data.credentials.username);

        this.ws.send(
          JSON.stringify({
            type: "login error",
            details: "already connected",
          })
        );
        this.ws.close();
        const index = Connection.connections.indexOf(this);
        if (index > -1) Connection.connections.splice(index, 1);
        return;
      } else {
        this.initialized = true;
        this.player = new Player(this, data.credentials.username);

        log("🌍 ", "Client connected:", this.player.id);

        this.ws.send(
          JSON.stringify({
            type: "login success",
          })
        );
      }
    } else if (data.type === "event") {
      log("📬 ", "Event received", data.details.type);

      if (data.details.type === "chunkJoined") {
        this.move(data.details.position);
        this.moveToChunk(data.details.code);
        this.sendInfo();
      } else if (data.details.type === "move") {
        this.move(data.details.position);
      } else if (data.details.type === "interact") {
        this.player?.interact(data.details.itemID, data.details.targetPos);
      } else if (data.details.type === "chat") {
        this.player?.chunk?.dispatch(
          {
            type: "event",
            details: {
              type: "chat",
              player: {
                id: this.player.id,
              },
              message: data.details.message,
            },
          },
          this.player
        );
      } else if (data.details.type === "chunkLeft") {
        this.moveToChunk(data.details.code);
        this.sendInfo();
      }
    } else if (data.type === "fetch") {
      if (!this.player) return this.fail("not connected");
      this.sendInfo();
    }
  }

  moveToChunk(chunk_code: string) {
    if (!this.player || !this.initialized) return this.fail("not connected");
    this.player.chunk?.dispatch(
      {
        type: "event",
        details: {
          type: "chunkLeft",
          player: {
            id: this.player.id,
          },
        },
      },
      this.player
    );
    this.player.changeChunk(chunk_code);
    this.player.chunk?.dispatch(
      {
        type: "event",
        details: {
          type: "chunkJoined",
          player: {
            id: this.player.id,
            position: this.player.position,
          },
        },
      },
      this.player
    );
  }

  move(new_pos: Position) {
    if (!this.player || !this.initialized) return this.fail("not connected");

    this.player.move(new_pos.x, new_pos.y);

    this.player.chunk?.dispatch(
      {
        type: "event",
        details: {
          type: "move",
          player: {
            id: this.player.id,
            position: new_pos,
          },
        },
      },
      this.player
    );
  }

  sendInfo() {
    if (!this.player || !this.initialized) return this.fail("not connected");
    this.ws.send(
      JSON.stringify({
        type: "event",
        details: {
          type: "chunkInfo",
          players: this.player.chunk?.players
            .filter((p) => p.id != this.player?.id)
            .map((p) => ({ id: p.id, position: p.position })),
          weather: "Clear",
        },
      } as OutData)
    );
  }

  fail(reason: string) {
    this.ws.send(JSON.stringify({ type: "fail", details: reason }));
  }
}
