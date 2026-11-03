import GameMessage from "../../../GameMessage.js";
import { ClientMessageType } from "../../ClientMessageType.js";

export interface StartGameMessage extends GameMessage{
    readonly type: ClientMessageType.StartGame;
}

export class StartGameMessageBuilder implements StartGameMessage{
    readonly type = ClientMessageType.StartGame;
    readonly timestamp: number = Date.now();

    toJsonString(){
        return JSON.stringify(this);
    };
}