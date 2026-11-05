import { Player } from "../../../Game/Player.js";
import Score from "../../../Game/Score.js";
import GameMessage from "../../../GameMessage.js";
import { ServerMessageType } from "../../ServerMessageType.js";

export interface GameEndNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.GameEndNotification;
    finalScore: Score;
    reason: string;
}

export class GameEndNotificationMessageBuilder implements GameEndNotificationMessage{
    readonly type = ServerMessageType.GameEndNotification;
    readonly timestamp: number = Date.now();
    finalScore: Score = {[Player.Player1]: 0, [Player.Player2]: 0};
    reason: string = "";

    setFinalScore(finalScore: Score){
        this.finalScore = finalScore;
        return this;
    }

    setReason(reason: string){
        this.reason = reason;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}