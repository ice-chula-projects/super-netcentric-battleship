import Coordinate, { CoordinateFactory } from "./Coordinate.js"

export interface ShipDefinition {
    type: ShipType,
    value: number,
    hull: ShipHullTile[],
    firingPattern: ShipFiringPatternTile[],
    name: string,
    description: string
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
     * @param name name of the ship, used in the frontend
     * @param description description of the ship, used in the frontend
     * @param value value of the ship in points
     * @param hull array of ship hull tiles representing the ship's layout
     * @param firingPattern array of ship firing patten tiles representing the ship's firing pattern, if no value is given defaults to the same pattern and damage as the ship's hull
     * @returns 
     */
    static createShipDefinition(type: ShipType, name: string, description: string, value: number, hull: ShipHullTile[], firingPattern?: ShipFiringPatternTile[]): ShipDefinition {
        if (firingPattern == null) {
            firingPattern = [];
            for (const hullTile of hull) {
                firingPattern.push(ShipDefinitionFactory.createShipFiringPatternTile(hullTile.relativeCoordinate.x, hullTile.relativeCoordinate.y, hullTile.maxHealth));
            }
        }

        return {
            type: type,
            name: name,
            description: description,
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
    Defender,
    Scout,
    Infantry,
    Sniper,
    Warrior,
    King,
    Queen,
    Rook,
    Bishop,
    Knight,
    Pawn,
    Wingman,
    Dragon,
    Voltz,
    Ghost,
    Shark,
    Archer,
    Sword,
    Mace,
    Spear

}

const ShipDefinitions: Record<ShipType, ShipDefinition> = {

    //Standard ship (4 long, 1 tile attack)
    [ShipType.Standard]: ShipDefinitionFactory.createShipDefinition(
        //type (should be same as key)
        ShipType.Standard,
        //name of the ship, used in the frontend
        "Standard",
        //description of the ship, used in the frontend
        "Standard ship, 4 long with 1 tile attack",
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
        "Star",
        "Star ship, center has 3 health",
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
        "BlueRicky",
        "4-Block ⅃",
        
        4,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-2, 0, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.OrangeRicky]: ShipDefinitionFactory.createShipDefinition(
        ShipType.OrangeRicky,
        "OrangeRicky",
        "4-Block L",
        
        4,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(2, 0, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.CleavelandZ]: ShipDefinitionFactory.createShipDefinition(
        ShipType.CleavelandZ,
        "CleavelandZ",
        "4-Block Z",
        
        4,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 1, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.RhodeIslandZ]: ShipDefinitionFactory.createShipDefinition(
        ShipType.RhodeIslandZ,
        "RhodeIslandZ",
        "Reverse 4-Block Z",
        
        4,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(1, 1, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.Smashboy]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Smashboy,
        "Smashboy",
        "4-Block Cube",
        
        4,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, -1, 1),
        ShipDefinitionFactory.createShipHullTile(0, -1, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.Teewee]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Teewee,
        "Teewee",
        "4-Block Cube Pyramid",
        
        4,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.SmolHero]: ShipDefinitionFactory.createShipDefinition(
        ShipType.SmolHero,
        "SmolHero",
        "3-Block Line",
        
        3,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 3),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.Auto]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Auto,
        "Auto",
        "5-Block Line",
        
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
        "Warm",
        "5-Block Open Pyramid",
        
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
        "Pro",
        "5-Block Abstract X",
        
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
        "Non",
        "5-Block Propellar",
        
        5,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, -1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 1, 1)],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)]
    ),

        [ShipType.Pong]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Pong,
        "Pong",
        "5-Block Table",
        
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
        "Azmi",
        "5-Block X",
        
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
        "Dot",
        "Abandon all hope all ye who enters",
        
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

    [ShipType.Defender]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Defender,
        "Defender",
        "T-shaped",
        
        5,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(0, 1, 2),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 0),
        ShipDefinitionFactory.createShipFiringPatternTile(1, 0, 0),
        ShipDefinitionFactory.createShipFiringPatternTile(1, 1, 0),
        ShipDefinitionFactory.createShipFiringPatternTile(0, 1, 0)
        ]
    ),

    [ShipType.Scout]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Scout,
        "Scout",
        "Low damage, Big AOE",
        
        7,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(1, 0, 0),
        ShipDefinitionFactory.createShipFiringPatternTile(1, 1, 0),
        ShipDefinitionFactory.createShipFiringPatternTile(0, 1, 0),
        ShipDefinitionFactory.createShipFiringPatternTile(0, -1, 0),
        ShipDefinitionFactory.createShipFiringPatternTile(1, -1, 0),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, 0, 0),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, 1, 0),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, -1, 0)
        ]
    ),

    [ShipType.Infantry]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Infantry,
        "Infantry",
        "Cheap",
        
        2,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1)
        ]
    ),

    [ShipType.Sniper]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Sniper,
        "Sniper",
        "High damage, Fragile",
        
        6,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, -1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 1, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 3),
        ShipDefinitionFactory.createShipFiringPatternTile(1, -1, 3),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, 1, 3)
        ]
    
    ),

    [ShipType.Warrior]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Warrior,
        "Warrior",
        "High damage, Mid HP",
        
        6,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(1, 1, 2)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 2),
        ShipDefinitionFactory.createShipFiringPatternTile(0, -1, 2),
        ShipDefinitionFactory.createShipFiringPatternTile(0, 1, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(1, 0, 0),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, 0, 0)
        ]

    ),

    [ShipType.King]: ShipDefinitionFactory.createShipDefinition(
        ShipType.King,
        "King",
        "Tyrant of the battlefied, Huge HP and DMG but easy to spot",
        
        6,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(1, 1, 1),
        ShipDefinitionFactory.createShipHullTile(2, 1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 1, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 3),
        ShipDefinitionFactory.createShipFiringPatternTile(0, 1, 2)
        ]

    ),

    [ShipType.Queen]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Queen,
        "Queen",
        "The Ultimate Glass Cannon, High DMG, Low HP. High risk high reward",
        
        7 ,

        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(0, -1, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 4),
        ShipDefinitionFactory.createShipFiringPatternTile(0, 1, 4),
        ShipDefinitionFactory.createShipFiringPatternTile(0, -1, 4)
        ]

    ),

    [ShipType.Rook]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Rook,
        "Rook",
        "The Twin Tower",
        
        5 ,
        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 2),
        ShipDefinitionFactory.createShipHullTile(0, -1, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 2),
        ShipDefinitionFactory.createShipFiringPatternTile(0, 1, 2)
        ]

    ),

    [ShipType.Bishop]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Bishop,
        "Bishop",
        "Bi-shop",
        
        4 ,
        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 1, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 2),
        ShipDefinitionFactory.createShipFiringPatternTile(1, -1, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(1, 1, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, -1, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(1, 1, 1)
        ]

    ),

    [ShipType.Knight]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Knight,
        "Knight",
        "In their shining armor",
        
        4 ,
        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 1, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(1, -2, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(2, -1, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(2, 1, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(1, 2, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, 2, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(-2, 1, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(-2, -1, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, -2, 1)
        ]

    ),

    [ShipType.Pawn]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Pawn,
        "Pawn",
        "Footsoldier",
        
        1 ,
        [ShipDefinitionFactory.createShipHullTile(0, 0, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 1)
        ]

    ),

    [ShipType.Wingman]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Wingman,
        "Wingman",
        "Your trusty companion",
        
        2 ,
        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 2)
        ]

    ),

    [ShipType.Dragon]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Dragon,
        "Dragon",
        "Tyrant of the sky",
        
        8 ,
        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 0, 3),
        ShipDefinitionFactory.createShipHullTile(2, 0, 2),
        ShipDefinitionFactory.createShipHullTile(1, 1, 4),
        ShipDefinitionFactory.createShipHullTile(2, 1, 3),
        ShipDefinitionFactory.createShipHullTile(2, 2, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 3),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, -1, 2),
        ShipDefinitionFactory.createShipFiringPatternTile(0, -1, 3),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, -1, 2)
        ]

    ),

    [ShipType.Voltz]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Voltz,
        "Voltz",
        "Zap",
        
        3 ,
        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(0, -1, 1),
        ShipDefinitionFactory.createShipHullTile(1, -1, 1),
        ShipDefinitionFactory.createShipHullTile(1, -2, 1)
        ],

    ),

    [ShipType.Ghost]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Ghost,
        "Ghost",
        "Boo!",
        
        3 ,
        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(1, 1, 1),
        ShipDefinitionFactory.createShipHullTile(1, -1, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 1, 1)
        ],
    ),

    [ShipType.Shark]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Shark,
        "Shark",
        "There's blood in the water",
        
        6 ,
        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(0, -1, 1),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(0, 2, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 1, 1),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 1, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 3),
        ShipDefinitionFactory.createShipFiringPatternTile(-1, 0, 2),
        ShipDefinitionFactory.createShipFiringPatternTile(1, 0, 2)
        ]

    ),

    [ShipType.Archer]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Archer,
        "Archer",
        "Pew pew",
        
        4 ,
        [ShipDefinitionFactory.createShipHullTile(0, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(1, -1, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 4),
        ShipDefinitionFactory.createShipFiringPatternTile(1, 0, 3),
        ShipDefinitionFactory.createShipFiringPatternTile(2, 0, 2),
        ShipDefinitionFactory.createShipFiringPatternTile(3, 0, 1)
        ]

    ),

    [ShipType.Sword]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Sword,
        "Sword",
        "Staby stab",
        
        4 ,
        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(0, -1, 1),
        ShipDefinitionFactory.createShipHullTile(0, -2, 1),
        //ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(1, 0, 1),
        ShipDefinitionFactory.createShipHullTile(-1, 0, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 2),
        ShipDefinitionFactory.createShipFiringPatternTile(0, -1, 2), 
        ]

    ),

    [ShipType.Mace]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Mace,
        "Mace",
        "Smashy smack",
        
        4 ,
        [ShipDefinitionFactory.createShipHullTile(0, 0, 3),
        ShipDefinitionFactory.createShipHullTile(0, 1, 2),
        ShipDefinitionFactory.createShipHullTile(0, 2, 1),
        ShipDefinitionFactory.createShipHullTile(0, 3, 1),
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 3),
        ShipDefinitionFactory.createShipFiringPatternTile(0, 1, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(0, -1, 1)
        ]

    ),

[ShipType.Spear]: ShipDefinitionFactory.createShipDefinition(
        ShipType.Spear,
        "Spear",
        "Pointy pokey",
        
        4 ,
        [ShipDefinitionFactory.createShipHullTile(0, 0, 2),
        ShipDefinitionFactory.createShipHullTile(0, 1, 1),
        ShipDefinitionFactory.createShipHullTile(0, 2, 1),
        ShipDefinitionFactory.createShipHullTile(0, 3, 1),
        ShipDefinitionFactory.createShipHullTile(0, 4, 1),
        ShipDefinitionFactory.createShipHullTile(0, 5, 1)
        ],

        [ShipDefinitionFactory.createShipFiringPatternTile(0, 0, 2),
        ShipDefinitionFactory.createShipFiringPatternTile(0, -1, 1),
        ShipDefinitionFactory.createShipFiringPatternTile(0, -2, 1)
        ]

     ),
}

export default ShipDefinitions;