import GameMessage from "../../GameMessage.js";
import { ServerMessageType } from "../ServerMessageType.js";

export interface RematchStatusNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.RematchStatusNotification;
}

export class RematchStatusNotificationMessageBuilder implements RematchStatusNotificationMessage{
    readonly type = ServerMessageType.RematchStatusNotification;
    readonly timestamp: number = Date.now();

    toJsonString(){
        return JSON.stringify(this);
    };
}