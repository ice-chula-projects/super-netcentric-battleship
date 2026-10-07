import GameMessage from "../GameMessage.js";
import { ClientMessageType } from "./ClientMessageType.js";

export interface RequestUserInfoMessage extends GameMessage {
    type: ClientMessageType.RequestUserInfoMessage
    userId?: string;
}

export class RequestUserInfoMessageBuilder implements RequestUserInfoMessage {
    type: ClientMessageType.RequestUserInfoMessage = ClientMessageType.RequestUserInfoMessage;
    userId?: string;

    setUserId(userId: string){
        this.userId = userId;
        return this;
    }

    toJsonString(): string{
        return JSON.stringify(this);
    };
}