import GameMessage from "../../../GameMessage.js";
import { ClientMessageType } from "../../ClientMessageType.js";

export interface RequestPublicLobbiesMessage extends GameMessage{
    readonly type: ClientMessageType.RequestPublicLobbies;
    page: number,
    lobbiesPerPage: number | null
}

export class RequestPublicLobbiesMessageBuilder implements RequestPublicLobbiesMessage{
    readonly type = ClientMessageType.RequestPublicLobbies;
    readonly timestamp: number = Date.now();
    page: number = 0;
    lobbiesPerPage: number | null = null;
    
    setPage(page: number){
        this.page = page;
        return this;
    }

    setLobbiesPerPage(lobbiesPerPage: number | null){
        this.lobbiesPerPage = lobbiesPerPage;
        return this
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}