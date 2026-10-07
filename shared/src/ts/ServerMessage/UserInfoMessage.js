import { ServerMessageType } from "./ServerMessageType.js";
export class UserInfoMessageBuilder {
    type = ServerMessageType.UserInfo;
    userInfo = { id: null, username: null };
    setId(id) {
        this.userInfo.id = id;
        return this;
    }
    setUsername(username) {
        this.userInfo.username = username;
        return this;
    }
    toJsonString() {
        return JSON.stringify(this);
    }
    ;
}
