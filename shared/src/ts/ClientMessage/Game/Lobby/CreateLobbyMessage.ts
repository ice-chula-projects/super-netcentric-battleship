import { GameSettingsPresetNames } from "../../../Game/GameSettings.js";
import GameMessage from "../../../GameMessage.js";
import { ClientMessageType } from "../../ClientMessageType.js";

export interface CreateLobbyMessage extends GameMessage{
    readonly type: ClientMessageType.CreateLobby;

    name: string;
    description: string;
    isPublic: boolean;
    gameSettingsPreset: GameSettingsPresetNames;
}

export class CreateLobbyMessageBuilder implements CreateLobbyMessage{
    readonly type = ClientMessageType.CreateLobby;
    readonly timestamp: number = Date.now();

    name: string = "Untitled Lobby";
    description: string = "";
    isPublic: boolean = true;
    gameSettingsPreset: GameSettingsPresetNames = GameSettingsPresetNames.Classic; 

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

    setGameSettingsPreset(gameSettingsPreset: GameSettingsPresetNames){
        this.gameSettingsPreset = gameSettingsPreset;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}