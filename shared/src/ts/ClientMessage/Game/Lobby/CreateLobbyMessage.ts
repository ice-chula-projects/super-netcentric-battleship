import GameMessage from "../../../GameMessage.js";
import { ClientMessageType } from "../../ClientMessageType.js";

export interface CreateLobbyMessage extends GameMessage{
    readonly type: ClientMessageType.createLobby;

    name: string;
    description: string;
    isPublic: boolean;
}

export class CreateLobbyMessageBuilder implements CreateLobbyMessage{
    readonly type = ClientMessageType.createLobby;
    readonly timestamp: number = Date.now();

    name: string = "Untitled Lobby";
    description: string = "";
    isPublic: boolean = true;

    setName(name: string){
        this.name = name;
        return this;
    }

    setDescription(description: string){
        this.description = description;
        return this;
    }

    setIsPublic(isPublic: boolean){
        this.isPublic = isPublic;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}