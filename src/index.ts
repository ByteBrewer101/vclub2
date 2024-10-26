


import express from "express";
import { WebSocketServer } from "ws";
import { RoomManager } from "./RoomManager";
import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
import { parse } from "url";

configDotenv();

const app = express();
const PORT = process.env.WORKING_PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const server = app.listen(PORT, () => {
  console.log("running on " + PORT);
});

const wss = new WebSocketServer({ noServer: true });
const manager = new RoomManager();

// Handle upgrade of HTTP connection to WebSocket with JWT verification
server.on("upgrade", (request, socket, head) => {
  const { query } = parse(request.url || "", true);
  const token = query.token as string;

  if (!token) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    const username = decoded.username;

    // If token is valid, upgrade the connection
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, username);
    });
  } catch (err) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
});

wss.on("connection", (ws, username: string) => {
  manager.addUser(ws, username);

  ws.on("close", () => {
    manager.removeUser(ws);
  });
});