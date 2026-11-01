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

    placeShip(x: number, y: number, orientation: "right" | "down"): boolean{
        switch(orientation){
            case "down":
                if (y < 0 || y > 4) return false;
                if (x < 0 || x > 7) return false;
                for(let i = 0; i < 4; i++){
                    if(this.board[x][y+i] == BoardTileTypes.Ship) return false;
                }

                for(let i = 0; i < 4; i++){
                    this.board[x][y+i] = BoardTileTypes.Ship;
                }
                break;

            case "right":
                if (x < 0 || x > 4) return false;
                if (y < 0 || y > 7) return false;
                for(let i = 0; i < 4; i++){
                    if(this.board[x+i][y] == BoardTileTypes.Ship) return false;
                }
                for(let i = 0; i < 4; i++){
                    this.board[x+i][y] = BoardTileTypes.Ship;
                }
                break;
        }
        return true;
    }
}
