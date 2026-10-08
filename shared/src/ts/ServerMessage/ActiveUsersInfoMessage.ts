import GameMessage from "../GameMessage.js";
import { ServerMessageType } from "./ServerMessageType.js";

export interface ActiveUsersInfoMessage extends GameMessage{
    readonly type: ServerMessageType.ActiveUsersInfo;
    page: number;
    usersPerPage: number;
    activeUsers: {username:string, id:string}[];
    totalActiveUsers: number;
}

export class ActiveUsersInfoMessageBuilder implements ActiveUsersInfoMessage{
    readonly type = ServerMessageType.ActiveUsersInfo;
    readonly timestamp: number = Date.now();
    page: number = 0;
    usersPerPage: number = 0;
    activeUsers: { username: string; id: string; }[] = [];
    totalActiveUsers: number = 0;
    setPage(page: number){
        this.page = page;
        return this;
    }

    setUsersPerPage(usersPerPage: number){
        this.usersPerPage = Math.max(usersPerPage, this.activeUsers.length);
        return this;
    }

    setActiveUsers(activeUsers: typeof this.activeUsers){
        this.activeUsers = activeUsers;
        this.usersPerPage = Math.max(this.usersPerPage, this.activeUsers.length);
        return this;
    }

    setTotalActiveUsers(totalActiveUsers: number){
        this.totalActiveUsers = totalActiveUsers;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}