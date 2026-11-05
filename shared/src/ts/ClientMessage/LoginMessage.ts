import GameMessage from "../GameMessage.js";
import { ClientMessageType } from "./ClientMessageType.js";

export interface LoginMessage extends GameMessage {
    readonly type: ClientMessageType.Login;
    username: string;
    password: string;
}

export class LoginMessageBuilder implements LoginMessage {
    readonly type = ClientMessageType.Login;
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