import GameSettings, { GameSettingsPresetNames } from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import GameServer from "../GameServer.js";
import Random from "../lib/Random.js";
import ActiveUser from "../User/ActiveUser.js";
import GameLobby from "./GameLobby.js";
import { ClientActionMessage } from "@super-netcentric-battleship/shared/ClientMessage.js";

export default class GameLobbyManager{
    readonly gameServer: GameServer;
    lobbies: Record<string, GameLobby> = {};

    constructor(gameServer: GameServer){
        this.gameServer = gameServer;
    }

    generateNewLobbyCode(): string{
        const existngLobbyCodes = Object.keys(this.lobbies);
        while(true){
            const lobbyCode = "#" + Random.randomInteger(0,999999).toString().padStart(6, "0");
            if(existngLobbyCodes.includes(lobbyCode)) continue;
            return lobbyCode;
        }
    }

    createLobby(hostUser: ActiveUser, name: string, description: string, isPublic: boolean, gameSettingPreset: GameSettingsPresetNames): GameLobby{
        if(hostUser.currentlyInGameLobby) throw new Error("Attempted to create a new lobby while host is already in a lobby");
        const lobbyCode = this.generateNewLobbyCode();
        const lobby = new GameLobby(lobbyCode, this.gameServer.chatManager, name, description, isPublic, gameSettingPreset);
        this.lobbies[lobbyCode] = lobby;
        lobby.addUser(hostUser);

        return lobby;
    }

    joinLobby(user: ActiveUser, lobbyCode: string): GameLobby{
        if(user.currentlyInGameLobby) throw new Error("Attempted to join a lobby while user is already in lobby");
        const lobby = this.lobbies[lobbyCode]; 
        if(lobby == null) throw new Error("Lobby does not exist");
        lobby.addUser(user);

        return lobby;
    }

    leaveLobby(user: ActiveUser){
        if(!user.currentlyInGameLobby) throw new Error("Attempted to leave a lobby while user is not in lobby");
        const lobby = this.getUsersLobby(user);
        lobby.removeUser(user);
        if(lobby.members.length == 0) this.removeLobby(lobby.id);
    }

    updateReadyStatus(user: ActiveUser, ready: boolean){
        const lobby = this.getUsersLobby(user);
        lobby.updateReadyStatus(user, ready);
    }

    modifyGameSettings(user: ActiveUser, gameSettings: Partial<GameSettings>){
        const lobby = this.getUsersLobby(user);
        lobby.requestUpdateGameSettings(user, gameSettings);
    }

    requestGameStart(user: ActiveUser){
        const lobby = this.getUsersLobby(user);
        lobby.requestGameStart(user);
    }

    requestAIGameStart(user: ActiveUser){
        const lobby = this.getUsersLobby(user);
        lobby.requestAIGameStart(user);
    }

    notifyClientActionMessage(clientActionMessage: ClientActionMessage, actingUser: ActiveUser){
        const lobby = this.getUsersLobby(actingUser);
        lobby.notifyClientActionMessage(clientActionMessage, actingUser);
    }

    getUsersLobby(user: ActiveUser){
        if(user.currentLobby == null) throw new Error("User currently not in lobby");
        return user.currentLobby;
    }

    getLobbies(): GameLobby[]{
        return Object.values(this.lobbies);
    }

    getPublicLobbies(): GameLobby[]{
        return this.getLobbies().filter(x => x.isPublic);
    }

    getLobby(lobbyCode:string){
        if(this.lobbies[lobbyCode] == null) throw new Error("Lobby does not exist");
        return this.lobbies[lobbyCode];
    }

    removeLobby(lobbyCode: string){
        const lobby = this.getLobby(lobbyCode);
        lobby.deleteLobby();

        delete this.lobbies[lobbyCode];
    }
}