import Coordinate, { CoordinateFactory } from "./Coordinate.js"

export interface ShipDefinition {
    type: ShipType,
    value: number,
    hull: ShipHullTile[],
    firingPattern: ShipFiringPatternTile[]
}

type ShipHullTile = {
    relativeCoordinate: Coordinate,
    maxHealth: number
}

type ShipFiringPatternTile = {
    relativeCoordinate: Coordinate,
    damage: number
}

class ShipDefinitionFactory {
    /**
     * 
     * @param type type of the ship
     * @param value value of the ship in points
     * @param hull array of ship hull tiles representing the ship's layout
     * @param firingPattern array of ship firing patten tiles representing the ship's firing pattern, if no value is given defaults to the same pattern and damage as the ship's hull
     * @returns 
     */
    static createShipDefinition(type: ShipType, value: number, hull: ShipHullTile[], firingPattern?: ShipFiringPatternTile[]): ShipDefinition {
        if (firingPattern == null) {
            firingPattern = [];
            for (const hullTile of hull) {
                firingPattern.push(ShipDefinitionFactory.createShipFiringPatternTile(hullTile.relativeCoordinate.x, hullTile.relativeCoordinate.y, hullTile.maxHealth));
            }
        }

        return {
            type: type,
            value: value,
            hull: hull,
            firingPattern: firingPattern
        }
    }

    static createShipHullTile(x: number, y: number, maxHealth: number = 1): ShipHullTile {
        return {
            relativeCoordinate: CoordinateFactory.createCoordinate(x, y),
            maxHealth: maxHealth
        }
    }


    static createShipFiringPatternTile(x: number, y: number, damage: number = 1): ShipFiringPatternTile {
        return {
            relativeCoordinate: CoordinateFactory.createCoordinate(x, y),
            damage: damage
        }
    }
}

//define new ship types here
export enum ShipType {
    Standard,
    Star,
    BlueRicky,
    OrangeRicky,
    CleavelandZ,
    RhodeIslandZ,
    Smashboy,
    Teewee,
    SmolHero,
    Dot,
    Auto,
    Warm,
    Pro,
    Non,
    Pong,
    Azmi,
}

const ShipDefinitions: Record<ShipType, ShipDefinition> = {

    //Standard ship (4 long, 1 tile attack)
    [ShipType.Standard]: ShipDefinitionFactory.createShipDefinition(
        //type (should be same as key)
        ShipType.Standard,
        
        //value in points
        1,

        //define hull as a series of coordinates (x,y) and health
        //here is defined as a series of tiles at coordinates (0,0) through (3,0) each with 1 health
        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(2, 0, 1),
        ShipDefinitionFactory.createShipHullTile(3, 0, 1)],

        //define firing pattern (defaults to same as hull if no pattern is given)
        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

    // Example ship definition, "Star", a ship with a + shaped hull, valued at 5 points, each tile has 1 health except for the center tile which has 3
    // Since no firing pattern is defined the ship will have the same firing pattern as it's hull (a + shape with 3 damage in the center and 1 everywhere else)
        [ShipType.Star]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Star,

        5,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 3),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, -1, 1)
        ]
    ),

        [ShipType.BlueRicky]: ShipDefinitionFactory.createShipDefinition(
        ShipType.BlueRicky,
        
        4,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-2, 0, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.OrangeRicky]: ShipDefinitionFactory.createShipDefinition(
        ShipType.OrangeRicky,
        
        4,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(2, 0, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.CleavelandZ]: ShipDefinitionFactory.createShipDefinition(
        ShipType.CleavelandZ,
        
        4,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 1, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.RhodeIslandZ]: ShipDefinitionFactory.createShipDefinition(
        ShipType.RhodeIslandZ,
        
        4,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(1, 1, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.Smashboy]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Smashboy,
        
        4,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, -1, 1),
        ShipDefinitionFactory.createShipHullTile(0, -1, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.Teewee]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Teewee,
        
        4,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.SmolHero]: ShipDefinitionFactory.createShipDefinition(
        ShipType.SmolHero,
        
        3,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 3),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.Auto]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Auto,
        
        5,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 1, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.Warm]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Warm,
        
        5,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, -1, 1),
        ShipDefinitionFactory.createShipHullTile(2, 2, 1),
        ShipDefinitionFactory.createShipHullTile(-2, -2, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.Pro]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Pro,
        
        5,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 1, 1),
        ShipDefinitionFactory.createShipHullTile(2, 2, 1),
        ShipDefinitionFactory.createShipHullTile(-2, 2, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.Non]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Non,
        
        5,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 1, 1),
        ShipDefinitionFactory.createShipHullTile(2, 2, 1),
        ShipDefinitionFactory.createShipHullTile(-2, -2, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.Pong]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Pong,
        
        5,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 1, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.Azmi]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Azmi,
        
        5,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, -1, 1),
        ShipDefinitionFactory.createShipHullTile(1, -1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 1, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.Dot]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Dot,
        
        20,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 10)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 10),
        ShipDefinitionFactory.createShipFiringPatternTile(1, 0, 10),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, 0, 10),
        ShipDefinitionFactory.createShipFiringPatternTile(0, 1, 10),
        ShipDefinitionFactory.createShipFiringPatternTile(0, -1, 10),
        ShipDefinitionFactory.createShipFiringPatternTile(1, 1, 10),
        ShipDefinitionFactory.createShipFiringPatternTile(1, -1, 10),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, 1, 10),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, -1, 10)
        ]
    ),
}

export default ShipDefinitions;