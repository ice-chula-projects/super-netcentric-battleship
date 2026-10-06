import WebSocket, { WebSocketServer } from "ws";
import User from "./User.js";
import { IncomingMessage } from "http";
import ClientMessage, { ClientMessageType } from "@super-netcentric-battleship/shared/ClientMessage.js";
import ServerMessage, { ServerMessageType } from "@super-netcentric-battleship/shared/ServerMessage.js";

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

        websocket.on("message",(data)=>{
            this.onMessage(websocket, data);
        });
        websocket.on("close", ()=>{delete this.users[userId];console.log(`deleted user ${userId}`)});
    }

    onMessage(websocket: WebSocket, data: WebSocket.RawData){
        try {
            const message = JSON.parse(data.toString()) as ClientMessage;
            if (message?.type == ClientMessageType.Ping) websocket.send(JSON.stringify({type: ServerMessageType.Pong} as ServerMessage));
        } catch (error) {}

    }
}