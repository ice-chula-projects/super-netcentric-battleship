import { Player } from "../../Game/Player.js";
import Score from "../../Game/Score.js";
import GameMessage from "../../GameMessage.js";
import { ServerMessageType } from "../ServerMessageType.js";

export interface MatchCompleteNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.MatchCompleteNotification;
    winner: Player;
    score: Score;
}

export class MatchCompleteNotificationMessageBuilder implements MatchCompleteNotificationMessage{
    readonly type = ServerMessageType.MatchCompleteNotification;
    readonly timestamp: number = Date.now();
    winner: Player = Player.Player1;
    score: Score = {[Player.Player1]: 0, [Player.Player2]: 0};

    setWinner(winner: Player){
        this.winner = winner;
        return this;
    }

    setScore(score: Score){
        this.score = score;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}