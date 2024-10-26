
import WebSocket from "ws";

export const JoinRoom = "joinRoom";
export const Chat = "chat";

export function formatAndSendMessage(
  ws: WebSocket,
  msg: string,
  sender: string
) {
  const finalMsg = JSON.stringify({
    sender: sender,
    msg: msg,
  });

  ws.send(finalMsg);
}