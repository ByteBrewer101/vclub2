import WebSocket from "ws";
import { formatAndSendMessage } from "./Messagetypes";

export class Room {
  public user1: WebSocket;
  public user2: WebSocket;

  constructor(ws1: WebSocket, ws2: WebSocket) {
    this.user1 = ws1;
    this.user2 = ws2;
  }

  public sendMessage(sender: WebSocket, msg: string) {
    if (this.user1 === sender) {
      formatAndSendMessage(this.user2, msg, "user 2");
    } else formatAndSendMessage(this.user1, msg, "user 1");
  }

  public broadcastInRoom(msg: string) {
    formatAndSendMessage(this.user1, msg, "system");
    formatAndSendMessage(this.user2, msg, "system");
  }

  public removeUser() {
    //remove user
  }
}
