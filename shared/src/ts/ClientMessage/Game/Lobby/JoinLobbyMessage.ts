import GameMessage from "../../../GameMessage.js";
import { ClientMessageType } from "../../ClientMessageType.js";

export interface JoinLobbyMessage extends GameMessage{
    readonly type: ClientMessageType.JoinLobby;

    lobbyCode: string
}

export class JoinLobbyMessageBuilder implements JoinLobbyMessage{
    readonly type = ClientMessageType.JoinLobby;
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