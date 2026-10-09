import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { ClientMessage, ClientMessageType, JoinGameMessage, PingMessage, RequestActiveUsersMessage, RequestUserInfoMessage, SendBoardSetupMessage, SendGameActionMessage, SendToChatMessage, Ship, UpdateChatChannelSubscriptionMessage, UpdateUserInfoMessage } from "@super-netcentric-battleship/shared/ClientMessage.js";
import { ActiveUsersInfoMessageBuilder, PongMessage, PongMessageBuilder, ServerErrorMessageBuilder, ServerMessage } from "@super-netcentric-battleship/shared/ServerMessage.js";
import UserManager from "./User/UserManager.js";
import ChatManager from "./Chat/ChatManager.js";
import User from "./User/User.js";
import GameManager from "./Game/GameManager.js";
import { GameShip, ShipOrientation } from "./Game/GameBoard.js";

export default class GameServer {
    readonly webSocketServer: WebSocketServer;
    readonly userManager: UserManager;
    readonly chatManager: ChatManager;
    readonly gameManager: GameManager;

    constructor(port: number){
        this.webSocketServer = new WebSocketServer({port:port});

        this.webSocketServer.on("connection", this.handleWebSocketConnection.bind(this));
        
        this.webSocketServer.on("listening", ()=>{
            console.log("server online");
        })

        this.userManager = new UserManager();
        this.chatManager = new ChatManager();
        this.gameManager = new GameManager(this);

        this.chatManager.addChannel("global");
    }

    //websocket event listeners
    handleWebSocketConnection(websocket: WebSocket, request: IncomingMessage){
        const userId = `${request.socket.remoteAddress}:${request.socket.remotePort}`;
        const user = new User(websocket, userId);
        this.userManager.registerActiveUser(user);
        this.chatManager.subscribe(user, "global");

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
            case ClientMessageType.RequestUserInfo:
                response = this.handleRequestUserInfoMessage(message, user);
            break;
            case ClientMessageType.UpdateUserInfo:
                response = this.handleUpdateUserInfoMessage(message, user);
            break;
            case ClientMessageType.RequestActiveUsers:
                response = this.handleRequestActiveUsersMessage(message)
            break;
            case ClientMessageType.UpdateChatChannelSubscription:
                response = this.handleUpdateChatChannelSubscriptionMessage(message, user);
            break
            case ClientMessageType.SendToChat:
                response = this.handleSendToChatMessage(message, user);
            break;
            case ClientMessageType.JoinGame:
                response = this.handleJoinGameMessage(message, user);
            break;
            case ClientMessageType.SendBoardSetup:
                response = this.handleSendBoardSetupMessage(message, user);
            break;
            case ClientMessageType.SendGameAction:
                response = this.handleSendGameActionMessage(message, user);
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

    handleRequestActiveUsersMessage(requestActiveUsersMessage: RequestActiveUsersMessage): ServerMessage{
        const activeUsers = this.userManager.getActiveUsers();
        const activeUserCount = this.userManager.activeUserCount;

        //TODO: configuration
        const maxUsersPerPage = 50;
        const usersPerPage = requestActiveUsersMessage.usersPerPage == null ? maxUsersPerPage : Math.max(0, Math.min(maxUsersPerPage, requestActiveUsersMessage.usersPerPage));

        //clamp page
        const page = Math.max(0, Math.min(requestActiveUsersMessage.page, Math.ceil(activeUserCount/usersPerPage) - 1));
        
        const startingIndex = page * usersPerPage
        const paginatedActiveUsers = activeUsers.slice(startingIndex, Math.min(startingIndex + usersPerPage, activeUsers.length));

        return new ActiveUsersInfoMessageBuilder()
        .setTotalActiveUsers(activeUserCount)
        .setPage(page)
        .setActiveUsers(paginatedActiveUsers.map((user:User) => {return {username: user.username, id:user.id}}))
        .setUsersPerPage(usersPerPage)
    }

    //TODO: send chat history to user when the user subscribes to a channel
    handleUpdateChatChannelSubscriptionMessage(updateChatChannelSubscriptionMessage: UpdateChatChannelSubscriptionMessage, user: User): ServerMessage | null{
        const channelId = updateChatChannelSubscriptionMessage.channelId;
        if(!this.chatManager.channelExists(channelId)) return new ServerErrorMessageBuilder().setError("requested channel does not exist");
        
        if(updateChatChannelSubscriptionMessage.subscribe){
            if(user.subscribedChatChannelIds.includes(channelId)) return null
            this.chatManager.subscribe(user, channelId);
        } else {
            if(!user.subscribedChatChannelIds.includes(channelId)) return null
            this.chatManager.unsubscribe(user, channelId);
        }

        return null;
    }

    handleSendToChatMessage(sendToChatMessage: SendToChatMessage, user: User): ServerMessage | null{
        //TODO: configuration
        const MAX_MESSAGE_LENGTH = 300;
        
        const channelId = sendToChatMessage.channelId;
        const message = sendToChatMessage.message == null ? "" : sendToChatMessage.message;
        if(channelId == null || !this.chatManager.channelExists(channelId)) return new ServerErrorMessageBuilder().setError("requested channel does not exist");
        if(message.length > MAX_MESSAGE_LENGTH) return new ServerErrorMessageBuilder().setError("chat message is too long");
        
        this.chatManager.sendMessage(message, user, channelId);

        return null;
    }

    handleJoinGameMessage(joinGameMessage: JoinGameMessage, user: User): ServerMessage | null{
        const gameId = joinGameMessage.gameId;
        if(gameId == null) return new ServerErrorMessageBuilder().setError("gameId cannot be null");
        if(!this.gameManager.gameExists(joinGameMessage.gameId)) this.gameManager.createGame(gameId);
        if(this.gameManager.gameIsFull(gameId)) return new ServerErrorMessageBuilder().setError("requested gameId is full");

        
        try{
            this.gameManager.addPlayerUser(gameId, user);
        } catch (error){
            console.log(error);
            return new ServerErrorMessageBuilder().setError("internal server error");
        }

        return null;
    }

    handleSendBoardSetupMessage(sendBoardSetupMessage: SendBoardSetupMessage, user: User): ServerMessage | null{
        const gameId = user.currentGameId;
        if(gameId == null) return new ServerErrorMessageBuilder().setError("user not currently in game");
        
        //TODO: validation
        try{
            this.gameManager.setUpBoard(gameId, user, sendBoardSetupMessage.ships.map((ship:Ship) => {return new GameShip(ship.x, ship.y, ship.orientation == "down"? ShipOrientation.Down : ShipOrientation.Right)}));
        } catch (error){
            console.log(error);
            return new ServerErrorMessageBuilder().setError("internal server error");
        }
        
        return null;
    }

    handleSendGameActionMessage(sendGameActionMessage: SendGameActionMessage, user: User): ServerMessage | null{
        const gameId = user.currentGameId;
        if(gameId == null) return new ServerErrorMessageBuilder().setError("user not currently in game");
        
        //TODO: validation
        try{
            this.gameManager.takeTurn(gameId, user, sendGameActionMessage.x, sendGameActionMessage.y);
        } catch (error){
            console.log(error);
            return new ServerErrorMessageBuilder().setError("internal server error");
        }
        
        return null;
    }
}