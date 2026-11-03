import GameMessage from "../../../GameMessage.js";
import { ClientMessageType } from "../../ClientMessageType.js";

export interface UpdateReadyStateMessage extends GameMessage{
    readonly type: ClientMessageType.UpdateReadyState;
    ready: boolean;
}

export class UpdateReadyStateMessageBuilder implements UpdateReadyStateMessage{
    readonly type = ClientMessageType.UpdateReadyState;
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