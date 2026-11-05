import GameMessage from "../../GameMessage.js";
import { ClientMessageType } from "../ClientMessageType.js";

export interface ResetGameLobbyMessage extends GameMessage{
    readonly type: ClientMessageType.ResetGameLobbyMessage;
    lobbyCode: string
}

export class ResetGameLobbyMessageBuilder implements ResetGameLobbyMessage{
    readonly type = ClientMessageType.ResetGameLobbyMessage;
    readonly timestamp: number = Date.now();
    lobbyCode: string = "";

    setLobbyCode(lobbyCode: string){
        this.lobbyCode = lobbyCode;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}