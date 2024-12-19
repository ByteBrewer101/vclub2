import express from "express";
import { WebSocketServer } from "ws";
import { RoomManager } from "./RoomManager";
import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
import { parse } from "url";
import axios = require("axios");
configDotenv();

const app = express();
app.use(express.json());
const PORT = process.env.WORKING_PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("running on " + PORT);
});

const wss = new WebSocketServer({ noServer: true });
const manager = new RoomManager();

app.get("/roomdata", (req, res) => {
  const roomId = req.body.roomId;

  const currentRoom = manager.getRoom(roomId);

 

  const u1 = currentRoom?.userobj1.username
  const u2 = currentRoom?.userobj2.username;
  const u1Image = currentRoom?.userobj1.userImage
  const u2Image = currentRoom?.userobj2.userImage;

  console.log(currentRoom?.userobj1.username);
  console.log(currentRoom?.userobj2.username);

  res.json({
    usr1:{
      u1,
      u1Image
    },
    usr2:{
      u2,
      u2Image
    }
  });
});

server.on("upgrade", async (request, socket, head) => {
  const { query } = parse(request.url || "", true);
  const token = query.token as string;

  if (!token) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();

    return;
  }

  try {
    const decoded = jwt.decode(token);
    const userId = decoded?.sub;
    const { data } = await getUserFromClerk(userId);
    const username =data.first_name;
    const userImage =data.image_url;

    // const username = "test";
    // const userImage = "testimg";

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, username, userImage);
    });
  } catch (err) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
});

wss.on(
  "connection",
  (ws: import("ws"), username: string, userImage: string) => {
    manager.addUser(ws, username, userImage);

    ws.on("close", () => {
      manager.removeUser(ws);
    });
  }
);

//get user

async function getUserFromClerk(userID: any): Promise<any> {
  const url = process.env.API_URL;
  const auth = process.env.API_SECRET;

  const answer = await axios.get(`${url}/users/${userID}`, {
    headers: {
      Authorization: `Bearer ${auth}`,
    },
  });

  return answer;
}
