import { Player } from "../../Game/Player.js";
import GameMessage from "../../GameMessage.js";
import { ServerMessageType } from "../ServerMessageType.js";
export interface RematchStatus {
    [Player.Player1]: boolean,
    [Player.Player2]: boolean
}
export interface RematchStatusNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.RematchStatusNotification;
    rematchStatus: RematchStatus;
}

export class RematchStatusNotificationMessageBuilder implements RematchStatusNotificationMessage{
    readonly type = ServerMessageType.RematchStatusNotification;
    readonly timestamp: number = Date.now();
    rematchStatus: RematchStatus = {[Player.Player1]: false, [Player.Player2]: false};

    setRematchStatus(rematchStatus: RematchStatus){
        this.rematchStatus = rematchStatus;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}