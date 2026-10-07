import GameMessage from "../GameMessage.js";
import { ClientMessageType } from "./ClientMessageType.js";

export interface PingMessage extends GameMessage{
    readonly type: ClientMessageType.Ping;
    message: string;
}

export class PingMessageBuilder implements PingMessage{
    readonly type: ClientMessageType.Ping = ClientMessageType.Ping;
    readonly timestamp: number = Date.now();
    message: string = "ping";
    
    setMessage(message: string){
        this.message = message;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}