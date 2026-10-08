import GameMessage from "../GameMessage.js";
import { ClientMessageType } from "./ClientMessageType.js";

export interface SendToChatMessage extends GameMessage{
    readonly type: ClientMessageType.SendToChatMessage;
    channelId: string;
    message: string;
}

export class SendToChatMessageBuilder implements SendToChatMessage{
    readonly type = ClientMessageType.SendToChatMessage;
    readonly timestamp: number = Date.now();
    channelId: string = "";
    message: string = "";

    setChannelId(channelId: string){
        this.channelId = channelId;
        return this;
    }

    setMessage(message:string){
        this.message = message;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}