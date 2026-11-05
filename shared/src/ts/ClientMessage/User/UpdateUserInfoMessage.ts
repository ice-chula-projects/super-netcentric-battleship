import GameMessage from "../../GameMessage.js";
import { ClientMessageType } from "../ClientMessageType.js";

export interface UpdateUserInfoMessage extends GameMessage{
    readonly type: ClientMessageType.UpdateUserInfo;
    username: string | null;
}

export class UpdateUserInfoMessageBuilder implements UpdateUserInfoMessage{
    readonly type = ClientMessageType.UpdateUserInfo;
    readonly timestamp: number = Date.now();
    username: string | null = null;
    
    setUsername(username: string){
        this.username = username;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}