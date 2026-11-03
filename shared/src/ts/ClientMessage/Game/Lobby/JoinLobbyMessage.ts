import GameMessage from "../../../GameMessage.js";
import { ClientMessageType } from "../../ClientMessageType.js";

export interface JoinLobbyMessage extends GameMessage{
    readonly type: ClientMessageType.joinLobby;

    lobbyCode: string
}

export class JoinLobbyMessageBuilder implements JoinLobbyMessage{
    readonly type = ClientMessageType.joinLobby;
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