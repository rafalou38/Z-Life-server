const WS = require("ws");

const ws_url = "ws://localhost:8080";

const wss = [
  new WS.WebSocket(ws_url),
  new WS.WebSocket(ws_url),
  new WS.WebSocket(ws_url),
  new WS.WebSocket(ws_url),
];

const ids = [
  Math.random().toString(36).substring(7),
  Math.random().toString(36).substring(7),
  Math.random().toString(36).substring(7),
];
ids.push(ids[0]);

test("Connection opened", async () => {
  await Promise.all(
    wss.map((ws, i) => {
      const open = new Promise((resolve, reject) => {
        ws.onopen = resolve;
        ws.onerror = (e) => reject(e.message);
      });

      return expect(open).resolves.toBeTruthy();
    })
  );
});

jest.setTimeout(100);
test("Connection Initialises", async () => {
  let userID = "";
  for (let i = 0; i < wss.length - 1; i++) {
    const ws = wss[i];
    userID = ids[i];

    ws.send(JSON.stringify({ type: "init", userID }));

    const connected = new Promise((resolve, reject) => {
      ws.once("message", (data) => {
        const message = JSON.parse(data);
        expect(message.message).toBe("connected");
        resolve(true);
      });
    });

    await expect(connected).resolves.toBeTruthy();
  }
});
test("Does not allow the same user to connect multiple times", async () => {
  const ws = wss.at(-1);
  ws.send(JSON.stringify({ type: "init", userID: ids.at(-1) }));

  const connected = new Promise((resolve, reject) => {
    ws.once("message", (data) => {
      const message = JSON.parse(data);
      expect(message.message).toBe("error");
      expect(message.details).toBe("already connected");
      resolve(true);
    });
  });

  await expect(connected).resolves.toBeTruthy();
  const closed = new Promise((resolve, reject) => {
    ws.once("close", () => resolve(true));
  });

  await expect(closed).resolves.toBeTruthy();
});

afterAll(() => {
  wss.forEach((ws) => ws.close());
});
