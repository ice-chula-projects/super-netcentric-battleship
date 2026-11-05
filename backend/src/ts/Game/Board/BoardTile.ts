import ShipTile from "../Ship/ShipTile.js";

export default class BoardTile{
    shipTile: ShipTile | null = null;

    get hasShip(): boolean {
        return this.shipTile != null;
    }
}