export type InData =
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

export type OutData =
  | {
      type: "connected";
    }
  | {
      type: "fail";
    }
  | {
      type: "event";
      details: {
        type: "move";
        player: {
          id: string;
          position: Position;
        };
      };
    };

export type Position = {
  x: number;
  y: number;
};
