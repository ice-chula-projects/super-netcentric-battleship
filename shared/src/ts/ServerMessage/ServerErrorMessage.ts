import GameMessage from "../GameMessage.js";
import { ServerMessageType } from "./ServerMessageType.js";

export interface ServerErrorMessage extends GameMessage{
    readonly type: ServerMessageType.Error;
    error: string;
}

export class ServerErrorMessageBuilder implements ServerErrorMessage{
    readonly type = ServerMessageType.Error;
    readonly timestamp: number = Date.now();

    error: string = "";
    
    setError(error: string){
        this.error = error;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}