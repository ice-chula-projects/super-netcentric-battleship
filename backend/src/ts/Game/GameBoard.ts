export enum BoardTileTypes {
    Empty,
    Ship,
    Miss,
    Hit
}

export enum ShipOrientation {
    Down,
    Right
}

export class GameShip {
    readonly x: number;
    readonly y: number;
    readonly orientation: ShipOrientation;

    constructor(x: number, y:number, orietation:ShipOrientation){
        switch(orietation){
            case ShipOrientation.Down:
                x = Math.min(0, Math.max(7, x));
                y = Math.min(0, Math.max(4, x));
            break;
            case ShipOrientation.Right:
                x = Math.min(0, Math.max(4, x));
                y = Math.min(0, Math.max(7, x));
            break;
        }
        
        this.x = x;
        this.y = y;
        this.orientation = orietation;
    }
}

//this will 100% need to be updated in the future
//this is just the "working" version
export default class GameBoard{
    private readonly board: BoardTileTypes[][] = [];
    private unSunkShipTiles: number = 0;
    get allShipsSunk(): boolean{
        return this.unSunkShipTiles == 0;
    }

    constructor(ships: GameShip[]){
        if(ships.length != 4) throw new Error("Board must contain exactly 4 ships");

        for(let i = 0; i < 8; i++){
            this.board[i] = [];
            for(let j = 0; j < 8; j++){
                this.board[i][j] = BoardTileTypes.Empty;
            }
        }

        for(const ship of ships){
            this.placeShip(ship)
        }
    }

    //places a ship starting at x,y going 4 tiles either down or right
    private placeShip(ship: GameShip){
        const x = ship.x;
        const y = ship.y;
        switch(ship.orientation){
            case ShipOrientation.Down:
                if (y < 0 || y > 4) throw new Error("Invalid Ship Coordinates");
                if (x < 0 || x > 7) throw new Error("Invalid Ship Coordinates");
                for(let i = 0; i < 4; i++){
                    if(this.board[x][y+i] == BoardTileTypes.Ship) throw new Error("Overlapping Ship Arangemet");
                    this.board[x][y+i] = BoardTileTypes.Ship;
                }
                break;

            case ShipOrientation.Right:
                if (x < 0 || x > 4) throw new Error("Invalid Ship Coordinates");
                if (y < 0 || y > 7) throw new Error("Invalid Ship Coordinates");
                for(let i = 0; i < 4; i++){
                    if(this.board[x+i][y] == BoardTileTypes.Ship) throw new Error("Overlapping Ship Arangemet");
                    this.board[x+i][y] = BoardTileTypes.Ship;
                }
                break;
        }

        this.unSunkShipTiles += 4;
    }

    getTile(x: number, y: number): BoardTileTypes{
        if(x < 0 || x > 7) throw new Error("Invalid Coordinates");
        if(y < 0 || y > 7) throw new Error("Invalid Coordinates");

        return this.board[x][y];
    }

    shoot(x: number, y:number){
        if(x < 0 || x > 7) throw new Error("Invalid Coordinates");
        if(y < 0 || y > 7) throw new Error("Invalid Coordinates");
        const target = this.getTile(x,y);
        if(target == BoardTileTypes.Miss || target == BoardTileTypes.Hit) throw new Error("Attempting to shoot at duplicate location");

        const result = target == BoardTileTypes.Ship? BoardTileTypes.Hit : BoardTileTypes.Miss;
        this.board[x][y] = result;

        if(result == BoardTileTypes.Hit) this.unSunkShipTiles--;
        return result;
    }
}

