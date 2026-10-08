export enum BoardTileTypes{
    Empty,
    Ship,
    Hit,
    Miss
}

export default class GameBoard{
    readonly board: BoardTileTypes[][] = [];

    constructor(){
        for(let i = 0; i < 8; i++){
            this.board[i] = [];
            for(let j = 0; j < 8; j++){
                this.board[i][j] = BoardTileTypes.Empty;
            }
        }
    }

    setTile(x:number ,y:number, type: BoardTileTypes){
        this.board[x][y] = type;
    }

    shootTile(x: number, y:number){
        const tile = this.board[x][y];

        this.board[x][y] = tile == BoardTileTypes.Ship ? BoardTileTypes.Hit : BoardTileTypes.Miss;
    }
}
