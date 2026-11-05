import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { ClientActionMessage, ClientMessage, ClientMessageType, CreateLobbyMessage, ExitLobbyMessage, JoinLobbyMessage, LoginMessage, ModifyGameSettingsMessage, PingMessage, RegisterMessage, RequestActiveUsersMessage, RequestPublicLobbiesMessage, RequestUserInfoMessage, SendToChatMessage, StartGameMessage, UpdateChatChannelSubscriptionMessage, UpdateReadyStateMessage, UpdateUserInfoMessage } from "@super-netcentric-battleship/shared/ClientMessage.js";
import { ActiveUsersInfoMessageBuilder, PongMessage, PongMessageBuilder, PublicLobbiesInfoMessageBuilder, ServerErrorMessageBuilder, ServerMessage } from "@super-netcentric-battleship/shared/ServerMessage.js";
import UserManager from "./User/UserManager.js";
import ChatManager from "./Chat/ChatManager.js";
import ActiveUser from "./User/ActiveUser.js";
import { v4 as uuidv4 } from 'uuid';
import GameLobbyManager from "./Game/GameLobbyManager.js";
import crypto from "crypto";
import { AuthUser } from "./Authentication/types.js";
import Database from "./Database/Database.js";
import { JsonDatabase } from "./Database/JsonDatabase.js";

export default class GameServer {
    readonly webSocketServer: WebSocketServer;
    readonly userManager: UserManager;
    readonly chatManager: ChatManager;
    readonly gameLobbyManager: GameLobbyManager;
    readonly database: Database;
    readonly activeWebSockets: Record<string, WebSocket> = {};

    constructor(port: number) {
        this.database = new JsonDatabase();
        this.webSocketServer = new WebSocketServer({port:port});

        this.webSocketServer.on("connection", this.handleWebSocketConnection.bind(this));
        
        this.webSocketServer.on("listening", ()=>{
            console.log("server online");
        })

        this.chatManager = new ChatManager();
        this.userManager = new UserManager(this.database, this.chatManager);
        this.gameLobbyManager = new GameLobbyManager(this);

        this.chatManager.addChannel("global");
    }

    //websocket event listeners
    handleWebSocketConnection(websocket: WebSocket, request: IncomingMessage){
        const websocketId = uuidv4();
        this.activeWebSockets[websocketId] = websocket;
        this.userManager.registerWebSocket(websocket, websocketId);

        websocket.on("message", (data) => {
            this.handleWebSocketMessage(websocket, websocketId, data);
        });

        websocket.on("close", ()=>{
            this.userManager.removeWebSocket(websocketId);
            delete this.activeWebSockets[websocketId];
        });
    }

    async handleWebSocketMessage(websocket: WebSocket, webSocketId: string, data: WebSocket.RawData): Promise<void> {
        let message: ClientMessage;
        try {
            message = JSON.parse(data.toString()) as ClientMessage;
        } catch (error){
            return;
        }

        let response: ServerMessage | null = null;
        try{
            const user = this.userManager.getUserFromWebSocketId(webSocketId);

            switch(message.type){
            case ClientMessageType.Ping:
                response = this.handlePingMessage(message);
            break;
            case ClientMessageType.RequestUserInfo:
                response = await this.handleRequestUserInfoMessage(message, user);
            break;
            case ClientMessageType.UpdateUserInfo:
                response = await this.handleUpdateUserInfoMessage(message, webSocketId);
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
            case ClientMessageType.CreateLobby:
                response = this.handleCreateLobbyMessage(message, user);
            break;
            case ClientMessageType.JoinLobby:
                response = this.handleJoinLobbyMessage(message, user);
            break;
            case ClientMessageType.ModifyGameSettings:
                response = this.handleModifyGameSettingsMessage(message, user);
            break;
            case ClientMessageType.StartGame:
                response = this.handleStartGameMessage(user);
            break;
            case ClientMessageType.UpdateReadyState:
                response = this.handleUpdateReadyStateMessage(message, user);
            break;
            case ClientMessageType.RequestPublicLobbies:
                response = this.handleRequestPublicLobbiesMessage(message);
            break;
            case ClientMessageType.ExitLobby:
                response = this.handleExitLobbyMessage(message, user);
            break;
            case ClientMessageType.FireVolleyAction:
            case ClientMessageType.InitializeFleetAction:
            case ClientMessageType.UseAbilityAction:
            case ClientMessageType.RequestRematchAction:
                response = this.handleClientActionMessage(message, user);
            break;
            case ClientMessageType.Login:
                response = await this.handleLoginMessage(message, websocket, webSocketId);
            break;
            
            case ClientMessageType.Register:
                response = await this.handleRegisterMessage(message, websocket, webSocketId);
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

    paginate<T>(allMembers:T[], requestedPage: number | null, requestedMembersPerPage: number | null): {pagninatedMembers: T[], page: number, membersPerPage: number}{
        const memberCount = allMembers.length
        
        //TODO: configuration
        const maxMembersPerPage = 50;
        const membersPerPage = requestedMembersPerPage == null ? maxMembersPerPage : Math.max(0, Math.min(maxMembersPerPage, requestedMembersPerPage));

        //clamp page
        if(requestedPage == null) requestedPage = 0;
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

    async handleRequestUserInfoMessage(requestUserInfoMessage: RequestUserInfoMessage, user: ActiveUser): Promise<ServerMessage>{
        const requestedId = requestUserInfoMessage.userId;
        if(requestedId == null) return user.toUserInfoMessage();
        const requestedUser = await this.userManager.getDatabaseUser(requestedId);
        if(requestedUser == null) {
            return new ServerErrorMessageBuilder()
            .setError("requested userId does not exist");
        }

        return this.userManager.databaseUserToUserInfoMessage(requestedUser);
    }

    async handleUpdateUserInfoMessage(
        message: UpdateUserInfoMessage,
        webSocketId: string
    ): Promise<ServerMessage> {
        return this.userManager.updateUserInfo(webSocketId, message);
    }

    handleRequestActiveUsersMessage(requestActiveUsersMessage: RequestActiveUsersMessage): ServerMessage{
        const activeUsers = this.userManager.getActiveUsers();
        const activeUserCount = this.userManager.activeUserCount;
        const paginated = this.paginate(activeUsers, requestActiveUsersMessage.page, requestActiveUsersMessage.usersPerPage);

        return new ActiveUsersInfoMessageBuilder()
        .setTotalActiveUsers(activeUserCount)
        .setPage(paginated.page)
        .setActiveUsers(paginated.pagninatedMembers.map((user:ActiveUser) => {return {username: user.username, id:user.id}}))
        .setUsersPerPage(paginated.membersPerPage)
    }

    //TODO: send chat history to user when the user subscribes to a channel
    handleUpdateChatChannelSubscriptionMessage(updateChatChannelSubscriptionMessage: UpdateChatChannelSubscriptionMessage, user: ActiveUser): ServerMessage | null{
        const channelId = updateChatChannelSubscriptionMessage.channelId;
        if(!this.chatManager.channelExists(channelId)) return new ServerErrorMessageBuilder().setError("requested channel does not exist");
        
        if(updateChatChannelSubscriptionMessage.subscribe){
            if(user.subscribedChatChannels.every(x=>x.channelId != channelId)) return null
            this.chatManager.subscribe(user, channelId);
        } else {
            if(user.subscribedChatChannels.every(x=>x.channelId != channelId)) return null
            this.chatManager.unsubscribe(user, channelId);
        }

        return null;
    }

    handleSendToChatMessage(sendToChatMessage: SendToChatMessage, user: ActiveUser): ServerMessage | null{
        //TODO: configuration
        const MAX_MESSAGE_LENGTH = 300;
        
        const channelId = sendToChatMessage.channelId;
        const message = sendToChatMessage.message == null ? "" : sendToChatMessage.message;
        if(channelId == null || !this.chatManager.channelExists(channelId)) return new ServerErrorMessageBuilder().setError("requested channel does not exist");
        if(message.length > MAX_MESSAGE_LENGTH) return new ServerErrorMessageBuilder().setError("chat message is too long");
        
        this.chatManager.sendMessage(message, user, channelId);

        return null;
    }

    handleCreateLobbyMessage(createLobbyMessage: CreateLobbyMessage, user: ActiveUser): ServerMessage | null{
        this.gameLobbyManager.createLobby(user, createLobbyMessage.name, createLobbyMessage.description, createLobbyMessage.isPublic);

        return null;
    }

    handleJoinLobbyMessage(joinLobbyMessage: JoinLobbyMessage, user: ActiveUser): ServerMessage | null{
        this.gameLobbyManager.joinLobby(user, joinLobbyMessage.lobbyCode);

        return null;
    }

    handleModifyGameSettingsMessage(modifyGameSettingsMessage: ModifyGameSettingsMessage, user: ActiveUser): ServerMessage | null{
        this.gameLobbyManager.modifyGameSettings(user, modifyGameSettingsMessage.settings);
        return null;
    }

    
    handleStartGameMessage(user: ActiveUser): ServerMessage | null{
        this.gameLobbyManager.requestGameStart(user);
        return null;
    }

    handleUpdateReadyStateMessage(updateReadyStateMessage: UpdateReadyStateMessage, user: ActiveUser): ServerMessage | null{
        this.gameLobbyManager.updateReadyStatus(user, updateReadyStateMessage.ready);
        return null;
    }

    handleRequestPublicLobbiesMessage(requestPublicLobbiesMessage: RequestPublicLobbiesMessage): ServerMessage | null{
        const publicLobbies = this.gameLobbyManager.getPublicLobbies();
        const totalPublicLobbies = publicLobbies.length;
        const paginatedLobbies = this.paginate(publicLobbies, requestPublicLobbiesMessage.page, requestPublicLobbiesMessage.lobbiesPerPage);

        return new PublicLobbiesInfoMessageBuilder()
        .setLobbies(paginatedLobbies.pagninatedMembers.map(x=>{
            return {
                lobbyCode: x.id,
                name: x.name,
                description: x.description,
                memberCount: x.members.length
            }
        }))
        .setPage(paginatedLobbies.page)
        .setTotalLobbies(totalPublicLobbies)
        .setlobbiesPerPage(paginatedLobbies.membersPerPage);
    }

    handleClientActionMessage(clientActionMessage: ClientActionMessage, user: ActiveUser): ServerMessage | null {
        this.gameLobbyManager.notifyClientActionMessage(clientActionMessage, user);
        return null;
    }

    handleExitLobbyMessage(message: ExitLobbyMessage, user: ActiveUser): ServerMessage | null {
        this.gameLobbyManager.leaveLobby(user);
        return null;
    }
    async handleRegisterMessage(
        message: RegisterMessage,
        webSocket: WebSocket,
        webSocketId: string
    ): Promise<ServerMessage> {
        return this.userManager.registerAccount(webSocket, webSocketId, message.username, message.password);
    }
  
    async handleLoginMessage(
        message: LoginMessage,
        webSocket: WebSocket,
        webSocketId: string
    ): Promise<ServerMessage> {
        return this.userManager.login(webSocket, webSocketId, message.username, message.password);
    }
}