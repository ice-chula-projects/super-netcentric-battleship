import GameSettings, { GameSettingsPresetNames, GameSettingsPresets } from "../../../Game/GameSettings.js";
import GameMessage from "../../../GameMessage.js";
import { ServerMessageType } from "../../ServerMessageType.js";

export interface LobbyInformationNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.LobbyInformationNotification;
    lobbyCode: string;
    
    name: string;
    description: string;
    isPublic: boolean;
    gameSettings: GameSettings;

    chatChannelId: string;
}

export class LobbyInformationNotificationMessageBuilder implements LobbyInformationNotificationMessage{
    readonly type = ServerMessageType.LobbyInformationNotification;
    readonly timestamp: number = Date.now();

    lobbyCode: string = "";

    name: string = "";
    description: string = "";
    isPublic: boolean = true;
    gameSettings: GameSettings = GameSettingsPresets[GameSettingsPresetNames.classic];
    
    chatChannelId: string = "";
    
    setLobbyCode(lobbyCode: string){
        this.lobbyCode = lobbyCode;
        return this;
    }

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

    setGameSettings(gameSettings: GameSettings){
        this.gameSettings = gameSettings;
        return this;
    }

    setChatChannelId(chatChannelId: string){
        this.chatChannelId = chatChannelId;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}