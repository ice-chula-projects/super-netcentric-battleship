import GameSettings from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import Board from "./Board/Board.js";
import {Player} from "@super-netcentric-battleship/shared/Game/Player.js";
export default class Game{
    gameSettings: GameSettings;
    boards: {
        [Player.Player1]: Board,
        [Player.Player2]: Board
    }
    constructor(gameSettings: GameSettings){
        this.gameSettings = gameSettings;

        this.boards = {
            [Player.Player1]: new Board(gameSettings.boardSize),
            [Player.Player2]: new Board(gameSettings.boardSize)
        }
    }
}