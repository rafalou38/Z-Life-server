const WS = require("ws");

const ws_url = "ws://localhost:8080";

const wss = [
  new WS.WebSocket(ws_url),
  new WS.WebSocket(ws_url),
  new WS.WebSocket(ws_url),
  new WS.WebSocket(ws_url),
];

const ids = [
  Math.random().toString(36).substring(5),
  Math.random().toString(36).substring(5),
  Math.random().toString(36).substring(5),
  Math.random().toString(36).substring(5),
];
const positions = [
  {
    code: "A1",
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
    code: "A2",
    position: {
      x: 2,
      y: 4,
    },
  },
];

jest.setTimeout(100);

beforeAll(async () => {
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
          expect(message.message).toBe("connected");
          resolve(true);
        });
      });
    })
  );
});

test("Change chunk & can fetch position + chunk", async () => {
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
          chunk: positions[i].code,
          position: {
            x: positions[i].position.x,
            y: positions[i].position.y,
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

  // wss[1] in the same chunk
  await new Promise((resolve, reject) => {
    wss[1].once("message", (raw) => {
      const data = JSON.parse(raw);
      if (data.type !== "event" && data.details.type !== "move") return;
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
  });

  // wss[2] not in the same chunk
  await new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      resolve();
    }, 50);

    wss[2].once("message", (raw) => {
      const data = JSON.parse(raw);
      expect(data.type !== "event" && data.details.type !== "move").toBe(true);
      clearInterval(interval);
      reject();
    });
  });
});

afterAll(() => {
  wss.forEach((ws) => ws.close());
});
