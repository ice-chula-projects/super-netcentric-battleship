import GameServer from "../GameServer.js";
import Random from "../lib/Random.js";
import User from "../User/User.js";
import GameLobby from "./GameLobby.js";

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
        const lobby = new GameLobby(hostUser, lobbyCode, this.gameServer.chatManager, name, description, isPublic);

        this.lobbies[lobbyCode] = lobby;

        return lobby;
    }

    joinLobby(user: User, lobbyCode: string): GameLobby{
        if(user.currentlyInGameLobby) throw new Error("Attempted to join a lobby while user is already in lobby");
        const lobby = this.lobbies[lobbyCode]; 
        if(lobby == null) throw new Error("Lobby does not exist");
        lobby.addUser(user);

        return lobby;
    }

    getLobbies(): GameLobby[]{
        return Object.values(this.lobbies);
    }

    removeLobby(lobbyCode: string){
        const lobby = this.lobbies[lobbyCode]; 
        if(lobby == null) throw new Error("Lobby does not exist");
        lobby.deleteLobby();

        delete this.lobbies[lobbyCode];
    }
}