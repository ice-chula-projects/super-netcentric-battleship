import GameSettings from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import Board, { BoardTileUpdate } from "./Board/Board.js";
import {getOppositePlayer, Player} from "@super-netcentric-battleship/shared/Game/Player.js";
import { ShipType } from "@super-netcentric-battleship/shared/Game/ShipDefinitions.js";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";
import Coordinate from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import Ship from "./Ship/Ship.js";
import { GameState } from "@super-netcentric-battleship/shared/Game/GameState.js";
import User from "../User/User.js";
import { UpdateBoardTileStatusesNotificationMessageBuilder } from "@super-netcentric-battleship/shared/ServerMessage.js";

//responsible for game logic and sending messages to clients
export default class Game{
    id:string;
    gameSettings: GameSettings;
    boards!: {
        [Player.Player1]: Board;
        [Player.Player2]: Board;
    };

    playerUsers: {
        [Player.Player1]: User,
        [Player.Player2]: User
    };

    currentTurn: Player | null = null;
    gameState: GameState = GameState.ShipPlacement;
    score: {
        [Player.Player1]: number,
        [Player.Player2]: number
    } = {
        [Player.Player1]: 0,
        [Player.Player2]: 0
    }

    constructor(id: string, gameSettings: GameSettings, player1User: User, player2User: User){
        this.id = id;
        this.gameSettings = gameSettings;
        this.playerUsers = {
            [Player.Player1]: player1User,
            [Player.Player2]: player2User
        }

        this.resetBoards();
    }

    addShip(player: Player, shipType: ShipType, location: Coordinate, orientation: Orientation){
        if(this.gameState != GameState.ShipPlacement) throw new Error("Tried to add ship in non ship placement state") 
        const board = this.boards[player];
        const ship = Ship.fromType(shipType);
        ship.setOrientation(orientation);
        if(board.totalFleetValue + ship.value > this.gameSettings.maxFleetValue) throw new Error("Added ship will exceed maximum fleet value");

        const updatedTiles = board.placeShip(ship, location);
        this.notifyBoardTileUpdateToPlayerUser(player, player, updatedTiles);
    }

    startBattle(){
        if(this.gameState != GameState.ShipPlacement) throw new Error("Tried to start a game that isn't in ship placement state");
        this.gameState = GameState.ShipPlacement;
    }

    fire(player: Player, attackingShipId: number, location: Coordinate, orientation: Orientation){
        if(this.gameState != GameState.Battle) throw new Error("Tried to fire a volley in non Battle State");
        const attackingShip = this.boards[player].getShipById(attackingShipId);
        if(!attackingShip.alive) throw new Error("Attempted to fire a volley from a dead ship");
        const opponentPlayer = getOppositePlayer(player);
        const targetBoard = this.boards[opponentPlayer];

        const updatedTiles = targetBoard.fire(attackingShip.firingPattern, location, orientation);
        this.notifyBoardTileUpdateToBothPlayers(opponentPlayer, updatedTiles);
    }

    endGame(winner: Player){
        if(this.gameState != GameState.Battle) throw new Error("Tried to end a game in non Battle State");
        this.gameState = GameState.End;
        this.score[winner]++;
    }

    rematch(){
        if(this.gameState != GameState.End) throw new Error("Tried to rematch a game in non End State");
        this.gameState = GameState.ShipPlacement;
        this.resetBoards();
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
                shipId: boardTileUpdate.shipId
            })
        }

        user.socket.send(message.toJsonString());
    }

    resetBoards(): void{
        this.boards = {
            [Player.Player1]: new Board(this, this.gameSettings.boardSize),
            [Player.Player2]: new Board(this, this.gameSettings.boardSize)
        };
    }

}