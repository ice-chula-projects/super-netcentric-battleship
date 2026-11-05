import GameSettings, { GameSettingsPresetNames, GameSettingsPresets } from "../../../Game/GameSettings.js";
import { Player } from "../../../Game/Player.js";
import GameMessage from "../../../GameMessage.js";
import { ServerMessageType } from "../../ServerMessageType.js";

export interface LobbyPlayerInformation{
    userId: string,
    username: string,
    isHost: boolean,
    playerId: Player,
    ready: boolean
}

export interface LobbyInfoNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.LobbyInfoNotification;
    lobbyCode: string;
    
    name: string;
    description: string;
    isPublic: boolean;
    gameSettings: GameSettings;

    chatChannelId: string;

    connectedUsers: LobbyPlayerInformation[]
}

export class LobbyInfoNotificationMessageBuilder implements LobbyInfoNotificationMessage{
    readonly type = ServerMessageType.LobbyInfoNotification;
    readonly timestamp: number = Date.now();

    lobbyCode: string = "";

    name: string = "";
    description: string = "";
    isPublic: boolean = true;
    gameSettings: GameSettings = GameSettingsPresets[GameSettingsPresetNames.Classic];
    
    chatChannelId: string = "";
    connectedUsers: LobbyPlayerInformation[] = [];
    
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

    setConnectedUsers(connectedUsers: LobbyPlayerInformation[]){
        this.connectedUsers = connectedUsers;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}