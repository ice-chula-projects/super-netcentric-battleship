import GameMessage from "../../../GameMessage.js";
import { ServerMessageType } from "../../ServerMessageType.js";

export interface GameEndNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.GameEndNotification;
}

export class GameEndNotificationMessageBuilder implements GameEndNotificationMessage{
    readonly type = ServerMessageType.GameEndNotification;
    readonly timestamp: number = Date.now();
    
    toJsonString(){
        return JSON.stringify(this);
    };
}