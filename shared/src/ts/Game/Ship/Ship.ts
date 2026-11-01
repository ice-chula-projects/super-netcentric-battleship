import { Orientation } from "../Orientation.js";
import ShipTile from "./ShipTile.js";

export default class Ship{
    shipTiles: ShipTile[];
    orientation: Orientation = Orientation.Right;
    constructor(shipTiles: ShipTile[]){
        this.shipTiles = shipTiles;
    }

    setOrientation(orientation: Orientation): void{
        this.orientation = orientation;
    }
}