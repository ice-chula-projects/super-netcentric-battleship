import { UserInfoMessage, UserInfoMessageBuilder } from "@super-netcentric-battleship/shared/ServerMessage.js";
import WebSocket from "ws";
import Random from "../lib/Random.js";
import ChatChannel from "../Chat/ChatChannel.js";
import GameLobby from "../Game/GameLobby.js";
import { v4 as uuidv4 } from 'uuid';
import { DatabaseUser } from "./UserManager.js";

export default class ActiveUser{
    readonly socket: WebSocket;
    readonly webSocketId: string;
    // WebSocket id
    readonly id: string;
    readonly isGuest: boolean;
    readonly isAdmin: boolean;
    readonly subscribedChatChannels: ChatChannel[] = [];

    currentLobby: GameLobby | null = null;
    
    active: boolean = true;
    username: string;
    
    get currentlyInGameLobby(): boolean{
        return this.currentLobby != null;
    } 

    setUsername(username:string){
        this.username = username;
    }

    setCurrentLobby(currentLobby: GameLobby | null){
        this.currentLobby = currentLobby;
    }

    //TODO: random username system
    static generateRandomUsername(): string{
        return "guest#" + (Random.randomInteger(0,999999)).toString().padStart(6, "0");
    }

    static toUserInfoMessage(user: ActiveUser): UserInfoMessage{
        const userInfoMessage = new UserInfoMessageBuilder()
        .setUsername(user.username)
        .setId(user.id)
        .setSubscribedChatChannelIds(user.subscribedChatChannels.map(x=>x.channelId))
        .setIsAdmin(user.isAdmin)
        .setIsGuest(user.isGuest);

        return userInfoMessage;
    }

    static createGuestAccount(socket: WebSocket, webSocketId: string): ActiveUser{
        return new ActiveUser(socket, webSocketId, uuidv4(), this.generateRandomUsername(), false, true);
    }

    static fromDatabaseUser(socket: WebSocket, webSocketId: string, databaseUser: DatabaseUser): ActiveUser{
        return new ActiveUser(socket, webSocketId, databaseUser.id, databaseUser.username, databaseUser.isAdmin, false);
    }
    
    constructor(
        socket: WebSocket,
        webSocketId: string,
        id: string,
        username: string,
        isAdmin: boolean,
        isGuest: boolean,
    ) {
        this.socket = socket;
        this.webSocketId = webSocketId;
        this.id = id;
        this.isAdmin = isAdmin;
        this.isGuest = isGuest;
        this.username = username ?? ActiveUser.generateRandomUsername();

        this.socket.on("close", () => {this.active = false});
    }

    notifyDeletion(): void{
        if(this.currentlyInGameLobby) this.currentLobby!.removeUser(this);
        while(this.subscribedChatChannels.length > 0){
            this.subscribedChatChannels[0].unsubscribe(this);
        }
    }
  
    toUserInfoMessage(): UserInfoMessage{
        return ActiveUser.toUserInfoMessage(this);
    }
}