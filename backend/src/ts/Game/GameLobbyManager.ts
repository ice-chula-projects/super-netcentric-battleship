import GameSettings from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import GameServer from "../GameServer.js";
import Random from "../lib/Random.js";
import User from "../User/User.js";
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

    createLobby(hostUser: User, name: string, description: string, isPublic: boolean): GameLobby{
        if(hostUser.currentlyInGameLobby) throw new Error("Attempted to create a new lobby while host is already in a lobby");
        const lobbyCode = this.generateNewLobbyCode();
        const lobby = new GameLobby(lobbyCode, this.gameServer.chatManager, name, description, isPublic);
        this.lobbies[lobbyCode] = lobby;
        lobby.addUser(hostUser);

        return lobby;
    }

    joinLobby(user: User, lobbyCode: string): GameLobby{
        if(user.currentlyInGameLobby) throw new Error("Attempted to join a lobby while user is already in lobby");
        const lobby = this.lobbies[lobbyCode]; 
        if(lobby == null) throw new Error("Lobby does not exist");
        lobby.addUser(user);

        return lobby;
    }

    leaveLobby(user: User){
        if(user.currentlyInGameLobby) throw new Error("Attempted to leave a lobby while user is not in lobby");
        const lobby = this.getLobby(user.currentLobbyCode!);
        lobby.removeUser(user);
        if(lobby.members.length == 0) this.removeLobby(lobby.id);
    }

    updateReadyStatus(user: User, ready: boolean){
        const lobby = this.getUsersLobby(user);
        lobby.updateReadyStatus(user, ready);
    }

    modifyGameSettings(user: User, gameSettings: Partial<GameSettings>){
        const lobby = this.getUsersLobby(user);
        lobby.requestUpdateGameSettings(user, gameSettings);
    }

    requestGameStart(user: User){
        const lobby = this.getUsersLobby(user);
        lobby.requestGameStart(user);
    }

    notifyClientActionMessage(clientActionMessage: ClientActionMessage, actingUser: User){
        const lobby = this.getUsersLobby(actingUser);
        lobby.notifyClientActionMessage(clientActionMessage, actingUser);
    }

    getUsersLobby(user: User){
        if(!user.currentLobbyCode) throw new Error("User currently not in lobby");
        return this.getLobby(user.currentLobbyCode);
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