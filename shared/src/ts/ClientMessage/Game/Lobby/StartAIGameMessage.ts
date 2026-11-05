import GameMessage from "../../../GameMessage.js";
import { ClientMessageType } from "../../ClientMessageType.js";

export interface StartAIGameMessage extends GameMessage{
    readonly type: ClientMessageType.StartAIGame;
}

export class StartAIGameMessageBuilder implements StartAIGameMessage{
    readonly type = ClientMessageType.StartAIGame;
    readonly timestamp: number = Date.now();

    toJsonString(){
        return JSON.stringify(this);
    };
}