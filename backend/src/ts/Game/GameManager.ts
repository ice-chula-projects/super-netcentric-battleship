import GameServer from "../GameServer.js";
import Random from "../lib/Random.js";
import User from "../User/User.js";
import Game from "./Game.js";
import Lobby from "./Lobby.js";

export default class GameManager{
    readonly gameServer: GameServer;
    activeGames: Record<string, Game> = {};
    lobbies: Record<string, Lobby> = {};

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

    createLobby(hostUser: User){
        const lobbyCode = this.generateNewLobbyCode();
        const lobby = new Lobby(hostUser, lobbyCode);

        this.lobbies[lobbyCode] = lobby;
    }
}