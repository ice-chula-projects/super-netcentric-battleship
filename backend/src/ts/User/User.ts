import { UserInfoMessage, UserInfoMessageBuilder } from "@super-netcentric-battleship/shared/ServerMessage.js";
import WebSocket from "ws";
import Random from "../lib/Random.js";

export default class User{
    readonly socket: WebSocket;
    readonly id: string;
    readonly subscribedChatChannelIds: string[] = [];
    active: boolean = true;
    username: string;

    setUsername(username:string){
        this.username = username;
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
    
    constructor(socket: WebSocket, id: string){
        this.socket = socket;
        this.id = id;
        this.username = User.generateRandomUsername();

        this.socket.on("close", () => {this.active = false});
    }
    
    toUserInfoMessage(): UserInfoMessage{
        return User.toUserInfoMessage(this);
    }
}