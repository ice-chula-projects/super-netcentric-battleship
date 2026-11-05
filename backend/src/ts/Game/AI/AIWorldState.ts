import { BoardTileState } from "@super-netcentric-battleship/shared/Game/BoardTileState.js";
import Board from "../Board/Board.js";

//class representing the world that the AI sees
export default class AIWorldState {
    readonly artificialIntelligenceBoard: Board;
    readonly playerBoardStates: BoardTileState[][] = [];
    readonly playerBoard: Board;

    constructor(playerBoard: Board, artificialIntelligenceBoard: Board) {
        this.artificialIntelligenceBoard = artificialIntelligenceBoard;
        this.playerBoard = playerBoard;

        this.playerBoardStates = [];
        for (let i = 0; i < this.playerBoard.size; i++) {
            this.playerBoardStates[i] = [];
            for (let j = 0; j < this.playerBoard.size; j++) {
                this.playerBoardStates[i][j] = BoardTileState.Hidden;
            }
        }
    }

    getTile(x: number, y: number) {
        if (x < 0 || x >= this.playerBoard.size || y < 0 || y >= this.playerBoard.size) throw new Error("Tile out of bounds")

        return this.playerBoardStates[x][y];
    }

    updateTileState(x: number, y: number, state: BoardTileState) {
        if (x < 0 || x >= this.playerBoard.size || y < 0 || y >= this.playerBoard.size) throw new Error("Tile out of bounds")
        this.playerBoardStates[x][y] = state;
    }
}