import Coordinate from "../Coordinate.js";

export default class ShipTile {
    health: number;
    relativeCoordinates: Coordinate;
    absoluteCoordinates: Coordinate | null = null;

    constructor(relativeCoordinates: Coordinate, health: number = 1){
        this.relativeCoordinates = relativeCoordinates;
        this.health = health;
    }

    setAbsoluteCoordinates(coordinate: Coordinate){
        this.absoluteCoordinates = coordinate;
    }
}