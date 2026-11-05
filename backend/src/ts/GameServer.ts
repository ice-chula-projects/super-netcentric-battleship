import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import {
  ClientActionMessage,
  ClientMessage,
  ClientMessageType,
  CreateLobbyMessage,
  JoinLobbyMessage,
  ModifyGameSettingsMessage,
  PingMessage,
  RequestActiveUsersMessage,
  RequestPublicLobbiesMessage,
  RequestUserInfoMessage,
  SendToChatMessage,
  StartGameMessage,
  UpdateChatChannelSubscriptionMessage,
  UpdateReadyStateMessage,
  UpdateUserInfoMessage,
  LoginMessage,
  RegisterMessage,
  ExitLobbyMessage
} from "@super-netcentric-battleship/shared/ClientMessage.js";
import { ActiveUsersInfoMessageBuilder, PongMessage, PongMessageBuilder, PublicLobbiesInfoMessageBuilder, ServerErrorMessageBuilder, ServerMessage } from "@super-netcentric-battleship/shared/ServerMessage.js";
import UserManager from "./User/UserManager.js";
import ChatManager from "./Chat/ChatManager.js";
import User from "./User/User.js";
import { v4 as uuidv4 } from 'uuid';
import GameLobbyManager from "./Game/GameLobbyManager.js";
import crypto from "crypto";
import AuthManager from "./Authentication/AuthenticationManager.js";
import { UserDatabase } from "./Database/UserDatabase.js";
import { AuthUser } from "./Authentication/types.js";

export default class GameServer {
    readonly webSocketServer: WebSocketServer;
    readonly userManager: UserManager;
    readonly chatManager: ChatManager;
    readonly gameLobbyManager: GameLobbyManager;
    readonly authManager: AuthManager;
    readonly userDatabase: UserDatabase;

    constructor(port: number) {
        this.authManager = new AuthManager();
        this.userDatabase = new UserDatabase("./data/users.json");
        this.webSocketServer = new WebSocketServer({port:port});

        this.webSocketServer.on("connection", this.handleWebSocketConnection.bind(this));
        
        this.webSocketServer.on("listening", ()=>{
            console.log("server online");
        })

        this.userManager = new UserManager(this.userDatabase);
        this.chatManager = new ChatManager();
        this.gameLobbyManager = new GameLobbyManager(this);

        this.chatManager.addChannel("global");
    }

    //websocket event listeners
    handleWebSocketConnection(websocket: WebSocket, request: IncomingMessage){
        const userId = `${request.socket.remoteAddress}:${request.socket.remotePort}`;
        const user = new User(websocket, userId);
        this.userManager.registerActiveUser(user);
        this.chatManager.subscribe(user, "global");

        websocket.on("message", (data) => {
            void this.handleWebSocketMessage(websocket, user, data)
                .catch(error => {
                    console.error("WebSocket message error:", error);
        
                    if (websocket.readyState === WebSocket.OPEN) {
                        websocket.send(
                            new ServerErrorMessageBuilder()
                                .setError("internal server error")
                                .toJsonString()
                        );
                    }
                });
        });
        websocket.on("close", ()=>{this.userManager.removeActiveUser(user)});
    }

    async handleWebSocketMessage(websocket: WebSocket, user: User, data: WebSocket.RawData): Promise<void> {
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
                response = await this.handleUpdateUserInfoMessage(message, user);
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
                response = await this.handleLoginMessage(message, user);
            break;
            
            case ClientMessageType.Register:
                response = await this.handleRegisterMessage(message, user);
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

    handleRequestUserInfoMessage(requestUserInfoMessage: RequestUserInfoMessage, user: User): ServerMessage{
        const id = requestUserInfoMessage.userId == null? user.id : requestUserInfoMessage.userId;
        const requestedUser = this.userManager.getUser(id);
        if(requestedUser == null) {
            return new ServerErrorMessageBuilder()
            .setError("requested userId does not exist");
        }

        return requestedUser.toUserInfoMessage();
    }

    async handleUpdateUserInfoMessage(
        message: UpdateUserInfoMessage,
        user: User
    ): Promise<ServerMessage> {
        if (message.username != null) {
            const username = message.username.trim();
            if (!username) {
                return new ServerErrorMessageBuilder()
                    .setError("invalid username");
            }
            if (user.accountId !== null) {
                await this.userDatabase.setUsername(
                    user.accountId,
                    username
                );
            }
            user.setUsername(username);
        }
    
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

    handleClientActionMessage(clientActionMessage: ClientActionMessage, user: User): ServerMessage | null {
        this.gameLobbyManager.notifyClientActionMessage(clientActionMessage, user);
        return null;
    }
    async handleRegisterMessage(
        message: RegisterMessage,
        user: User
    ): Promise<ServerMessage> {
        if (user.accountId !== null) {
            return new ServerErrorMessageBuilder()
                .setError("already authenticated");
        }
    
        const username = message.username?.trim();
        const password = message.password;
    
        if (
            typeof username !== "string" ||
            username.length === 0 ||
            username.length > 32
        ) {
            return new ServerErrorMessageBuilder()
                .setError("invalid username");
        }
    
        if (
            typeof password !== "string" ||
            password.length === 0 ||
            password.length > 1024
        ) {
            return new ServerErrorMessageBuilder()
                .setError("invalid password");
        }
    
        const account: AuthUser = {
            id: crypto.randomUUID(),
            username,
            password: await this.authManager.hashPassword(password)
        };
    
        try {
            await this.userDatabase.createUser(account);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message === "Username already taken"
            ) {
                return new ServerErrorMessageBuilder()
                    .setError("username already taken");
            }
            throw error;
        }
    
        user.setAccount(account.id, account.username);
    
        return user.toUserInfoMessage();
    }
  
  async handleLoginMessage(
    message: LoginMessage,
    user: User
  ): Promise<ServerMessage> {
    if (user.accountId !== null) {
      return new ServerErrorMessageBuilder()
        .setError("already authenticated");
    }
    
    const username = message.username?.trim();
    const password = message.password;
    
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      password.length > 1024
    ) {
      return new ServerErrorMessageBuilder()
        .setError("invalid credentials");
    }
    
    const account = await this.userDatabase.getUserFromName(username);
    if (
      account === null ||
      !(await this.authManager.verifyPassword(
        password,
        account.password
      ))
    ) {
      return new ServerErrorMessageBuilder()
        .setError("invalid username or password");
    }
    
        user.setAccount(account.id, account.username);
        return user.toUserInfoMessage();
    }
    handleExitLobbyMessage(message: ExitLobbyMessage, user: User): ServerMessage | null {
        this.gameLobbyManager.leaveLobby(user);
        return null;
    }
}