import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { ClientMessage, ClientMessageType, CreateLobbyMessage, JoinLobbyMessage, ModifyGameSettingsMessage, PingMessage, RequestActiveUsersMessage, RequestUserInfoMessage, SendToChatMessage, StartGameMessage, UpdateChatChannelSubscriptionMessage, UpdateReadyStateMessage, UpdateUserInfoMessage } from "@super-netcentric-battleship/shared/ClientMessage.js";
import { ActiveUsersInfoMessageBuilder, PongMessage, PongMessageBuilder, ServerErrorMessageBuilder, ServerMessage } from "@super-netcentric-battleship/shared/ServerMessage.js";
import UserManager from "./User/UserManager.js";
import ChatManager from "./Chat/ChatManager.js";
import User from "./User/User.js";
import { v4 as uuidv4 } from 'uuid';
import GameLobbyManager from "./Game/GameLobbyManager.js";

export default class GameServer {
    readonly webSocketServer: WebSocketServer;
    readonly userManager: UserManager;
    readonly chatManager: ChatManager;
    readonly gameLobbyManager: GameLobbyManager;

    constructor(port: number){
        this.webSocketServer = new WebSocketServer({port:port});

        this.webSocketServer.on("connection", this.handleWebSocketConnection.bind(this));
        
        this.webSocketServer.on("listening", ()=>{
            console.log("server online");
        })

        this.userManager = new UserManager();
        this.chatManager = new ChatManager();
        this.gameLobbyManager = new GameLobbyManager(this);

        this.chatManager.addChannel("global");
    }

    //websocket event listeners
    handleWebSocketConnection(websocket: WebSocket, request: IncomingMessage){
        const userId = uuidv4();
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

        let response: ServerMessage | null = null;
        try{
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
            case ClientMessageType.createLobby:
                response = this.handleCreateLobbyMessage(message, user);
            break;
            case ClientMessageType.joinLobby:
                response = this.handleJoinLobbyMessage(message, user);
            break;
            case ClientMessageType.modifyGameSettings:
                response = this.handleModifyGameSettingsMessage(message, user);
            break;
            case ClientMessageType.startGame:
                response = this.handleStartGameMessage(user);
            break;
            case ClientMessageType.updateReadyState:
                response = this.handleUpdateReadyStateMessage(message, user);
            break;
            default:
                response = new ServerErrorMessageBuilder().setError("unsupported message type");
        }

        } catch(error){
            if (error instanceof Error){
                response = new ServerErrorMessageBuilder().setError(error.message);
            } else {
                response = new ServerErrorMessageBuilder().setError("unknown internal server error");
            }
        }
        
        if (response != null) websocket.send(response.toJsonString());
    }

    paginate<T>(allMembers:T[], requestedPage: number, requestedMembersPerPage: number | null): {pagninatedMembers: T[], page: number, membersPerPage: number}{
        const memberCount = allMembers.length
        
        //TODO: configuration
        const maxUsersPerPage = 50;
        const membersPerPage = requestedMembersPerPage == null ? maxUsersPerPage : Math.max(0, Math.min(maxUsersPerPage, requestedMembersPerPage));

        //clamp page
        const page = Math.max(0, Math.min(requestedPage, Math.ceil(memberCount/membersPerPage) - 1));
        
        const startingIndex = page * membersPerPage
        const pagninatedMembers = allMembers.slice(startingIndex, Math.min(startingIndex + membersPerPage, memberCount));

        return {
            pagninatedMembers: pagninatedMembers,
            page: page,
            membersPerPage: membersPerPage
        }
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
        const paginated = this.paginate(activeUsers, requestActiveUsersMessage.page, requestActiveUsersMessage.usersPerPage);

        return new ActiveUsersInfoMessageBuilder()
        .setTotalActiveUsers(activeUserCount)
        .setPage(paginated.page)
        .setActiveUsers(paginated.pagninatedMembers.map((user:User) => {return {username: user.username, id:user.id}}))
        .setUsersPerPage(paginated.membersPerPage)
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

    handleCreateLobbyMessage(createLobbyMessage: CreateLobbyMessage, user: User): ServerMessage | null{
        this.gameLobbyManager.createLobby(user, createLobbyMessage.name, createLobbyMessage.description, createLobbyMessage.isPublic);

        return null;
    }

    handleJoinLobbyMessage(joinLobbyMessage: JoinLobbyMessage, user: User): ServerMessage | null{
        this.gameLobbyManager.joinLobby(user, joinLobbyMessage.lobbyCode);

        return null;
    }

    handleModifyGameSettingsMessage(modifyGameSettingsMessage: ModifyGameSettingsMessage, user: User): ServerMessage | null{
        this.gameLobbyManager.modifyGameSettings(user, modifyGameSettingsMessage.settings);
        return null;
    }

    
    handleStartGameMessage(user: User): ServerMessage | null{
        this.gameLobbyManager.requestGameStart(user);
        return null;
    }

    
    handleUpdateReadyStateMessage(updateReadyStateMessage: UpdateReadyStateMessage, user: User): ServerMessage | null{
        this.gameLobbyManager.updateReadyStatus(user, updateReadyStateMessage.ready);
        return null;
    }
}