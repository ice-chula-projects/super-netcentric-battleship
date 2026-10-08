import WebSocket, { WebSocketServer } from "ws";
import User from "./User.js";
import { IncomingMessage } from "http";
import { ClientMessage, ClientMessageType, PingMessage, RequestUserInfoMessage, UpdateUserInfoMessage } from "@super-netcentric-battleship/shared/ClientMessage.js";
import { PongMessage, PongMessageBuilder, ServerErrorMessageBuilder, ServerMessage } from "@super-netcentric-battleship/shared/ServerMessage.js";
import UserManager from "./UserManager.js";

export default class Server {
    webSocketServer: WebSocketServer;
    userManager: UserManager = new UserManager();

    constructor(port: number){
        this.webSocketServer = new WebSocketServer({port:port});
        
        this.webSocketServer.on("connection", this.handleWebSocketConnection.bind(this));
        
        this.webSocketServer.on("listening", ()=>{
            console.log("server online");
        })

    }

    //websocket event listeners
    handleWebSocketConnection(websocket: WebSocket, request: IncomingMessage){
        const userId = `${request.socket.remoteAddress}:${request.socket.remotePort}`;
        const user = new User(websocket, userId);
        this.userManager.registerActiveUser(user);

        websocket.on("message",(data)=>{
            this.handleWebSocketMessage(websocket,user, data);
        });
        websocket.on("close", ()=>{this.userManager.removeActiveUser(user)});
    }

    handleWebSocketMessage(websocket: WebSocket, user: User, data: WebSocket.RawData){
        let message: ClientMessage;
        try {
            message = JSON.parse(data.toString()) as ClientMessage;
        } catch (error){
            return;
        }

        let response: ServerMessage | null;
        switch(message.type){
            case ClientMessageType.Ping:
                response = this.handlePingMessage(message);
            break;
            case ClientMessageType.RequestUserInfoMessage:
                response = this.handleRequestUserInfoMessage(message, user);
            break;
            case ClientMessageType.UpdateUserInfoMessage:
                response = this.handleUpdateUserInfoMessage(message, user);
            break;
            default:
                response = new ServerErrorMessageBuilder().setError("unsupported message type");
        }
        
        if (response != null) websocket.send(response.toJsonString());
    }

    //message handlers
    handlePingMessage(pingMessage: PingMessage): PongMessage{
        return new PongMessageBuilder().setMessage(pingMessage.message + " pong");
    }

    handleRequestUserInfoMessage(requestUserInfoMessage: RequestUserInfoMessage, user: User): ServerMessage{
        const id = requestUserInfoMessage.userId == null? user.id : requestUserInfoMessage.userId;
        const requestedUser = this.userManager.getUser(id);
        if(requestedUser == null) {
            return new ServerErrorMessageBuilder()
            .setError("requested userId does not exist");
        }

        return requestedUser.toUserInfoMessage();
    }

    handleUpdateUserInfoMessage(updateUserInfoMessage: UpdateUserInfoMessage, user: User): ServerMessage{
        if(updateUserInfoMessage.username != null) user.setUsername(updateUserInfoMessage.username);
        return user.toUserInfoMessage();
    }
}