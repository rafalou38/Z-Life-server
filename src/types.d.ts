export type InData =
  | {
      type: "init";
      credentials: {
        username: string;
        password: string;
      };
    }
  | {
      type: "fetch";
    }
  | {
      type: "ping";
      data: number;
    }
  | {
      type: "event";
      details:
        | {
            type: "chunkJoined";
            code: string;
            position: Position;
          }
        | {
            type: "chunkLeft";
            code: string;
          }
        | {
            type: "interact";
            itemID: string;
            targetPos: Position;
          }
        | {
            type: "move";
            position: Position;
          }
        | {
            type: "chat";
            message: string;
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
      type: "pong";
      data: number;
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
            type: "chunkLeft";
            player: {
              id: string;
            };
          }
        | {
            type: "chunkJoined";
            player: {
              id: string;
              position: Position;
            };
          }
        | {
            type: "chunkInfo";
            players: {
              id: string;
              position: Position;
            }[];
            weather: Weather;
          }
        | {
            type: "chat";
            player: {
              id: string;
            };
            message: string;
          }
        | {
            type: "interact";
            player: {
              id: string;
              currentItem: string;
            };
            target: Position;
          }
        | {
            type: "entitySpawned";
            entityType: number;
            entityID: string;
            position: Position;
          }
        | {
            type: "entityMoved";
            entityID: string;
            position: Position;
            entityType: number;
          };
    };

export type Position = {
  x: number;
  y: number;
};

export type Weather = "Clear" | "Rain" | "Snow" | "Storm";
