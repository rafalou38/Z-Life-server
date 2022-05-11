import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import WebSocket from "ws";

const BASE_DIR = "C:/z-life-records";
const WS_SERVER = "ws://localhost:8080";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const dir = readdirSync(BASE_DIR);
const records = dir.map((file) => {
  const path = join(BASE_DIR, file);
  const content = readFileSync(path, "utf8").toString();
  return JSON.parse(content);
});

records.forEach(async (record) => {
  await wait(1000);
  const ws = new WebSocket(WS_SERVER);
  await new Promise((resolve) => (ws.onopen = resolve));

  let lastAction = 0;

  for (const [raw_delay, raw_action] of Object.entries(record)) {
    const delay = parseFloat(raw_delay);
    const action = raw_action;

    await wait(delay - lastAction);

    ws.send(action as string);

    lastAction = delay;
  }

  ws.close();
});
