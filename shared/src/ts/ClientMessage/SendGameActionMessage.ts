import GameMessage from "../GameMessage.js";
import { ClientMessageType } from "./ClientMessageType.js";

export interface SendGameActionMessage extends GameMessage{
    readonly type: ClientMessageType.SendGameAction;
    
}

export class SendGameActionMessageBuilder implements SendGameActionMessage{
    readonly type = ClientMessageType.SendGameAction;
    readonly timestamp: number = Date.now();
    
    toJsonString(){
        return JSON.stringify(this);
    };
}