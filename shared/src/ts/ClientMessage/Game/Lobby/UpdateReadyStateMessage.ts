import GameMessage from "../../../GameMessage.js";
import { ClientMessageType } from "../../ClientMessageType.js";

export interface UpdateReadyStateMessage extends GameMessage{
    readonly type: ClientMessageType.updateReadyState;
    ready: boolean;
}

export class UpdateReadyStateMessageBuilder implements UpdateReadyStateMessage{
    readonly type = ClientMessageType.updateReadyState;
    readonly timestamp: number = Date.now();
    ready = false;

    setReady(ready: boolean){
        this.ready = ready; 
        return this;
    } 

    toJsonString(){
        return JSON.stringify(this);
    };
}