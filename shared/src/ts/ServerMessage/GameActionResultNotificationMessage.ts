import GameMessage from "../GameMessage.js";
import { ServerMessageType } from "./ServerMessageType.js";

export interface GameActionResultNotificactionMessage extends GameMessage{
    readonly type: ServerMessageType.GameActionResultNotificaction;
    hit: boolean;
}

export class GameActionResultNotificactionMessageBuilder implements GameActionResultNotificactionMessage{
    readonly type = ServerMessageType.GameActionResultNotificaction;
    readonly timestamp: number = Date.now();
    hit: boolean = false;

    setHit(hit: boolean){
        this.hit = hit;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}