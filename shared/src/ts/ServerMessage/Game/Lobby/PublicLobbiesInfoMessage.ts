import GameMessage from "../../../GameMessage.js";
import { ServerMessageType } from "../../ServerMessageType.js";

export interface PublicLobbyInformation{
    lobbyCode: string;
    name: string;
    description: string;
    memberCount: number;
}

export interface PublicLobbiesInfoMessage extends GameMessage{
    readonly type: ServerMessageType.PublicLobbiesInfo;
    page: number;
    lobbiesPerPage: number;
    lobbies: PublicLobbyInformation[];
    totalLobbies: number;
}

export class PublicLobbiesInfoMessageBuilder implements PublicLobbiesInfoMessage{
    readonly type = ServerMessageType.PublicLobbiesInfo;
    readonly timestamp: number = Date.now();
    page: number = 0;
    lobbiesPerPage: number = 0;
    lobbies: PublicLobbyInformation[] = [];
    totalLobbies: number = 0;
    setPage(page: number){
        this.page = page;
        return this;
    }

    setlobbiesPerPage(lobbiesPerPage: number){
        this.lobbiesPerPage = lobbiesPerPage;
        return this;
    }

    setLobbies(lobbies: PublicLobbyInformation[]){
        this.lobbies = lobbies;
        return this;
    }

    setTotalLobbies(totalLobbies: number){
        this.totalLobbies = totalLobbies;
        return this;
    }
    toJsonString(){
        return JSON.stringify(this);
    };
}