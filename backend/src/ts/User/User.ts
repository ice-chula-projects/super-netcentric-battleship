import { UserInfoMessage, UserInfoMessageBuilder } from "@super-netcentric-battleship/shared/ServerMessage.js";
import WebSocket from "ws";
import Random from "../lib/Random.js";

export default class User{
    readonly socket: WebSocket;
    // WebSocket id
    readonly id: string;
    readonly subscribedChatChannelIds: string[] = [];
    currentLobbyCode: string | null = null;

    active: boolean = true;
    username: string;
    
    get currentlyInGameLobby(): boolean{
        return this.currentLobbyCode != null;
    } 
  
    // Persistent account id, null for guests
    private _accountId: string | null = null;
    
    get accountId(): string | null {
        return this._accountId;
    }

    setUsername(username:string){
        this.username = username;
    }

    setCurrentLobbyCode(currentLobbyCode: string | null){
        this.currentLobbyCode = currentLobbyCode;
    }

    //TODO: random username system
    static generateRandomUsername(): string{
        return "guest#" + (Random.randomInteger(0,999999)).toString().padStart(6, "0");
    }

    static toUserInfoMessage(user: User): UserInfoMessage{
        const userInfoMessage = new UserInfoMessageBuilder()
        .setUsername(user.username)
        .setId(user.id)
        .setSubscribedChatChannelIds(user.subscribedChatChannelIds)

        return userInfoMessage;
    }
    
    constructor(
        socket: WebSocket,
        id: string,
        username?: string,
        accountId: string | null = null
    ) {
        this.socket = socket;
        this.id = id;
        this.username = username ?? User.generateRandomUsername();
        this._accountId = accountId;

        this.socket.on("close", () => {this.active = false});
    }
  
    toUserInfoMessage(): UserInfoMessage{
        return User.toUserInfoMessage(this);
    }
  
    setAccount(accountId: string, username: string) {
        if (this._accountId !== null) {
            throw new Error("User already has an account");
        }
        this._accountId = accountId;
        this.username = username;
    }
}