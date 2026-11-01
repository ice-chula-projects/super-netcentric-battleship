import Coordinate from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import AttackTile from "../Ship/AttackTile.js";
import Ship from "../Ship/Ship.js";
import BoardTile from "./BoardTile.js";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";

export default class Board{
    readonly size: number;
    readonly board: BoardTile[][];
    readonly ships: Ship[] = [];

    constructor(size: number){
        this.size = size;

        this.board = [];
        for(let i = 0; i < size; i++){
            const row = [];
            for(let j = 0; j < size; j++){
                row[j] = new BoardTile();
            }
            this.board[i] = row;
        }
    }

    placeShip(ship: Ship, coordinates: Coordinate): void{
        //check for collisions
        for(const shipTile of ship.shipTiles){
            const absoluteCoordinate = this.relativeCoordinateToAbsoluteCoordinate(shipTile.relativeCoordinates, coordinates, ship.orientation);
            if(absoluteCoordinate.x < 0 || absoluteCoordinate.x > this.size || absoluteCoordinate.y < 0 || absoluteCoordinate.y > this.size) throw new TileOutOfBoundsError("Ship tile is out of bounds");
            if(this.board[absoluteCoordinate.x][absoluteCoordinate.y].hasShip) throw new DuplicateShipTileLocationError("Tried to place ship on duplicate location");
        }

        for(const shipTile of ship.shipTiles){
            const absoluteCoordinate = this.relativeCoordinateToAbsoluteCoordinate(shipTile.relativeCoordinates, coordinates, ship.orientation);
            shipTile.setAbsoluteCoordinates(absoluteCoordinate);
            this.board[absoluteCoordinate.x][absoluteCoordinate.y].shipTile = shipTile;
        }

        this.ships.push(ship);
    }

    fire(attackTiles: AttackTile[], coordinate: Coordinate, orientation: Orientation): void{
        for(const attackTile of attackTiles){
            const absoluteCoordinate = this.relativeCoordinateToAbsoluteCoordinate(attackTile.relativeCoordinates, coordinate, orientation);
            if(absoluteCoordinate.x < 0 || absoluteCoordinate.x > this.size || absoluteCoordinate.y < 0 || absoluteCoordinate.y > this.size) continue
            const tile = this.board[absoluteCoordinate.x][absoluteCoordinate.y];
            if(tile.shipTile != null) {
                tile.shipTile.notifyHit(attackTile.damage);

                if(tile.shipTile.ship?.alive){
                    //ship sunk logic
                }
            };
        }
    }

    /**
     * 
     * @param relativeCoordinate relative coordinates
     * @param centerAbsoluteCoordinate the absolute coordinates of relative coordinate (0,0) 
     * @param orientation the orientation
     */
    relativeCoordinateToAbsoluteCoordinate(relativeCoordinate: Coordinate, centerAbsoluteCoordinate: Coordinate, orientation: Orientation = Orientation.Right): Coordinate{
        // translate ship coordinates into absolute coordinates by translating the ship's right and down directions into absolute directions
        // absolute coordinates use y down and x right
        let rightDirection: Coordinate;
        let downDirection: Coordinate;
        switch(orientation){
            case Orientation.Right:
                rightDirection = new Coordinate(1,0);
                downDirection = new Coordinate(0,1);
            break
            case Orientation.Down:
                rightDirection = new Coordinate(0,1);
                downDirection = new Coordinate(-1,0);
            break
            case Orientation.Left:
                rightDirection = new Coordinate(-1,0);
                downDirection = new Coordinate(0,-1);
            break
            case Orientation.Up:
                rightDirection = new Coordinate(0,-1);
                downDirection = new Coordinate(1,0);
            break
        }

        const absoluteX = centerAbsoluteCoordinate.x + (rightDirection.x * relativeCoordinate.x) + (downDirection.x * relativeCoordinate.y);
        const absoluteY = centerAbsoluteCoordinate.y + (rightDirection.y * relativeCoordinate.x) + (downDirection.y * relativeCoordinate.y);

        return new Coordinate(absoluteX, absoluteY);
    }
}

export class DuplicateShipTileLocationError extends Error{}
export class TileOutOfBoundsError extends Error{}