export type GameEvent =
  | {
      type: "init";
      userID: string;
    }
  | {
      type: "event";
      details: {
        type: "chunk";
        code: string;
        position: Position;
      };
    };

export type Position = {
  x: number;
  y: number;
};
