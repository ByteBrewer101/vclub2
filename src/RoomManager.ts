import { Chat, formatAndSendMessage, JoinRoom } from "./Messagetypes";
import { Room } from "./Room";
import WebSocket from "ws";

export class RoomManager {
  private Rooms: Room[];
  private lobby: WebSocket[];
  private users: WebSocket[];

  constructor() {
    this.Rooms = [];
    this.lobby = [];
    this.users = [];
  }

  addUser(ws: WebSocket) {
    console.log(`Adding user to the manager: ${ws}`);
    this.users.push(ws);
    this.addHandler(ws);
  }

  removeUser(ws: WebSocket) {
    console.log(`Removing user: ${ws}`);
    const currentRoom = this.Rooms.find(
      (room) => room.user1 === ws || room.user2 === ws
    );

    if (currentRoom) {
      console.log(`User ${ws} is part of room. Notifying partner.`);
      const otherUser =
        currentRoom.user1 === ws ? currentRoom.user2 : currentRoom.user1;
      formatAndSendMessage(otherUser,"Your partner has disconnected","System")

      console.log(`Moving ${otherUser} back to the lobby.`);
      this.lobby.push(otherUser);

      console.log(`Removing room from the list.`);
      this.Rooms = this.Rooms.filter((room) => room !== currentRoom);
    } else {
      console.log(`User ${ws} is in the lobby. Removing from lobby.`);
      this.lobby = this.lobby.filter((user) => user !== ws);
    }

    this.users = this.users.filter((user) => user !== ws);
  }

  private addHandler(ws: WebSocket) {
    ws.on("message", (data: string) => {
      const currentMessage = JSON.parse(data);
      console.log(`Received message: ${JSON.stringify(currentMessage)}`);

      if (currentMessage.type === JoinRoom) {
        console.log(`User ${ws} is attempting to join a room.`);
        // Attempt to pair with a user in the lobby
        if (this.lobby.length >=2) {
          const partner = this.lobby.shift()!;
          console.log(`Pairing user ${ws} with partner ${partner}.`);
          const currentRoom = new Room(ws, partner);
          this.Rooms.push(currentRoom);
          currentRoom.broadcastInRoom("connected");
        } else {
          console.log(`No partners available. Adding user ${ws} to the lobby.`);
          // If no partner is available, add to lobby
          this.lobby.push(ws);
        }
      }

      if (currentMessage.type === Chat) {
        console.log(`User ${ws} sent a chat message.`);
        const currentRoom = this.Rooms.find(
          (room) => room.user1 === ws || room.user2 === ws
        );

        if (currentRoom) {
          console.log(`Sending message to room: ${currentMessage.content}`);
          currentRoom.sendMessage(ws, currentMessage.content);
          

        } else {
          console.log(`User ${ws} is not in a room.`);
        }
      }
    });
  }
}
