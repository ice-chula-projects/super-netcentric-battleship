import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";
import AttackTile from "./AttackTile.js";
import ShipTile from "./ShipTile.js";
import { ShipDefinition, ShipType } from "@super-netcentric-battleship/shared/Game/ShipDefinitions.js";

export default class Ship{

    type: ShipType;

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

    constructor(shipDefinition: ShipDefinition){
        this.type = shipDefinition.type;
        const shipTiles = [];

        for(const shipHullTile of shipDefinition.hull){
            shipTiles.push(new ShipTile(shipHullTile.relativeCoordinate, shipHullTile.maxHealth));
        }

        this.shipTiles = shipTiles;
        for(const shipTile of shipTiles){
            shipTile.setShip(this);
            this.health += shipTile.maxHealth;
        }

        const firingPattern = [];
        for(const firingPatternTile of shipDefinition.firingPattern){
            firingPattern.push(new AttackTile(firingPatternTile.relativeCoordinate, firingPatternTile.damage));
        }

        this.firingPattern = firingPattern;
    }

    notifyHit(shipTile: ShipTile, damage: number){
        if(shipTile.ship != this) throw new Error("tried to notify hit for a tile of a different ship");
        this.health -= Math.min(damage, shipTile.health);
        shipTile.notifyHit(damage);
    }
}