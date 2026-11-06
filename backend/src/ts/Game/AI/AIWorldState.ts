import { BoardTileState } from "@super-netcentric-battleship/shared/Game/BoardTileState.js";
import Board, { BoardTileUpdate } from "../Board/Board.js";
import Coordinate from "@super-netcentric-battleship/shared/Game/Coordinate.js";

//class representing the world that the AI sees
interface GameTile {
    coordinate: Coordinate,
    state: BoardTileState,
    health: number | null
}

export default class AIWorldState {
    readonly artificialIntelligenceBoard: Board;
    readonly playerBoardStates: GameTile[][] = [];
    readonly playerBoard: Board;

    constructor(playerBoard: Board, artificialIntelligenceBoard: Board) {
        this.artificialIntelligenceBoard = artificialIntelligenceBoard;
        this.playerBoard = playerBoard;

        this.playerBoardStates = [];
        for (let i = 0; i < this.playerBoard.size; i++) {
            this.playerBoardStates[i] = [];
            for (let j = 0; j < this.playerBoard.size; j++) {
                this.playerBoardStates[i][j] = {
                    coordinate: {x:i, y:j},
                    state: BoardTileState.Hidden,
                    health: null
                };
            }
        }
    }

    getTiles(): GameTile[]{
        const gameTiles: GameTile[] = [];
        for(let i = 0; i < this.playerBoard.size; i++){
            for(let j = 0; j < this.playerBoard.size; j++){
                gameTiles.push(this.playerBoardStates[i][j]);
            }
        }

        return gameTiles;
    }

    getTile(x: number, y: number) {
        if (x < 0 || x >= this.playerBoard.size || y < 0 || y >= this.playerBoard.size) return null;

        return this.playerBoardStates[x][y];
    }

    updateTileState(x: number, y: number, update: BoardTileUpdate) {
        if (x < 0 || x >= this.playerBoard.size || y < 0 || y >= this.playerBoard.size) throw new Error("Tile out of bounds")
        this.playerBoardStates[x][y] = {
            coordinate: {x:x, y:y},
            health: update.health,
            state: update.state
        };
    }
}