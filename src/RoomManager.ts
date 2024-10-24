import { Chat, formatAndSendMessage, JoinRoom } from "./Messagetypes";
import { Room } from "./Room";
import WebSocket from "ws";
import { User } from "./User";

export class RoomManager {
  private Rooms: Room[];
  private lobby: WebSocket[];
  private users: User[];

  constructor() {
    this.Rooms = [];
    this.lobby = [];
    this.users = [];
  }

  addUser(ws: WebSocket, username:string) {
    console.log(`Adding user to the manager: ${ws}`);
   
    const currentUser = new User(username,ws)

    this.users.push(currentUser);
    // const currentUser = new User
    this.addHandler(ws);
  }

  removeUser(ws: WebSocket) {
    console.log(`Removing user: ${ws}`);
    const currentRoom = this.findUserRoom(ws);

    if (currentRoom) {
      this.handleRoomExit(ws, currentRoom);
    } else {
      this.removeFromLobby(ws);
    }

    this.users = this.filterUser(ws, this.users);
  }

  private addHandler(ws: WebSocket) {
    ws.on("message", (data: string) => {
      const currentMessage = JSON.parse(data);
      console.log(`Received message: ${JSON.stringify(currentMessage)}`);

      if (currentMessage.type === JoinRoom) {
        this.JoinLogic(ws);
      }

      if (currentMessage.type === Chat) {
        this.handleChatMessage(ws, currentMessage.content);
      }
    });
  }

  private JoinLogic(ws: WebSocket) {
    this.disbandRoom(ws);
    this.sendSystemMessage(ws,"Waiting for someone to join")

    if (this.isInLobby(ws)) {
      return;
    }

    if (this.lobbyHasUsers(ws)) {
      const partner = this.lobby.shift();
      this.createRoom(ws, partner);
    } else {
      this.addToLobby(ws);
    }
  }

  private disbandRoom(ws: WebSocket) {
    const roomToDisband = this.findUserRoom(ws);

    if (roomToDisband) {
      this.handleRoomDisband(ws, roomToDisband);
    }
  }

  // Helper Functions

  private findUserRoom(ws: WebSocket): Room | undefined {
    return this.Rooms.find((room) => room.checkExistance(ws));
  }

  private handleRoomExit(ws: WebSocket, currentRoom: Room) {
    console.log(`User ${ws} is part of a room. Notifying partner.`);
    const otherUser = this.getOtherUser(ws, currentRoom);
    this.sendSystemMessage(otherUser, "Your partner has disconnected");

    console.log(`Moving ${otherUser} back to the lobby.`);
    this.addToLobby(otherUser);

    this.removeRoom(currentRoom);
  }

  private handleChatMessage(ws: WebSocket, messageContent: string) {
    const currentRoom = this.findUserRoom(ws);
    if (currentRoom) {
      currentRoom.sendMessage(ws, messageContent);
    } else {
      console.log(`User ${ws} is not in a room.`);
    }
  }

  private handleRoomDisband(ws: WebSocket, roomToDisband: Room) {
    console.log(`Disbanding room for user ${ws}.`);
    const otherUser = this.getOtherUser(ws, roomToDisband);

    roomToDisband.broadcastInRoom("Looking for a new  match")


   

    this.addToLobby(otherUser);
    this.removeRoom(roomToDisband);

    console.log(`Room disbanded, moving partner to the lobby.`);
  }

  private removeFromLobby(ws: WebSocket) {
    console.log(`User ${ws} is in the lobby. Removing from lobby.`);
    this.lobby = this.filterUser(ws, this.lobby);
  }

  private addToLobby(ws: WebSocket) {
    this.lobby.push(ws);
  }

  private removeRoom(room: Room) {
    this.Rooms = this.Rooms.filter((r) => r !== room);
  }

  private lobbyHasUsers(ws: WebSocket): boolean {
    return this.lobby.length >= 1 && this.lobby[0] !== ws;
  }

  private isInLobby(ws: WebSocket): boolean {
    return this.lobby.includes(ws);
  }

  private createRoom(ws: WebSocket, partner: WebSocket | undefined) {
    if (partner) {
      const currentRoom = new Room(ws, partner);
      this.Rooms.push(currentRoom);
      currentRoom.broadcastInRoom("connected");
    }
  }

  private getOtherUser(ws: WebSocket, room: Room): WebSocket {
    return room.user1 === ws ? room.user2 : room.user1;
  }

  private sendSystemMessage(ws: WebSocket, message: string) {
    formatAndSendMessage(ws, message, "system");
  }

  private filterUser(ws: WebSocket, list: WebSocket[]): WebSocket[] {
    return list.filter((user) => user !== ws);
  }
}
