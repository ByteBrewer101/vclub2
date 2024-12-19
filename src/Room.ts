
import WebSocket from "ws";
import { formatAndSendMessage } from "./Messagetypes";
import { uuid } from "uuidv4";
import { User } from "./User";

export class Room {
  public user1: WebSocket;
  public user2: WebSocket;
  public username1: string;
  public username2: string;
  //
  private roomId: string;

  public userobj1: User;
  public userobj2: User;

  constructor(
    ws1: WebSocket,
    ws2: WebSocket,
    username1: string,
    username2: string,
    userobj1: User,
    userobj2: User
  ) {
    this.user1 = ws1;
    this.user2 = ws2;
    this.username1 = username1;
    this.username2 = username2;
    this.userobj1 = userobj1;
    this.userobj2 = userobj2;
    //
    this.roomId = uuid();
    console.log(this.roomId);
  }

  public sendMessage(sender: WebSocket, msg: string) {
    if (this.user1 === sender) {
      formatAndSendMessage(this.user2, msg, this.username1);
    } else {
      formatAndSendMessage(this.user1, msg, this.username2);
    }
  }

  //
  public getRoomID() {
    return this.roomId;
  }

  public getUsers() {}

  //
  public broadcastInRoom(msg: string) {
    console.log(this.roomId);
    formatAndSendMessage(this.user1, msg, "system");
    formatAndSendMessage(this.user2, msg, "system");
  }

  public broadcastInRoomID(msg: string) {
    console.log(this.roomId);
    formatAndSendMessage(this.user1, msg, "RoomID");
    formatAndSendMessage(this.user2, msg, "RoomID");
  }

  public checkExistance(ws: WebSocket) {
    return this.user1 === ws || this.user2 === ws;
  }
}





