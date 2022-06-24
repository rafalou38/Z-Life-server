import { Chunk } from "./chunk";
import { Connection } from "./connection";
import { Player } from "./player";
import { entityDied, entityInteracted, entityMoved } from "./types/Entity";
import { Position } from "./types/types";
import { log } from "./utils/log";

export class Entity {
  controller: Connection;
  type: number;
  id: string;
  position: Position;
  chunk: Chunk;

  static entities: Map<string, Entity> = new Map();

  constructor(con: Connection, id: string, type: number, chunk: Chunk) {
    this.type = type;
    this.controller = con;
    this.id = id;
    this.position = { x: 0, y: 0 };
    this.chunk = chunk;
    Entity.entities.set(this.id, this);
  }

  static initListeners(con: Connection) {
    con.on("event.entitySpawned", Entity.onSpawned);
    con.on(`event.entityMoved`, Entity.onMove);
    con.on(`event.entityInteracted`, Entity.onInteract);
    con.on(`event.entityDied`, Entity.onDeath);
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

  static onMove(details: entityMoved) {
    Entity.entities.get(details.entityID)?.move(details);
  }
  move(details: entityMoved) {
    if (!this.controller.player) return this.controller.fail("not connected");

    this.position = details.position;
    this.chunk.dispatch(
      {
        type: "event",
        details,
      },
      this.controller.player
    );
  }

  static onInteract(details: entityInteracted) {
    Entity.entities.get(details.entityID)?.interact(details);
  }
  interact(details: entityInteracted) {
    if (!this.controller.player) return this.controller.fail("not connected");

    console.log("Entity interacted", details.entityID);
    this.chunk.dispatch(
      {
        type: "event",
        details,
      },
      this.controller.player
    );
  }

  static onDeath(details: entityDied) {
    Entity.entities.get(details.entityID)?.die(details);
  }
  die(details: entityDied) {
    if (!this.controller.player) return this.controller.fail("not connected");

    this.chunk.dispatch(
      {
        type: "event",
        details,
      },
      this.controller.player
    );

    this.chunk.removeEntity(this);
    Entity.entities.delete(this.id);
  }
}
