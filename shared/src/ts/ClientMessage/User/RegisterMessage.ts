import GameMessage from "../../GameMessage.js";
import { ClientMessageType } from "../ClientMessageType.js";

export interface RegisterMessage extends GameMessage {
    readonly type: ClientMessageType.Register;
    username: string;
    password: string;
}

export class RegisterMessageBuilder implements RegisterMessage {
    readonly type = ClientMessageType.Register;
    readonly timestamp: number = Date.now();

    username: string = "";
    password: string = "";

    setUsername(username: string) {
        this.username = username;
        return this;
    }

    setPassword(password: string) {
        this.password = password;
        return this;
    }

    toJsonString() {
        return JSON.stringify(this);
    }
}