import GameMessage from "../../GameMessage.js";
import { ServerMessageType } from "../ServerMessageType.js";

export interface MatchStartNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.MatchStartNotification;
}

export class MatchStartNotificationMessageBuilder implements MatchStartNotificationMessage{
    readonly type = ServerMessageType.MatchStartNotification;
    readonly timestamp: number = Date.now();

    toJsonString(){
        return JSON.stringify(this);
    };
}