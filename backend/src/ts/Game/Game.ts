import GameSettings from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import Board, { BoardTileUpdate } from "./Board/Board.js";
import {getOppositePlayer, Player} from "@super-netcentric-battleship/shared/Game/Player.js";
import { ShipType } from "@super-netcentric-battleship/shared/Game/ShipDefinitions.js";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";
import Coordinate from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import Ship from "./Ship/Ship.js";
import { GameState } from "@super-netcentric-battleship/shared/Game/GameState.js";
import ActiveUser from "../User/ActiveUser.js";
import { CurrentTurnNotificationMessageBuilder, MatchCompleteNotificationMessageBuilder, MatchStartNotificationMessageBuilder, RematchStatusNotificationMessageBuilder, UpdateBoardTileStatusesNotificationMessageBuilder } from "@super-netcentric-battleship/shared/ServerMessage.js";
import Random from "../lib/Random.js";
import { ClientActionMessage, ClientMessageType, ShipPlacement } from "@super-netcentric-battleship/shared/ClientMessage.js";

//responsible for game logic and sending messages to clients
export default class Game{
    gameSettings: GameSettings;
    boards!: {
        [Player.Player1]: Board;
        [Player.Player2]: Board;
    };

    playerUsers: {
        [Player.Player1]: ActiveUser,
        [Player.Player2]: ActiveUser
    };
    timeoutIntervalId: NodeJS.Timeout | null = null;

    currentTurn!: Player
    gameState: GameState = GameState.ShipPlacement;
    readonly score: {
        [Player.Player1]: number,
        [Player.Player2]: number
    } = {
        [Player.Player1]: 0,
        [Player.Player2]: 0
    }

    readonly fleetInitialized: {
        [Player.Player1]: boolean,
        [Player.Player2]: boolean
    } = {
        [Player.Player1]: false,
        [Player.Player2]: false
    }

    readonly rematchStatus: {
        [Player.Player1]: boolean,
        [Player.Player2]: boolean
    } = {
        [Player.Player1]: false,
        [Player.Player2]: false
    }

    get rematchWanted(): boolean{
        return this.rematchStatus[Player.Player1] && this.rematchStatus[Player.Player2];
    }

    get fleetsInitialized(): boolean{
        return this.fleetInitialized[Player.Player1] && this.fleetInitialized[Player.Player2];
    }

    constructor(gameSettings: GameSettings, player1User: ActiveUser, player2User: ActiveUser){
        this.gameSettings = gameSettings;
        this.playerUsers = {
            [Player.Player1]: player1User,
            [Player.Player2]: player2User
        }

        //random first turn
        this.randomizeTurn();
        this.initializeGame();
    }

    initializeGame(){
        this.gameState = GameState.ShipPlacement;
        this.fleetInitialized[Player.Player1] = false; 
        this.fleetInitialized[Player.Player2] = false; 
        this.resetBoards();
        this.rematchStatus[Player.Player1] = false;
        this.rematchStatus[Player.Player2] = false;

        this.notifyGameStart();
    }
    
    randomizeTurn(){
        this.currentTurn = Random.randomBoolean() ? Player.Player1 : Player.Player2;
    }

    resetTimeoutInterval(){
        if(this.timeoutIntervalId != null) clearTimeout(this.timeoutIntervalId);
        this.timeoutIntervalId = (setTimeout(this.handleTimeout.bind(this), 1000 * this.gameSettings.timeLimitPerTurn));
    }

    handleTimeout(){
        this.timeoutIntervalId = null;
        if(this.gameState != GameState.Battle) return;

        //add notification to client about timeout here
        this.switchTurns();

        this.resetTimeoutInterval();
    }

    initializeFleet(player: Player, fleet:ShipPlacement[]){
        if(this.gameState != GameState.ShipPlacement) throw new Error("Cannot initialize fleet in non ship placement state");
        if(this.fleetInitialized[player]) throw new Error("Fleet already initialized");
        if(fleet.length <= 0) throw new Error("Cannot initialize empty fleet");
        if(fleet.some(x => !this.gameSettings.allowedShipTypes.includes(x.shipType))) throw new Error("Fleet contains illegal shiptype")

        const fleetValue = fleet.map(x => Ship.fromType(x.shipType).value).reduce((a,b) => a + b);
        if(fleetValue > this.gameSettings.maxFleetValue) throw new Error("Fleet value exceeds maximum fleet value");

        const updatedTiles = [];
        for(const ship of fleet){
            updatedTiles.push(... this.addShip(player, ship.shipType, ship.location, ship.orientation));
        }

        this.fleetInitialized[player] = true;

        this.notifyBoardTileUpdateToPlayerUser(player, player, updatedTiles);

        if(this.fleetsInitialized) this.startBattle();
    }

    addShip(player: Player, shipType: ShipType, location: Coordinate, orientation: Orientation): BoardTileUpdate[]{
        const board = this.boards[player];
        const ship = Ship.fromType(shipType);
        ship.setOrientation(orientation);

        return board.placeShip(ship, location);
    }

    startBattle(){
        if(this.gameState != GameState.ShipPlacement) throw new Error("Tried to start a game that isn't in ship placement state");
        this.gameState = GameState.Battle;
        this.notifyCurrentTurn();
        this.resetTimeoutInterval();
    }

    fire(attackingPlayer: Player, attackingShipId: number, location: Coordinate, orientation: Orientation){
        if(this.gameState != GameState.Battle) throw new Error("Tried to fire a volley in non Battle State");
        const attackingShip = this.boards[attackingPlayer].getShipById(attackingShipId);
        if(!attackingShip.alive) throw new Error("Cannot fire a volley from a dead ship");
        const opponentPlayer = getOppositePlayer(attackingPlayer);
        const targetBoard = this.boards[opponentPlayer];

        const updatedTiles = targetBoard.fire(attackingShip.firingPattern, location, orientation);
        this.notifyBoardTileUpdateToBothPlayers(opponentPlayer, updatedTiles);

        this.switchTurns();
        this.resetTimeoutInterval();

        if(!targetBoard.alive) this.endMatch(attackingPlayer);
    }

    requestRematch(requestingPlayer: Player){
        if(this.gameState != GameState.End) throw new Error("Cannot rematch when game isn't over");

        this.rematchStatus[requestingPlayer] = true;
        if(this.rematchWanted) this.rematch();
        else this.notifyRematchStatus();
    }

    switchTurns(){
        this.currentTurn = getOppositePlayer(this.currentTurn);
        this.notifyCurrentTurn();
    }

    endMatch(winner: Player){
        if(this.gameState != GameState.Battle) throw new Error("Tried to end a game in non Battle State");
        this.gameState = GameState.End;
        this.score[winner]++;

        //if a rematch happens set the winner to be the first player of the next game
        this.currentTurn = winner;
        this.notifyGameEnd(winner);
    }

    //used when game is ended (i.e from player leaving)
    terminateGame(){
        if(this.timeoutIntervalId != null) clearTimeout(this.timeoutIntervalId);
    }

    rematch(){
        if(this.gameState != GameState.End) throw new Error("Tried to rematch a game in non End State");
        if(!this.rematchWanted) throw new Error("Cannot rematch when both players aren't ready");
        this.initializeGame();
    }

    takeAction(clientActionMessage: ClientActionMessage, actingPlayer: Player){
        switch(clientActionMessage.type){
            case ClientMessageType.FireVolleyAction:
                if(actingPlayer != this.currentTurn) throw new Error("Cannot fire a volley when it isn't the player's turn");
                this.fire(actingPlayer, clientActionMessage.originatingShipId, clientActionMessage.targetCoordinates, clientActionMessage.volleyOrientation);
            break;
            case ClientMessageType.InitializeFleetAction:
                this.initializeFleet(actingPlayer, clientActionMessage.fleet);
            break;
            case ClientMessageType.UseAbilityAction:
                if(actingPlayer != this.currentTurn) throw new Error("Cannot use ability when it isn't the player's turn");
                throw new Error("Abilities have not been implemented");
            break;
            case ClientMessageType.RequestRematchAction:
                this.requestRematch(actingPlayer);
            break;
            default:
                throw new Error("Unsupported client action message");
        }
    }

    notifyBoardTileUpdateToBothPlayers(boardOwner: Player, boardTileUpdates: BoardTileUpdate[]){
        this.notifyBoardTileUpdateToPlayerUser(Player.Player1, boardOwner, boardTileUpdates);
        this.notifyBoardTileUpdateToPlayerUser(Player.Player2, boardOwner, boardTileUpdates);
    }

    notifyBoardTileUpdateToPlayerUser(targetUserPlayer: Player, boardOwner: Player, boardTileUpdates: BoardTileUpdate[]){
        const user = this.playerUsers[targetUserPlayer];
        if(user == null) throw new Error("Tried to notify user before user is initialized");
        const message = new UpdateBoardTileStatusesNotificationMessageBuilder()
        for(const boardTileUpdate of boardTileUpdates){
            message.addBoardTileStatus({
                boardOwner: boardOwner,
                state: boardTileUpdate.state,
                coordinate: boardTileUpdate.coordinates,
                health: boardTileUpdate.health,
                maxHealth: boardTileUpdate.maxHealth,
                shipId: boardTileUpdate.shipId,
                shipType: boardTileUpdate.shipType
            })
        }

        user.socket.send(message.toJsonString());
    }

    notifyGameStart(){
        const message = new MatchStartNotificationMessageBuilder();

        this.playerUsers[Player.Player1].socket.send(message.toJsonString());
        this.playerUsers[Player.Player2].socket.send(message.toJsonString());
    }

    notifyGameEnd(winner: Player){
        const message = new MatchCompleteNotificationMessageBuilder()
        .setScore(this.score)
        .setWinner(winner);

        this.playerUsers[Player.Player1].socket.send(message.toJsonString());
        this.playerUsers[Player.Player2].socket.send(message.toJsonString());
    }

    notifyRematchStatus(){
        const message = new RematchStatusNotificationMessageBuilder()
        .setRematchStatus(this.rematchStatus);

        this.playerUsers[Player.Player1].socket.send(message.toJsonString());
        this.playerUsers[Player.Player2].socket.send(message.toJsonString());
        
    }

    notifyCurrentTurn(){
        const message = new CurrentTurnNotificationMessageBuilder()
        .setCurrentTurn(this.currentTurn);

        this.playerUsers[Player.Player1].socket.send(message.toJsonString());
        this.playerUsers[Player.Player2].socket.send(message.toJsonString());
    }

    resetBoards(): void{
        this.boards = {
            [Player.Player1]: new Board(this, this.gameSettings.boardSize),
            [Player.Player2]: new Board(this, this.gameSettings.boardSize)
        };
    }

}