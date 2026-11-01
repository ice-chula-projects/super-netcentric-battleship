import GameMessage from "../GameMessage.js";
import { ServerMessageType } from "./ServerMessageType.js";

export interface OpponentGameActionNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.OpponentGameActionNotification;
    x: number,
    y: number
}

export class OpponentGameActionNotificationMessageBuilder implements OpponentGameActionNotificationMessage{
    readonly type = ServerMessageType.OpponentGameActionNotification;
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