export default interface Coordinate{
    x: number;
    y: number;
}

export class CoordinateFactory{
    static createCoordinate(x: number, y:number) : Coordinate{
        return {
            x: x,
            y: y
        };
    }
}