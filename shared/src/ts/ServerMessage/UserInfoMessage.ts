import GameMessage from "../GameMessage.js";
import { ServerMessageType } from "./ServerMessageType.js";

export interface UserInfoMessage extends GameMessage{
    readonly type: ServerMessageType.UserInfo;
    userInfo: {
        id: string | null;
        username: string | null;
    }
}

export class UserInfoMessageBuilder implements UserInfoMessage{
    readonly type = ServerMessageType.UserInfo;
    readonly timestamp: number = Date.now();

    userInfo: { id: string | null; username: string | null; } = {id: null, username: null};

    setId(id:string | null){
        this.userInfo.id = id;
        return this;
    }

    setUsername(username: string | null){
        this.userInfo.username = username;
        return this;
    }

    toJsonString(): string{
        return JSON.stringify(this);
    };
}