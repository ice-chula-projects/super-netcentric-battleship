import GameMessage from "../GameMessage.js";
import { ClientMessageType } from "./ClientMessageType.js";

export interface RequestUserInfoMessage extends GameMessage {
    readonly type: ClientMessageType.RequestUserInfoMessage
    userId?: string;
}

export class RequestUserInfoMessageBuilder implements RequestUserInfoMessage {
    readonly type: ClientMessageType.RequestUserInfoMessage = ClientMessageType.RequestUserInfoMessage;
    userId?: string;

    setUserId(userId: string){
        this.userId = userId;
        return this;
    }

    toJsonString(): string{
        return JSON.stringify(this);
    };
}