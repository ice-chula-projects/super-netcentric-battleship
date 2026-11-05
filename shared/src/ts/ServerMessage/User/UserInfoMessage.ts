import GameMessage from "../../GameMessage.js";
import { ServerMessageType } from "../ServerMessageType.js";

export interface UserInfo {
    id: string;
    username: string;
    //will be null when requesting a user from the database;
    subscribedChatChannelIds: string[] | null;
    isAdmin: boolean;
    isGuest: boolean;
}

export interface UserInfoMessage extends GameMessage {
    readonly type: ServerMessageType.UserInfo;
    userInfo: UserInfo
}

export class UserInfoMessageBuilder implements UserInfoMessage {
    readonly type = ServerMessageType.UserInfo;
    readonly timestamp: number = Date.now();

    userInfo: UserInfo = {
        id: "",
        username: "",
        subscribedChatChannelIds: [],
        isAdmin: false,
        isGuest: false
    };

    setId(id: string) {
        this.userInfo.id = id;
        return this;
    }

    setUsername(username: string) {
        this.userInfo.username = username;
        return this;
    }

    setSubscribedChatChannelIds(subscribedChatChannelIds: string[] | null) {
        this.userInfo.subscribedChatChannelIds = subscribedChatChannelIds;
        return this;
    }

    setIsAdmin(isAdmin: boolean) {
        this.userInfo.isAdmin = isAdmin;
        return this;
    }

    setIsGuest(isGuest: boolean) {
        this.userInfo.isGuest = isGuest;
        return this;
    }

    toJsonString(): string {
        return JSON.stringify(this);
    };
}