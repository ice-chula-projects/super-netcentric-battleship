import GameMessage from "../../../GameMessage.js";
import { ClientMessageType } from "../../ClientMessageType.js";

export interface ExitLobbyMessage extends GameMessage{
    readonly type: ClientMessageType.ExitLobby;
}

export class ExitLobbyMessageBuilder implements ExitLobbyMessage{
    readonly type = ClientMessageType.ExitLobby;
    readonly timestamp: number = Date.now();

    toJsonString(){
        return JSON.stringify(this);
    };
}