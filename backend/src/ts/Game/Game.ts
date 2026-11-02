import GameSettings from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import Board from "./Board/Board.js";
import {getOppositePlayer, Player} from "@super-netcentric-battleship/shared/Game/Player.js";
import { ShipType } from "@super-netcentric-battleship/shared/Game/ShipDefinitions.js";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";
import Coordinate from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import Ship from "./Ship/Ship.js";
import { GameState } from "@super-netcentric-battleship/shared/Game/GameState.js";
import User from "../User/User.js";
export default class Game{
    id:string;
    gameSettings: GameSettings;
    boards: {
        [Player.Player1]: Board,
        [Player.Player2]: Board
    } | null = null;

    playerUsers: {
        [Player.Player1]: User | null,
        [Player.Player2]: User | null
    } = {[Player.Player1]: null, [Player.Player2]: null};

    currentTurn: Player | null = null;
    gameState: GameState = GameState.Lobby;
    score: {
        [Player.Player1]: number,
        [Player.Player2]: number
    } = {
        [Player.Player1]: 0,
        [Player.Player2]: 0
    }

    constructor(id: string, gameSettings: GameSettings){
        this.id = id;
        this.gameSettings = gameSettings;
    }

    addShip(player: Player, shipType: ShipType, location: Coordinate, orientation: Orientation){
        if(this.boards == null) throw new Error("Attempted to add a ship before board is set up")
        const board = this.boards[player];
        const ship = Ship.fromType(shipType);
        ship.setOrientation(orientation);
        board.placeShip(ship, location);
    }

    fire(player: Player, attackingShipId: number, location: Coordinate, orientation: Orientation){
        if(this.boards == null) throw new Error("Attempted to fire a volley before board is set up");
        const attackingShip = this.boards[player].getShipById(attackingShipId);
        if(!attackingShip.alive) throw new Error("Attempted to fire a volley from a dead ship");

        const targetBoard = this.boards[getOppositePlayer(player)];

        targetBoard.fire(attackingShip.firingPattern, location, orientation);
    }

    initializeBoards(): void{
        this.boards = {
            [Player.Player1]: new Board(this,Player.Player1, this.gameSettings.boardSize),
            [Player.Player2]: new Board(this,Player.Player2,  this.gameSettings.boardSize)
        };
    }

}