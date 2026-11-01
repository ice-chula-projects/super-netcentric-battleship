import Coordinate from "@super-netcentric-battleship/shared/Game/Coordinate.js";

export default class AttackTile{
    readonly damage: number;
    readonly relativeCoordinates: Coordinate;

    constructor(relativeCoordinates: Coordinate, damage: number = 1){
        this.relativeCoordinates = relativeCoordinates;
        this.damage = damage;
    }
}