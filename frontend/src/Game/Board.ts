import { BoardTileState } from '@super-netcentric-battleship/shared/Game/BoardTileState.js';
import Coordinate, {
    relativeCoordinateToAbsoluteCoordinate,
} from '@super-netcentric-battleship/shared/Game/Coordinate.js';
import { Orientation } from '@super-netcentric-battleship/shared/Game/Orientation.js';
import {
    ShipDefinition,
    ShipType,
} from '@super-netcentric-battleship/shared/Game/ShipDefinitions.js';
import { BoardTileStatus } from '@super-netcentric-battleship/shared/ServerMessage.js';

export interface BoardTile {
    state: BoardTileState;
    health: number | null;
    maxHealth: number | null;
    shipId: number | null;
    shipType: ShipType | null;
}

//holds the state of the board
export default class GameBoard {
    readonly board: BoardTile[][] = [];
    readonly size: number;

    constructor(size: number) {
        this.size = size;
        for (let i = 0; i < this.size; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.board[i][j] = {
                    state: BoardTileState.Hidden,
                    health: null,
                    maxHealth: null,
                    shipId: null,
                    shipType: null,
                };
            }
        }
    }

    getTile(x: number, y: number) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size)
            throw new Error('Tile out of bounds');

        return this.board[x][y];
    }

    updateTileState(state: BoardTileStatus) {
        this.board[state.coordinate.x][state.coordinate.y] = {
            state: state.state,
            health: state.health,
            maxHealth: state.maxHealth,
            shipId: state.shipId,
            shipType: state.shipType,
        };
    }

    //purely visual, will get overwritten when server sends in the update
    addShip(ship: ShipDefinition, location: Coordinate, orientation: Orientation) {
        for (const shipHull of ship.hull) {
            const absoluteCoordinate = relativeCoordinateToAbsoluteCoordinate(
                shipHull.relativeCoordinate,
                location,
                orientation,
            );
            const tile = this.getTile(absoluteCoordinate.x, absoluteCoordinate.y);
            if (tile.state != BoardTileState.Hidden) throw new Error('Added Ship is overlaping');
        }

        for (const shipHull of ship.hull) {
            const absoluteCoordinate = relativeCoordinateToAbsoluteCoordinate(
                shipHull.relativeCoordinate,
                location,
                orientation,
            );
            const tile = this.getTile(absoluteCoordinate.x, absoluteCoordinate.y);
            tile.maxHealth = shipHull.maxHealth;
            tile.health = shipHull.maxHealth;
            tile.state = BoardTileState.Ship;
        }
    }
}
