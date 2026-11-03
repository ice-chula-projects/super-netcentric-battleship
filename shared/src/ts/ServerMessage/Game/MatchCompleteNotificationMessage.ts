import GameMessage from "../../GameMessage.js";
import { ServerMessageType } from "../ServerMessageType.js";

export interface MatchCompleteNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.MatchCompleteNotification;
}

export class MatchCompleteNotificationMessageBuilder implements MatchCompleteNotificationMessage{
    readonly type = ServerMessageType.MatchCompleteNotification;
    readonly timestamp: number = Date.now();

    toJsonString(){
        return JSON.stringify(this);
    };
}