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
      type: "login success";
    }
  | {
      type: "login error";
      details: string;
    }
  | {
      type: "event";
      details:
        | {
            type: "move";
            player: {
              id: string;
              position: Position;
            };
          }
        | {
            type: "player left";
            player: {
              id: string;
            };
          };
    }
  | {
      type: "fetch";
      details: {
        chunk: "";
        position: {
          x: 0;
          y: 0;
        };
      };
    };

export type Position = {
  x: number;
  y: number;
};
