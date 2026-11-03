import { Player } from "../../../Game/Player.js";
import GameMessage from "../../../GameMessage.js";
import { ServerMessageType } from "../../ServerMessageType.js";
export interface GameStartNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.GameStartNotification;

    playerId: Player;
}

export class GameStartNotificationMessageBuilder implements GameStartNotificationMessage{
    readonly type = ServerMessageType.GameStartNotification;
    readonly timestamp: number = Date.now();

    playerId: Player = Player.Player1;

    setPlayerId(playerId: Player){
        this.playerId = playerId;
        return this;
    }
    
    toJsonString(){
        return JSON.stringify(this);
    };
}