import WebSocket from "ws";

export class Room {
  public user1: WebSocket;
  public user2: WebSocket;

  constructor(ws1: WebSocket, ws2: WebSocket) {
    this.user1 = ws1;
    this.user2 = ws2;
  }

  public sendMessage(sender: WebSocket, msg: string) {
    if (this.user1 === sender) {
      this.user2.send(msg);
    } else this.user1.send(msg);
  }

  public broadcastInRoom(msg:string){
    this.user1.send(msg)
    this.user2.send(msg)
  }

  public removeUser() {
    //remove user
  }
}
