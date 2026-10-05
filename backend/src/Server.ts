import WebSocket, { WebSocketServer } from "ws";
import User from "./User.ts";
import { IncomingMessage } from "http";

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

        websocket.on("message",this.onMessage.bind(this));
        websocket.on("close", ()=>{delete this.users[userId];console.log(`deleted user ${userId}`)});
    }

    onMessage(data: WebSocket.RawData){

    }
}