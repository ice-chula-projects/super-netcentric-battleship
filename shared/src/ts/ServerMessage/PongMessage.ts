import GameMessage from "../GameMessage.js";
import { ServerMessageType } from "./ServerMessageType.js";

export interface PongMessage extends GameMessage{
    readonly type: ServerMessageType.Pong;
    message: string;
}

export class PongMessageBuilder implements PongMessage{
    readonly type = ServerMessageType.Pong;
    readonly timestamp: number = Date.now();

    message: string = "pong";
    
    setMessage(message: string){
        this.message = message;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}