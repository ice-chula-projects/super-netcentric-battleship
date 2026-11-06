import GameMessage from "../../GameMessage.js";
import { ClientMessageType } from "../ClientMessageType.js";

export interface UpdateUserInfoMessage extends GameMessage{
    readonly type: ClientMessageType.UpdateUserInfo;
    username: string | null;
    password: string | null;
}

export class UpdateUserInfoMessageBuilder implements UpdateUserInfoMessage{
    readonly type = ClientMessageType.UpdateUserInfo;
    readonly timestamp: number = Date.now();
    username: string | null = null;
    password: string | null = null;

    setUsername(username: string){
        this.username = username;
        return this;
    }

    setPassword(password: string){
        this.password = password;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}