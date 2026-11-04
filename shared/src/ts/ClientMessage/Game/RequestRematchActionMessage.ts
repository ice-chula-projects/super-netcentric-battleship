import GameMessage from "../../GameMessage.js";
import { ClientMessageType } from "../ClientMessageType.js";

export interface RequestRematchActionMessage extends GameMessage{
    readonly type: ClientMessageType.RequestRematchAction;
}

export class RequestRematchActionMessageBuilder implements RequestRematchActionMessage{
    readonly type = ClientMessageType.RequestRematchAction;
    readonly timestamp: number = Date.now();

    toJsonString(){
        return JSON.stringify(this);
    };
}