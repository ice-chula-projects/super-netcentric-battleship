import AttackTile from "../Ship/AttackTile.js";
import Ship from "../Ship/Ship.js";
import BoardTile from "./BoardTile.js";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";
import Coordinate, { CoordinateFactory } from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import Game from "../Game.js";
import { Player } from "@super-netcentric-battleship/shared/Game/Player.js";
import { BoardTileState } from "@super-netcentric-battleship/shared/Game/BoardTileState.js";
import ShipTile from "../Ship/ShipTile.js";

//returned to the engine to be passed to the client to update their visuals
export class UpdatedBoardTile {
    readonly coordinates: Coordinate
    readonly state: BoardTileState
    readonly health: number | null = null;
    readonly maxHealth: number | null = null;
    readonly shipId: number | null = null;

    static fromBoardTile(coordinate: Coordinate, boardTile: BoardTile){
        let state: BoardTileState;
        let health: number | null = null;
        let maxHealth: number | null = null;
        let shipId: number | null = null;
        const shipTile = boardTile.shipTile;

        if(shipTile == null) state = BoardTileState.Empty;
        else{
            if(shipTile.health >= shipTile.maxHealth) state = BoardTileState.Ship;
            else if (shipTile.alive) state = BoardTileState.DamagedShip;
            else state = BoardTileState.DestroyedShip

            health = shipTile.health;
            maxHealth = shipTile.maxHealth;
            shipId = shipTile.ship.id;
        } 

        return new UpdatedBoardTile(coordinate, state, health, maxHealth, shipId);
    }

    constructor(coordinate: Coordinate, state: BoardTileState, health: number | null = null, maxHealth: number | null = null, shipId: number | null = null){
        this.coordinates = coordinate;
        this.state = state;
        this.health = health;
        this.maxHealth = maxHealth;
        this.shipId = shipId;
    }
}

export default class Board{
    readonly size: number;
    readonly board: BoardTile[][];
    readonly ships: Ship[] = [];
    readonly game: Game;
    readonly player: Player;

    get alive(): boolean{
        return this.ships.some((ship) => ship.alive);
    }

    constructor(game: Game, player: Player, size: number){
        this.game = game;
        this.player = player;
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

    placeShip(ship: Ship, coordinates: Coordinate): UpdatedBoardTile[]{
        //check for collisions
        for(const shipTile of ship.shipTiles){
            const absoluteCoordinate = this.relativeCoordinateToAbsoluteCoordinate(shipTile.relativeCoordinates, coordinates, ship.orientation);
            if(absoluteCoordinate.x < 0 || absoluteCoordinate.x > this.size || absoluteCoordinate.y < 0 || absoluteCoordinate.y > this.size) throw new TileOutOfBoundsError("Ship tile is out of bounds");
            if(this.board[absoluteCoordinate.x][absoluteCoordinate.y].hasShip) throw new DuplicateShipTileLocationError("Tried to place ship on duplicate location");
        }

        ship.setId(this.ships.length);
        this.ships.push(ship);

        const updatedBoardTiles: UpdatedBoardTile[] = [];
        for(const shipTile of ship.shipTiles){
            const absoluteCoordinate = this.relativeCoordinateToAbsoluteCoordinate(shipTile.relativeCoordinates, coordinates, ship.orientation);
            shipTile.setAbsoluteCoordinates(absoluteCoordinate);
            this.board[absoluteCoordinate.x][absoluteCoordinate.y].shipTile = shipTile;

            updatedBoardTiles.push(UpdatedBoardTile.fromBoardTile(absoluteCoordinate, this.board[absoluteCoordinate.x][absoluteCoordinate.y]));
        }

        return updatedBoardTiles;
    }

    fire(attackTiles: AttackTile[], coordinate: Coordinate, orientation: Orientation): UpdatedBoardTile[]{
        const updatedBoardTiles: UpdatedBoardTile[] = [];
        for(const attackTile of attackTiles){
            const absoluteCoordinate = this.relativeCoordinateToAbsoluteCoordinate(attackTile.relativeCoordinates, coordinate, orientation);
            if(absoluteCoordinate.x < 0 || absoluteCoordinate.x > this.size || absoluteCoordinate.y < 0 || absoluteCoordinate.y > this.size) continue;
            const tile = this.board[absoluteCoordinate.x][absoluteCoordinate.y];
            const shipTile = tile.shipTile;

            //reveal the tile
            updatedBoardTiles.push(this.getTileState(absoluteCoordinate));
            //if the tile has a ship
            if(shipTile != null) {
                //if this ship is already dead dont do anything
                if(!shipTile.ship?.alive) continue;
                shipTile.notifyHit(attackTile.damage);
                
                //if the ship died from the hit update all tiles in the ship
                if(shipTile.ship != null && !shipTile.ship.alive){
                    for(const tile of shipTile.ship.shipTiles){
                        if(tile == shipTile) continue;
                        if(tile.absoluteCoordinates != null) updatedBoardTiles.push(this.getTileState(tile.absoluteCoordinates));
                    }
                }
            }
        }

        return updatedBoardTiles;
    }

    getTileState(coordinate: Coordinate): UpdatedBoardTile{
        const tile = this.board[coordinate.x][coordinate.y];
        return UpdatedBoardTile.fromBoardTile(coordinate, tile);
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
                rightDirection = CoordinateFactory.createCoordinate(1,0);
                downDirection = CoordinateFactory.createCoordinate(0,1);
            break
            case Orientation.Down:
                rightDirection = CoordinateFactory.createCoordinate(0,1);
                downDirection = CoordinateFactory.createCoordinate(-1,0);
            break
            case Orientation.Left:
                rightDirection = CoordinateFactory.createCoordinate(-1,0);
                downDirection = CoordinateFactory.createCoordinate(0,-1);
            break
            case Orientation.Up:
                rightDirection = CoordinateFactory.createCoordinate(0,-1);
                downDirection = CoordinateFactory.createCoordinate(1,0);
            break
        }

        const absoluteX = centerAbsoluteCoordinate.x + (rightDirection.x * relativeCoordinate.x) + (downDirection.x * relativeCoordinate.y);
        const absoluteY = centerAbsoluteCoordinate.y + (rightDirection.y * relativeCoordinate.x) + (downDirection.y * relativeCoordinate.y);

        return CoordinateFactory.createCoordinate(absoluteX, absoluteY);
    }
}

export class DuplicateShipTileLocationError extends Error{}
export class TileOutOfBoundsError extends Error{}