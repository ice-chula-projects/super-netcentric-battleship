import GameMessage from "../GameMessage.js";
import { ClientMessageType } from "./ClientMessageType.js";

export interface PingMessage extends GameMessage{
    type: ClientMessageType.Ping;
    message: string;
}

export class PingMessageBuilder implements PingMessage{
    type: ClientMessageType.Ping = ClientMessageType.Ping;
    message: string = "ping";
    
    setMessage(message: string){
        this.message = message;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}