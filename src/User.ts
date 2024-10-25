import WebSocket from "ws";

export class User {
  public username: string;
  public ws: WebSocket;

  constructor(username: string, ws: WebSocket) {
    this.username = username;
    this.ws = ws;
  }
}
