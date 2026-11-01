import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";
import AttackTile from "./AttackTile.js";
import ShipTile from "./ShipTile.js";

export default class Ship{
    //hull
    shipTiles: ShipTile[];
    //firing pattern
    firingPattern: AttackTile[];

    //total hp
    health: number = 0;

    get alive(): boolean{
        return this.health > 0;
    }

    orientation: Orientation = Orientation.Right;


    setOrientation(orientation: Orientation): void{
        this.orientation = orientation;
    }

    constructor(shipTiles: ShipTile[], firingPattern: AttackTile[]){
        this.shipTiles = shipTiles;
        for(const shipTile of shipTiles){
            shipTile.setShip(this);
            this.health += shipTile.maxHealth;
        }

        this.firingPattern = firingPattern;
    }

    notifyHit(shipTile: ShipTile, damage: number){
        if(shipTile.ship != this) throw new Error("tried to notify hit for a tile of a different ship");
        this.health -= Math.min(damage, shipTile.health);
        shipTile.notifyHit(damage);
    }
}