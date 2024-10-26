
import WebSocket from "ws";
import { formatAndSendMessage } from "./Messagetypes";

export class Room {
  public user1: WebSocket;
  public user2: WebSocket;
  private username1: string;
  private username2: string;

  constructor(
    ws1: WebSocket,
    ws2: WebSocket,
    username1: string,
    username2: string
  ) {
    this.user1 = ws1;
    this.user2 = ws2;
    this.username1 = username1;
    this.username2 = username2;
  }

  public sendMessage(sender: WebSocket, msg: string) {
    if (this.user1 === sender) {
      formatAndSendMessage(this.user2, msg, this.username1);
    } else {
      formatAndSendMessage(this.user1, msg, this.username2);
    }
  }

  public broadcastInRoom(msg: string) {
    formatAndSendMessage(this.user1, msg, "system");
    formatAndSendMessage(this.user2, msg, "system");
  }

  public checkExistance(ws: WebSocket) {
    return this.user1 === ws || this.user2 === ws;
  }
}