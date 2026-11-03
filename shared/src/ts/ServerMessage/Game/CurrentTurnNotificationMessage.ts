
import { Player } from "../../Game/Player.js";
import GameMessage from "../../GameMessage.js";
import { ServerMessageType } from "../ServerMessageType.js";

export interface CurrentTurnNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.CurrentTurnNotification;
    currentTurn: Player;
}

export class CurrentTurnNotificationMessageBuilder implements CurrentTurnNotificationMessage{
    readonly type = ServerMessageType.CurrentTurnNotification;
    readonly timestamp: number = Date.now();
    currentTurn: Player = Player.Player1;

    setCurrentTurn(currentTurn: Player){
        this.currentTurn = currentTurn;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}