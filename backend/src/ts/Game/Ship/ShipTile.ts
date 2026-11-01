import Coordinate from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import Ship from "./Ship.js";

export default class ShipTile {
    readonly maxHealth: number;
    health: number;
    
    readonly relativeCoordinates: Coordinate;
    absoluteCoordinates: Coordinate | null = null;
    
    ship: Ship | null = null

    get alive(): boolean{
        return this.health > 0;
    }

    constructor(relativeCoordinates: Coordinate, maxHealth: number = 1){
        this.relativeCoordinates = relativeCoordinates;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
    }

    setAbsoluteCoordinates(coordinate: Coordinate){
        this.absoluteCoordinates = coordinate;
    }

    setShip(ship:Ship){
        this.ship = ship;
    }

    notifyHit(damage: number){
        this.health -= damage;
    }
}