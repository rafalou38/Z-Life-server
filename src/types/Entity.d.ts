export type entitySpawned = {
  type: "entitySpawned";
  entityType: number;
  entityID: string;
  position: Position;
};
export type entityMoved = {
  type: "entityMoved";
  entityID: string;
  position: Position;
  entityType: number;
};
export type entityInteracted = {
  type: "entityInteracted";
  entityID: string;
  entityType: number;
  itemID: string;
  target: Position;
};
export type entityDied = {
  type: "entityDied";
  entityID: string;
  entityType: number;
};
