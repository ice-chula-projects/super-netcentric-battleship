import AttackTile from "../Ship/AttackTile.js";
import Ship from "../Ship/Ship.js";
import BoardTile from "./BoardTile.js";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";
import Coordinate, { CoordinateFactory, relativeCoordinateToAbsoluteCoordinate } from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import Game from "../Game.js";
import { Player } from "@super-netcentric-battleship/shared/Game/Player.js";
import { BoardTileState } from "@super-netcentric-battleship/shared/Game/BoardTileState.js";
import ShipTile from "../Ship/ShipTile.js";

//returned to the engine to be passed to the client to update their visuals
export class BoardTileUpdate {
    readonly coordinates: Coordinate
    readonly state: BoardTileState
    readonly health: number | null = null;
    readonly maxHealth: number | null = null;
    readonly shipId: number | null = null;
    readonly shipType: number | null = null

    static fromBoardTile(coordinate: Coordinate, boardTile: BoardTile){
        let state: BoardTileState;
        let health: number | null = null;
        let maxHealth: number | null = null;
        let shipId: number | null = null;
        let shipType: number | null = null;
        const shipTile = boardTile.shipTile;

        if(shipTile == null) state = BoardTileState.Empty;
        else{
            if(shipTile.health >= shipTile.maxHealth) state = BoardTileState.Ship;
            else if (shipTile.alive) state = BoardTileState.DamagedTile;
            else if (shipTile.ship.alive) state = BoardTileState.DestoyedTile;
            else state = BoardTileState.DestroyedShip;

            health = shipTile.health;
            maxHealth = shipTile.maxHealth;
            shipId = shipTile.ship.id;
            shipType = shipTile.ship.type;
        } 

        return new BoardTileUpdate(coordinate, state, health, maxHealth, shipId, shipType);
    }

    constructor(coordinate: Coordinate, state: BoardTileState, health: number | null = null, maxHealth: number | null = null, shipId: number | null = null, shipType: number | null = null){
        this.coordinates = coordinate;
        this.state = state;
        this.health = health;
        this.maxHealth = maxHealth;
        this.shipId = shipId;
        this.shipType = shipType;
    }
}

export default class Board{
    readonly size: number;
    readonly board: BoardTile[][];
    readonly ships: Ship[] = [];

    get alive(): boolean{
        return this.ships.some((ship) => ship.alive);
    }

    get totalFleetValue(): number{
        return this.ships.map(x => x.value).reduce((a,b) => a + b);
    }

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

    getShipById(id: number): Ship{
        if (id < 0 || id >= this.ships.length) throw new Error("Ship Id does not exist");
        return this.ships[id];
    }

    placeShip(ship: Ship, coordinates: Coordinate): BoardTileUpdate[]{
        //check for collisions
        for(const shipTile of ship.shipTiles){
            const absoluteCoordinate = relativeCoordinateToAbsoluteCoordinate(shipTile.relativeCoordinates, coordinates, ship.orientation);
            if(absoluteCoordinate.x < 0 || absoluteCoordinate.x >= this.size || absoluteCoordinate.y < 0 || absoluteCoordinate.y >= this.size) throw new TileOutOfBoundsError("Ship tile is out of bounds");
            if(this.board[absoluteCoordinate.x][absoluteCoordinate.y].hasShip) throw new DuplicateShipTileLocationError("Tried to place ship on duplicate location");
        }

        ship.setId(this.ships.length);
        this.ships.push(ship);

        const updatedBoardTiles: BoardTileUpdate[] = [];
        for(const shipTile of ship.shipTiles){
            const absoluteCoordinate = relativeCoordinateToAbsoluteCoordinate(shipTile.relativeCoordinates, coordinates, ship.orientation);
            shipTile.setAbsoluteCoordinates(absoluteCoordinate);
            this.board[absoluteCoordinate.x][absoluteCoordinate.y].shipTile = shipTile;

            updatedBoardTiles.push(BoardTileUpdate.fromBoardTile(absoluteCoordinate, this.board[absoluteCoordinate.x][absoluteCoordinate.y]));
        }

        return updatedBoardTiles;
    }

    fire(attackTiles: AttackTile[], coordinate: Coordinate, orientation: Orientation): BoardTileUpdate[]{
        const updatedBoardTiles: BoardTileUpdate[] = [];
        for(const attackTile of attackTiles){
            const absoluteCoordinate = relativeCoordinateToAbsoluteCoordinate(attackTile.relativeCoordinates, coordinate, orientation);
            if(absoluteCoordinate.x < 0 || absoluteCoordinate.x >= this.size || absoluteCoordinate.y < 0 || absoluteCoordinate.y >= this.size) continue;
            const tile = this.board[absoluteCoordinate.x][absoluteCoordinate.y];
            const shipTile = tile.shipTile;

            //if the tile has a ship
            if(shipTile != null) {
                //if this ship is already dead dont do anything
                if(!shipTile.ship?.alive) continue;
                shipTile.ship.notifyHit(shipTile, attackTile.damage);
                
                //if the ship died from the hit update all tiles in the ship
                if(shipTile.ship != null && !shipTile.ship.alive){
                    for(const tile of shipTile.ship.shipTiles){
                        if(tile.absoluteCoordinates != null) updatedBoardTiles.push(this.getTileState(tile.absoluteCoordinates));
                    }
                } else {
                    //otw just reveal the tile
                    updatedBoardTiles.push(this.getTileState(absoluteCoordinate));
                }
            } else{
                updatedBoardTiles.push(this.getTileState(absoluteCoordinate));
            }
        }

        return updatedBoardTiles;
    }

    getTileState(coordinate: Coordinate): BoardTileUpdate{
        const tile = this.board[coordinate.x][coordinate.y];
        return BoardTileUpdate.fromBoardTile(coordinate, tile);
    }

}

export class DuplicateShipTileLocationError extends Error{}
export class TileOutOfBoundsError extends Error{}