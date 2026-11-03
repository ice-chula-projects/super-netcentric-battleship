import GameMessage from "../../../GameMessage.js";
import { ClientMessageType } from "../../ClientMessageType.js";

export interface RequestPublicLobbiesMessage extends GameMessage{
    readonly type: ClientMessageType.requestPublicLobbies;
}

export class RequestPublicLobbiesMessageBuilder implements RequestPublicLobbiesMessage{
    readonly type = ClientMessageType.requestPublicLobbies;
    readonly timestamp: number = Date.now();

    toJsonString(){
        return JSON.stringify(this);
    };
}