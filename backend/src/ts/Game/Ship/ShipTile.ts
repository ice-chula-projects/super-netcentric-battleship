import Coordinate from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import Ship from "./Ship.js";

export default class ShipTile {
    readonly maxHealth: number;
    health: number;
    
    readonly relativeCoordinates: Coordinate;
    absoluteCoordinates: Coordinate | null = null;
    
    ship: Ship

    get alive(): boolean{
        return this.health > 0;
    }

    constructor(ship: Ship, relativeCoordinates: Coordinate, maxHealth: number = 1){
        this.ship = ship;
        this.relativeCoordinates = relativeCoordinates;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
    }

    setAbsoluteCoordinates(coordinate: Coordinate){
        this.absoluteCoordinates = coordinate;
    }

    notifyHit(damage: number){
        this.health -= damage;
        if(this.health < 0) this.health = 0;
    }
}