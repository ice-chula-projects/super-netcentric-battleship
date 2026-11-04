import { ClientMessageType } from "./ClientMessageType.js";
export class LoginMessageBuilder {
    type = ClientMessageType.Login;
    timestamp = Date.now();
    username = "";
    password = "";
    setUsername(username) {
        this.username = username;
        return this;
    }
    setPassword(password) {
        this.password = password;
        return this;
    }
    toJsonString() {
        return JSON.stringify(this);
    }
}
