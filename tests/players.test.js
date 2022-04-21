const WS = require("ws");

const ws_url = "ws://localhost:8080";

let wss = [
  new WS.WebSocket(ws_url),
  new WS.WebSocket(ws_url),
  new WS.WebSocket(ws_url),
  new WS.WebSocket(ws_url),
];

let ids = [
  Math.random().toString(36).substring(2),
  Math.random().toString(36).substring(2),
  Math.random().toString(36).substring(2),
  Math.random().toString(36).substring(2),
];
const positions = [
  {
    code: "A1", // A3
    position: {
      x: 2,
      y: 2,
    },
  },
  {
    code: "A1",
    position: {
      x: 4,
      y: 2,
    },
  },
  {
    code: "A2",
    position: {
      x: 4,
      y: 2,
    },
  },
  {
    code: "A3",
    position: {
      x: 2,
      y: 4,
    },
  },
];

// jest.setTimeout(1000);

beforeEach(async () => {
  wss = [
    new WS.WebSocket(ws_url),
    new WS.WebSocket(ws_url),
    new WS.WebSocket(ws_url),
    new WS.WebSocket(ws_url),
  ];

  ids = [
    Math.random().toString(36).substring(2),
    Math.random().toString(36).substring(2),
    Math.random().toString(36).substring(2),
    Math.random().toString(36).substring(2),
  ];
  await Promise.all(
    wss.map((ws, i) => {
      return new Promise((resolve, reject) => {
        ws.onopen = resolve;
        ws.onerror = (e) => reject(e.message);
      });
    })
  );
  await Promise.all(
    wss.map((ws, i) => {
      userID = ids[i];
      ws.send(JSON.stringify({ type: "init", userID }));

      return new Promise((resolve, reject) => {
        ws.once("message", (data) => {
          const message = JSON.parse(data);
          expect(message.type).toBe("login success");
          resolve(true);
        });
      });
    })
  );

  for (let i = 0; i < wss.length; i++) {
    wss[i].send(
      JSON.stringify({
        type: "event",
        details: {
          type: "chunk",
          ...positions[i],
        },
      })
    );
  }

  await new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);
  });
});

test("Change chunk & can fetch position + chunk", async () => {
  for (let i = 0; i < wss.length; i++) {
    wss[i].send(
      JSON.stringify({
        type: "fetch",
      })
    );

    await new Promise((resolve, reject) => {
      wss[i].on("message", (raw) => {
        const data = JSON.parse(raw);
        if (data.type !== "fetch") return;

        expect(data).toEqual({
          type: "fetch",
          details: {
            chunk: positions[i].code,
            position: {
              x: positions[i].position.x,
              y: positions[i].position.y,
            },
          },
        });
        resolve();
      });
    });
  }
});

test("Move dispatch to chunk and only to chunk", async () => {
  let newPos = {
    x: 1,
    y: 2,
  };
  wss[0].send(
    JSON.stringify({
      type: "event",
      details: {
        type: "move",
        position: newPos,
      },
    })
  );

  await Promise.all([
    // WS 1 should receive move event
    new Promise((resolve, reject) => {
      wss[1].on("message", (raw) => {
        const data = JSON.parse(raw);
        if (data.type !== "event" && data.details.type !== "move")
          return console.log(data);

        expect(data).toEqual({
          type: "event",
          details: {
            type: "move",
            player: {
              id: ids[0],
              position: newPos,
            },
          },
        });
        resolve();
      });
    }),

    // wss[2] not in the same chunk
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve();
      }, 500);

      wss[2].on("message", (raw) => {
        const data = JSON.parse(raw);
        if (data.type !== "event" && data.details.type !== "move") return;

        setTimeout(timeout);
        reject();
      });
    }),
  ]);

  // wss[1] in the same chunk
});

test("Change chunk dispatch to chunk, new chunk only", async () => {
  wss[0].send(
    JSON.stringify({
      type: "event",
      details: {
        type: "chunk",
        code: "A3",
        position: { x: 0, y: 0 },
      },
    })
  );

  await Promise.all([
    // wss[1] in the same old chunk
    // wss[1] does not receive wss[0] moved
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve();
      }, 50);

      wss[1].on("message", (raw) => {
        const data = JSON.parse(raw);
        if (data.type !== "event" || data.details.type !== "move") return;

        clearTimeout(timeout);
        reject();
      });
    }),

    // wss[1] in the same old
    // wss[1] receive wss[0] left chunk
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject("Did not receive wss[1] left chunk");
      }, 1000);

      wss[1].once("message", (raw) => {
        const data = JSON.parse(raw);
        if (data.type !== "event" && data.details.type !== "player left")
          return console.log(data);
        clearTimeout(timeout);
        expect(data).toEqual({
          type: "event",
          details: {
            type: "player left",
            player: {
              id: ids[0],
            },
          },
        });
        resolve();
      });
    }),

    // wss[3] is in target chunk
    // wss[3] receive wss[0] moved
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject("wss[3] Did not receive wss[0] moved");
      }, 50);

      wss[3].once("message", (raw) => {
        const data = JSON.parse(raw);
        if (data.type !== "event" && data.details.type !== "move") return;
        clearTimeout(timeout);
        expect(data).toEqual({
          type: "event",
          details: {
            type: "move",
            player: {
              id: ids[0],
              position: { x: 0, y: 0 },
            },
          },
        });
        resolve();
      });
    }),
    // wss[3] is in target chunk
    // wss[3] does not receive wss[0] left chunk
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve();
      }, 50);

      wss[3].once("message", (raw) => {
        const data = JSON.parse(raw);
        if (data.type !== "event" || data.details.type !== "player left")
          return;

        clearTimeout(timeout);
        reject();
      });
    }),
  ]);
});

test("disconnect dispatch to chunk", async () => {
  wss[0].close();

  await Promise.all([
    // wss[1] in the same chunk
    // wss[1] receive wss[0] left chunk
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject("wss[1] Did not receive wss[0] left chunk");
      }, 1000);

      wss[1].on("message", (raw) => {
        const data = JSON.parse(raw);
        if (
          (data.type !== "event" && data.details.type !== "player left") ||
          data.details.player.id !== ids[0]
        )
          return;

        clearTimeout(timeout);
        resolve();
      });
    }),

    // wss[2] not in the same chunk
    // wss[2] does not receive wss[0] left chunk
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve("wss[2] Did not receive wss[0] left chunk 👌");
      }, 1000);

      wss[2].on("message", (raw) => {
        const data = JSON.parse(raw);
        if (
          (data.type !== "event" && data.details.type !== "player left") ||
          data.details.player.id !== ids[0]
        )
          return;

        clearTimeout(timeout);
        reject();
      });
    }),
  ]);
});

afterEach(() => {
  wss.forEach((ws) => (ws.readyState != ws.CLOSED ? ws.close() : null));
});
