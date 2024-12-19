import WebSocket from "ws";

export class User {
  public username: string;
  public ws: WebSocket;
  public userImage:string

  constructor(username: string, ws: WebSocket, userImage:string) {
    this.username = username;
    this.ws = ws;
    this.userImage = userImage;
  }

  public getUserData(){
    return {
      username :this.username,
      userImage : this.userImage
    }
  }
}
