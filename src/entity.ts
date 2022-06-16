import { Chunk } from "./chunk";
import { Connection } from "./connection";
import { Player } from "./player";
import { Position } from "./types";
import { log } from "./utils/log";

export class Entity {
  controller: Connection;
  type: number;
  id: string;
  position: Position;
  chunk: Chunk;
  constructor(con: Connection, id: string, type: number, chunk: Chunk) {
    this.type = type;
    this.controller = con;
    this.id = id;
    this.position = { x: 0, y: 0 };
    this.chunk = chunk;

    con.on(`event.entityMoved`, this.onMove.bind(this));
  }

  static onSpawned(
    details: {
      type: "entitySpawned";
      entityType: number;
      entityID: string;
      position: Position;
    },
    con: Connection
  ) {
    if (!con.player?.chunk) return con.fail("Player not in a chunk");

    console.log("Entity spawned", details);
    const entity = new Entity(
      con,
      details.entityID,
      details.entityType,
      con.player.chunk
    );
    entity.chunk.addEntity(entity);
    entity.chunk.dispatch(
      {
        type: "event",
        details,
      },
      con.player
    );
  }

  onMove(details: {
    type: "entityMoved";
    entityID: string;
    position: Position;
    entityType: number;
  }) {
    if (details.entityID !== this.id) return;
    console.log("Entity moved", details.entityID);

    this.position = details.position;
    this.chunk.dispatch({
      type: "event",
      details,
    });
  }

  //   interact(itemID: string, target: Position) {
  //     if (!this.controller.player) return this.controller.fail("not connected");

  //     this.chunk?.dispatch(
  //       {
  //         type: "event",
  //         details: {
  //           type: "interact",
  //           player: {
  //             id: this.id,
  //             currentItem: itemID,
  //           },
  //           target,
  //         },
  //       },
  //       this.controller.player
  //     );
  //   }
}
