import WebSocket, { WebSocketServer } from "ws";
import User from "./User.js";
import { IncomingMessage } from "http";
import GameMessage, { GameMessageType } from "@super-netcentric-battleship/shared/GameMessage.js";

export default class Server {
    users: Record<string, User> = {};
    webSocketServer: WebSocketServer;

    constructor(port: number){
        this.webSocketServer = new WebSocketServer({port:port});
        
        this.webSocketServer.on("connection", this.onConnection.bind(this));
        
        this.webSocketServer.on("listening", ()=>{
            console.log("server online");
        })
    }

    onConnection(websocket: WebSocket, request: IncomingMessage){
        const userId = `${request.socket.remoteAddress}:${request.socket.remotePort}`;
        const user = new User(websocket, userId);
        this.users[userId] = user;
        console.log(this.users);

        websocket.on("message",(data)=>{
            this.onMessage(websocket, data);
        });
        websocket.on("close", ()=>{delete this.users[userId];console.log(`deleted user ${userId}`)});
    }

    onMessage(websocket: WebSocket, data: WebSocket.RawData){
        try {
            const message = JSON.parse(data.toString()) as GameMessage;
            if (message?.type == GameMessageType.PingRequest) websocket.send(JSON.stringify({type: GameMessageType.PingResponse} as GameMessage));
        } catch (error) {}

    }
}