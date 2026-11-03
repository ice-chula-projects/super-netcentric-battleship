import GameMessage from "../../GameMessage.js";
import { ClientMessageType } from "../ClientMessageType.js";

export interface RequestUserInfoMessage extends GameMessage {
    readonly type: ClientMessageType.RequestUserInfo
    userId?: string;
}

export class RequestUserInfoMessageBuilder implements RequestUserInfoMessage {
    readonly type = ClientMessageType.RequestUserInfo;
    readonly timestamp: number = Date.now();

    userId?: string;

    setUserId(userId: string){
        this.userId = userId;
        return this;
    }

    toJsonString(): string{
        return JSON.stringify(this);
    };
}