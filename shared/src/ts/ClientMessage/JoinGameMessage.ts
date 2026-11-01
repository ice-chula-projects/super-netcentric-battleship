import GameMessage from "../GameMessage.js";
import { ClientMessageType } from "./ClientMessageType.js";

export interface JoinGameMessage extends GameMessage{
    readonly type: ClientMessageType.JoinGame;
    gameId: string
}

export class JoinGameMessageBuilder implements JoinGameMessage{
    readonly type = ClientMessageType.JoinGame;
    readonly timestamp: number = Date.now();
    gameId: string = "";
    
    setGameId(gameId: string){
        this.gameId = gameId;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}