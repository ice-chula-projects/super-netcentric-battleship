import GameMessage from "../GameMessage.js";
import { ClientMessageType } from "./ClientMessageType.js";

export interface SendGameActionMessage extends GameMessage{
    readonly type: ClientMessageType.SendGameAction;
    x: number;
    y: number;
}

export class SendGameActionMessageBuilder implements SendGameActionMessage{
    readonly type = ClientMessageType.SendGameAction;
    readonly timestamp: number = Date.now();
    x: number = 0;
    y: number = 0;

    setX(x: number){
        this.x = x;
        return this;
    }

    setY(y: number){
        this.y = y;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}