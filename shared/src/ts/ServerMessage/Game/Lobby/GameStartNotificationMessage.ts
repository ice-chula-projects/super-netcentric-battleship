import { Player } from "../../../Game/Player.js";
import GameMessage from "../../../GameMessage.js";
import { ServerMessageType } from "../../ServerMessageType.js";

interface GameStartNotificationPlayer{
    userId: string,
    player: Player
}

export interface GameStartNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.GameStartNotification;

    players: GameStartNotificationPlayer[];
}

export class GameStartNotificationMessageBuilder implements GameStartNotificationMessage{
    readonly type = ServerMessageType.GameStartNotification;
    readonly timestamp: number = Date.now();

    players: GameStartNotificationPlayer[] = [];

    setPlayers(players: GameStartNotificationPlayer[]){
        this.players = players;
        return this;
    }
    
    toJsonString(){
        return JSON.stringify(this);
    };
}