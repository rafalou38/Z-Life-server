const WS = require("ws");

(async () => {
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
          console.log(message.message, ids[i]);
          resolve(true);
        });
      });
    })
  );

  wss.forEach((ws, i) => {
    ws.on("message", (msg) => {
      console.log(`${ids[i]}(${i}) recievied:`, JSON.parse(msg));
    });
  });

  wss[0].send(
    JSON.stringify({
      type: "event",
      details: {
        type: "chunk",
        code: "A1",
        position: {
          x: 0,
          y: 0,
        },
      },
    })
  );
  console.log("WSS0, positioned");
  wss[1].send(
    JSON.stringify({
      type: "event",
      details: {
        type: "chunk",
        code: "A1",
        position: {
          x: 0,
          y: 0,
        },
      },
    })
  );
  console.log("WSS1, positioned");
  wss[2].send(
    JSON.stringify({
      type: "event",
      details: {
        type: "chunk",
        code: "A2",
        position: {
          x: 0,
          y: 0,
        },
      },
    })
  );
  console.log("WSS2, positioned");
  wss[3].send(
    JSON.stringify({
      type: "event",
      details: {
        type: "chunk",
        code: "A3",
        position: {
          x: 0,
          y: 0,
        },
      },
    })
  );
  console.log("WSS3, positioned");

  setTimeout(() => {
    wss[0].send(
      JSON.stringify({
        type: "event",
        details: {
          type: "move",
          position: {
            x: 1,
            y: 1,
          },
        },
      })
    );
    console.log("WSS0, moved");
    setTimeout(() => {
      wss[0].send(
        JSON.stringify({
          type: "event",
          details: {
            type: "chunk",
            code: "A2",
            position: {
              x: 1,
              y: 1,
            },
          },
        })
      );
      console.log("WSS0, moved chunk");
    }, 500);
  }, 500);
})();
