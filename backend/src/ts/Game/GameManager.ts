import { GameActionResultNotificactionMessageBuilder, GameStateNotificationMessageBuilder, GameStates, OpponentGameActionNotificationMessageBuilder } from "@super-netcentric-battleship/shared/ServerMessage.js";
import GameServer from "../GameServer.js";
import Random from "../lib/Random.js";
import User from "../User/User.js";
import Game, { GameState, Player, ShotResult } from "./Game.js";
import { GameShip } from "./GameBoard.js";

//This will need alot of work, im not satisfied with the current architecture
//lots of unscalable shortcuts here
export default class GameManager{
    readonly gameServer: GameServer

    games: Record<string, Game> = {};

    constructor(gameServer: GameServer){
        this.gameServer = gameServer;
    }

    private endGame(gameId: string){
        const game = this.games[gameId];
        if(game == null) throw new Error("Game does not exist");

        this.gameServer.chatManager.removeChannel(game.chatChannelId);
        game.players[Player.Player1]?.setCurrentGameId(null);
        game.players[Player.Player2]?.setCurrentGameId(null);

        const notificationMessage = new GameStateNotificationMessageBuilder()
            .setGameId(gameId)
            .setGameState(GameStates.Finished);
    
        const messageJsonString = notificationMessage.toJsonString();
        game.players[Player.Player1]?.socket.send(messageJsonString);
        game.players[Player.Player2]?.socket.send(messageJsonString);

        delete this.games[gameId];
    }
    gameExists(gameId: string): boolean{
        return this.games[gameId] != null;
    }

    gameIsFull(gameId: string): boolean{
        const game = this.games[gameId];
        if(game == null) throw new Error("Game does not exist");
        return game.isFull;
    }

    createGame(gameId: string){
        if(this.gameExists(gameId)) throw new Error("Tried to create a game with a duplicate Id");
        const chatId = `${gameId}_chat#${Random.randomInteger(0,999999).toString().padStart(6, "0")}`;
        const game = new Game(gameId, chatId);
        this.gameServer.chatManager.addChannel(chatId);
        this.games[gameId] = game;
    }

    addPlayerUser(gameId: string, user: User){
        const game = this.games[gameId];
        if(game == null) throw new Error("Game does not exist");
        if(game.isFull) throw new Error("Tried to add a player to a full game");
        if(user.currentGameId != null) throw new Error("User is already part of a game");

        game.addPlayerUser(user);
        user.setCurrentGameId(gameId);
        this.gameServer.chatManager.subscribe(user, game.chatChannelId);

        const message = new GameStateNotificationMessageBuilder()
            .setGameId(gameId)
            .setChatChannelId(game.chatChannelId)
            .setGameState(GameStates.Forming);

        if(game.gameState == GameState.Setup){
            message.setGameState(GameStates.Deploying)
            game.players[Player.Player1]?.socket.send(message.toJsonString());
            game.players[Player.Player2]?.socket.send(message.toJsonString());
            return;
        };

        user.socket.send(message.toJsonString());
    }

    setUpBoard(gameId: string, user:User, ships: GameShip[]){
        const game = this.games[gameId];
        if(game == null) throw new Error("Game does not exist");
        if(game.gameState != GameState.Setup) throw new Error("Tried to add ships in non setup phase");
        const player = game.getPlayerFromUser(user); 
        game.setupBoard(player, ships);

        //if the game state changed, inform the players that battle phase has started
        //@ts-expect-error (setupBoard mutates game.gameState, but TS doesn't seem to pick up on that)
        if(game.gameState != GameState.Battle) return;
        const currentPlayerUser = game.currentPlayerUser;
        const message = new GameStateNotificationMessageBuilder()
            .setGameId(gameId)
            .setChatChannelId(game.chatChannelId)
            .setGameState(GameStates.Fighting)
        if(currentPlayerUser != null) message.setCurrentTurn({username: currentPlayerUser.username, id: currentPlayerUser.id});
        
        const messageJsonString = message.toJsonString();
        game.players[Player.Player1]?.socket.send(messageJsonString);
        game.players[Player.Player2]?.socket.send(messageJsonString);
    }

    takeTurn(gameId: string, user:User, x:number, y:number){
        const game = this.games[gameId];
        if(game == null) throw new Error("Game does not exist");
        if(game.gameState != GameState.Battle) throw new Error("Tried to take a turn in a non battle phase");
        if(!game.isUserInGame(user)) throw new Error("User is not part of the game");

        const currentTurnPlayer = game.currentPlayerUser;
        if(user != currentTurnPlayer) throw new Error("Tried to take a turn when it's not the player's turn");
        const result = game.takeTurn(x, y);

        const responseMessage = new GameActionResultNotificactionMessageBuilder()
        .setHit(result == ShotResult.Hit)
        user.socket.send(responseMessage.toJsonString());

        const notificationMessage = new OpponentGameActionNotificationMessageBuilder()
        .setX(x)
        .setY(y);
        //current player is automatically switched when game.takeTurn is called
        game.currentPlayerUser?.socket.send(notificationMessage.toJsonString());

        //@ts-expect-error (takeTurn mutates game.gameState, but TS doesn't seem to pick up on that)
        if(game.gameState == GameState.End) this.endGame(gameId);
    }
}