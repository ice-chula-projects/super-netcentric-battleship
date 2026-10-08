import WebSocket, { WebSocketServer } from "ws";
import User from "./User.js";
import { IncomingMessage } from "http";
import { ClientMessage, ClientMessageType } from "@super-netcentric-battleship/shared/ClientMessage.js";
import { PongMessageBuilder, ServerErrorMessageBuilder, ServerMessage, UserInfoMessageBuilder } from "@super-netcentric-battleship/shared/ServerMessage.js";

export default class Server {
    users: Record<string, User> = {};
    webSocketServer: WebSocketServer;

    constructor(port: number){
        this.webSocketServer = new WebSocketServer({port:port});
        
        this.webSocketServer.on("connection", this.handleConnection.bind(this));
        
        this.webSocketServer.on("listening", ()=>{
            console.log("server online");
        })
    }

    handleConnection(websocket: WebSocket, request: IncomingMessage){
        const userId = `${request.socket.remoteAddress}:${request.socket.remotePort}`;
        const user = new User(websocket, userId);
        this.users[userId] = user;

        websocket.on("message",(data)=>{
            this.handleMessage(websocket,user, data);
        });
        websocket.on("close", ()=>{delete this.users[userId];console.log(`deleted user ${userId}`)});
    }

    handleMessage(websocket: WebSocket, user: User, data: WebSocket.RawData){
        let message: ClientMessage;
        try {
            message = JSON.parse(data.toString()) as ClientMessage;
        } catch (error){
            return;
        }
        let response: ServerMessage | null = null;

        switch(message.type){
            case ClientMessageType.Ping:
                response = new PongMessageBuilder()
                .setMessage(message.message + " pong");
            break;

            case ClientMessageType.RequestUserInfoMessage:
                const id = message.userId == null? user.id : message.userId;
                const requestedUser = this.users[id];
                if(requestedUser == null) {
                    response = new ServerErrorMessageBuilder()
                    .setError("requested userId does not exist")
                    break;
                }

                response = requestedUser.toUserInfoMessage();
            break;
        }


        if (response != null) websocket.send(response.toJsonString());
    }
}