import GameMessage from "../../GameMessage.js";
import { ClientMessageType } from "../ClientMessageType.js";

export interface SendToChatMessage extends GameMessage{
    readonly type: ClientMessageType.SendToChat;
    channelId: string | null;
    message: string | null;
}

export class SendToChatMessageBuilder implements SendToChatMessage{
    readonly type = ClientMessageType.SendToChat;
    readonly timestamp: number = Date.now();
    channelId: string | null = null;
    message: string | null= null;

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