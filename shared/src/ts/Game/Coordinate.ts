import { Orientation } from "./Orientation.js";

export default interface Coordinate {
    x: number;
    y: number;
}

export class CoordinateFactory {
    static createCoordinate(x: number, y: number): Coordinate {
        return {
            x: x,
            y: y
        };
    }

    static copyCoordinate(coordinate: Coordinate): Coordinate {
        return this.createCoordinate(coordinate.x, coordinate.y);
    }
}

/**
 * 
 * @param relativeCoordinate relative coordinates
 * @param centerAbsoluteCoordinate the absolute coordinates of relative coordinate (0,0) 
 * @param orientation the orientation
 */
export function relativeCoordinateToAbsoluteCoordinate(relativeCoordinate: Coordinate, centerAbsoluteCoordinate: Coordinate, orientation: Orientation = Orientation.Right): Coordinate {
    // translate relative coordinates into absolute coordinates by translating the right and down directions into absolute directions
    // absolute coordinates use y down and x right (same as Orientation.Right);
    let rightDirection: Coordinate;
    let downDirection: Coordinate;
    switch (orientation) {
        case Orientation.Right:
            rightDirection = CoordinateFactory.createCoordinate(1, 0);
            downDirection = CoordinateFactory.createCoordinate(0, 1);
            break
        case Orientation.Down:
            rightDirection = CoordinateFactory.createCoordinate(0, 1);
            downDirection = CoordinateFactory.createCoordinate(-1, 0);
            break
        case Orientation.Left:
            rightDirection = CoordinateFactory.createCoordinate(-1, 0);
            downDirection = CoordinateFactory.createCoordinate(0, -1);
            break
        case Orientation.Up:
            rightDirection = CoordinateFactory.createCoordinate(0, -1);
            downDirection = CoordinateFactory.createCoordinate(1, 0);
            break
    }

    const absoluteX = centerAbsoluteCoordinate.x + (rightDirection.x * relativeCoordinate.x) + (downDirection.x * relativeCoordinate.y);
    const absoluteY = centerAbsoluteCoordinate.y + (rightDirection.y * relativeCoordinate.x) + (downDirection.y * relativeCoordinate.y);

    return CoordinateFactory.createCoordinate(absoluteX, absoluteY);
}