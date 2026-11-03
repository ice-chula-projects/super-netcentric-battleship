import { BoardTileState } from "@super-netcentric-battleship/shared/Game/BoardTileState.js";
import { BoardTileStatus } from "@super-netcentric-battleship/shared/ServerMessage.js";

export interface BoardTile{
    state: BoardTileState;
    health: number | null;
    maxHealth: number | null;
    shipId: number | null;
}

//holds the state of the board
export default class GameBoard{
    readonly board: BoardTile[][] = [];
    readonly size: number;

    constructor(size: number){
        this.size = size;
        for(let i = 0; i < this.size; i++){
            this.board[i] = [];
            for(let j = 0; j < this.size; j++){
                this.board[i][j] = {
                    state: BoardTileState.Hidden,
                    health: null,
                    maxHealth: null,
                    shipId: null
                };
            }
        }
    }

    updateTileState(state: BoardTileStatus){
        this.board[state.coordinate.x][state.coordinate.y] = {
            state: state.state,
            health: state.health,
            maxHealth: state.maxHealth,
            shipId: state.shipId
        };
    }
}
