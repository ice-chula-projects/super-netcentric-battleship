import ShipTile from "./ShipTile.js";

export enum ShipOrientation{
    Right = "Right",
    Down = "Down",
    Left = "Left",
    Up = "Up"
}

export default class Ship{
    shipTiles: ShipTile[];
    orientation: ShipOrientation = ShipOrientation.Right;
    constructor(shipTiles: ShipTile[]){
        this.shipTiles = shipTiles;
    }

    setOrientation(orientation: ShipOrientation): void{
        this.orientation = orientation;
    }
}