import GameMessage from "../../GameMessage.js";
import { ClientMessageType } from "../ClientMessageType.js";

export interface UseAbilityActionMessage extends GameMessage{
    readonly type: ClientMessageType.UseAbilityAction;
}

export class UseAbilityActionMessageBuilder implements UseAbilityActionMessage{
    readonly type = ClientMessageType.UseAbilityAction;
    readonly timestamp: number = Date.now();

    toJsonString(){
        return JSON.stringify(this);
    };
}