import chalk from "chalk";
import { WebSocketServer } from "ws";
import { Connection } from "./connection";
import { log } from "./utils/log";
import { isString } from "./utils/types";

const server = new WebSocketServer({
  port: parseInt(process.env.PORT || "") || 8080,
});

server.once("listening", () => {
  let address = server.address();
  if (!isString(address)) address = address.address + ":" + address.port;
  log("☁️ ", "Server started", address, " ⚡");
});

server.on("connection", (ws) => {
  new Connection(ws);
});
