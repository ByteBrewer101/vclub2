

import { Chat, formatAndSendMessage, JoinRoom } from "./Messagetypes";
import { Room } from "./Room";
import WebSocket from "ws";
import { User } from "./User";

export class RoomManager {
  private Rooms: Room[];
  private lobby: User[];
  private users: User[];

  constructor() {
    this.Rooms = [];
    this.lobby = [];
    this.users = [];
  }

  addUser(ws: WebSocket, username: string) {
    console.log(`Adding user to the manager: ${username}`);
    const currentUser = new User(username, ws);
    this.users.push(currentUser);
    this.addHandler(ws);
  }

  removeUser(ws: WebSocket) {
    console.log(`Removing user: ${this.getUserByWs(ws)?.username}`);
    const currentRoom = this.findUserRoom(ws);

    if (currentRoom) {
      this.handleRoomExit(ws, currentRoom);
    } else {
      this.removeFromLobby(ws);
    }

    this.users = this.users.filter((user) => user.ws !== ws);
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
    this.sendSystemMessage(ws, "Waiting for someone to join");

    if (this.isInLobby(ws)) {
      return;
    }

    if (this.lobbyHasUsers(ws)) {
      const partner = this.lobby.shift();
      if (partner) {
        this.createRoom(ws, partner.ws);
      }
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

  private getUserByWs(ws: WebSocket): User | undefined {
    return this.users.find((user) => user.ws === ws);
  }

  private handleRoomExit(ws: WebSocket, currentRoom: Room) {
    const otherWs = this.getOtherUser(ws, currentRoom);
    const otherUser = this.getUserByWs(otherWs);

    if (otherUser) {
      console.log(
        `User ${
          this.getUserByWs(ws)?.username
        } is leaving room. Notifying partner ${otherUser.username}.`
      );
      this.sendSystemMessage(otherWs, "Your partner has disconnected");
      console.log(`Moving ${otherUser.username} back to the lobby.`);
      this.addToLobby(otherWs);
    }

    this.removeRoom(currentRoom);
  }

  private handleChatMessage(ws: WebSocket, messageContent: string) {
    const currentRoom = this.findUserRoom(ws);
    if (currentRoom) {
      currentRoom.sendMessage(ws, messageContent);
    } else {
      console.log(`User ${this.getUserByWs(ws)?.username} is not in a room.`);
    }
  }

  private handleRoomDisband(ws: WebSocket, roomToDisband: Room) {
    const otherWs = this.getOtherUser(ws, roomToDisband);
    const otherUser = this.getUserByWs(otherWs);

    if (otherUser) {
      console.log(
        `Disbanding room for user ${this.getUserByWs(ws)?.username}.`
      );
      roomToDisband.broadcastInRoom("Looking for a new match");
      this.addToLobby(otherWs);
    }

    this.removeRoom(roomToDisband);
    console.log(`Room disbanded, moving partner to the lobby.`);
  }

  private removeFromLobby(ws: WebSocket) {
    const user = this.getUserByWs(ws);
    if (user) {
      console.log(
        `User ${user.username} is in the lobby. Removing from lobby.`
      );
      this.lobby = this.lobby.filter((lobbyUser) => lobbyUser.ws !== ws);
    }
  }

  private addToLobby(ws: WebSocket) {
    const user = this.getUserByWs(ws);
    if (user) {
      this.lobby.push(user);
    }
  }

  private removeRoom(room: Room) {
    this.Rooms = this.Rooms.filter((r) => r !== room);
  }

  private lobbyHasUsers(ws: WebSocket): boolean {
    return this.lobby.length >= 1 && this.lobby[0].ws !== ws;
  }

  private isInLobby(ws: WebSocket): boolean {
    return this.lobby.some((user) => user.ws === ws);
  }

  private createRoom(ws: WebSocket, partner: WebSocket) {
    const user1 = this.getUserByWs(ws);
    const user2 = this.getUserByWs(partner);

    if (user1 && user2) {
      const currentRoom = new Room(ws, partner, user1.username, user2.username);
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
}