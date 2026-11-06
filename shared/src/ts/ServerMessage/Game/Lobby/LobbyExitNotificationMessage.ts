import GameMessage from "../../../GameMessage.js";
import { ServerMessageType } from "../../ServerMessageType.js";

export interface LobbyExitNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.LobbyExitNotification;
}

export class LobbyExitNotificationMessageBuilder implements LobbyExitNotificationMessage{
    readonly type = ServerMessageType.LobbyExitNotification;
    readonly timestamp: number = Date.now();
    
    toJsonString(){
        return JSON.stringify(this);
    };
}