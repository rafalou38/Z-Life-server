export type InData =
  | {
      type: "init";
      userID: string;
    }
  | {
      type: "fetch";
    }
  | {
      type: "event";
      details:
        | {
            type: "chunk";
            code: string;
            position: Position;
          }
        | {
            type: "move";
            position: Position;
          };
    };

export type OutData =
  | {
      type: "connected";
    }
  | {
      type: "fail";
      details: string;
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
    }
  | {
      type: "fetch";
      chunk: "";
      position: {
        x: 0;
        y: 0;
      };
    };

export type Position = {
  x: number;
  y: number;
};
