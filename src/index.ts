import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import { RoomManager } from "./RoomManager";
import { configDotenv } from "dotenv";
configDotenv()
const app = express()
const PORT = process.env.WORKING_PORT||5000
const server = app.listen(PORT,()=>{
    console.log("running on" + PORT);
})


const wss = new WebSocketServer({server})
const manager = new RoomManager()

wss.on("connection",(ws:WebSocket)=>{
//change
    


    manager.addUser(ws,"usernametest")

    ws.on("close",()=>{
        manager.removeUser(ws)
    })
})


