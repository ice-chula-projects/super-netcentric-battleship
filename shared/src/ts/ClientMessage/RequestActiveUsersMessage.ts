import GameMessage from "../GameMessage.js";
import { ClientMessageType } from "./ClientMessageType.js";

export interface RequestActiveUsersMessage extends GameMessage{
    readonly type: ClientMessageType.RequestActiveUsersMessage;
    page: number,
    usersPerPage: number | null
}

export class RequestActiveUsersMessageBuilder implements RequestActiveUsersMessage{
    readonly type = ClientMessageType.RequestActiveUsersMessage;
    readonly timestamp: number = Date.now();
    page: number = 0;
    usersPerPage: number | null = null;

    setPage(page: number){
        this.page = page;
        return this;
    }

    setUsersPerPage(usersPerPage: number){
        this.usersPerPage = usersPerPage;
        return this;
    }
    
    toJsonString(){
        return JSON.stringify(this);
    };
}