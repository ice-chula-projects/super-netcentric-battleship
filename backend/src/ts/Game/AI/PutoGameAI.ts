import GameSettings from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import AIWorldState from "./AIWorldState.js";
import Board, { BoardTileUpdate } from "../Board/Board.js";
import { ShipPlacement } from "@super-netcentric-battleship/shared/ClientMessage.js";
import Coordinate, { relativeCoordinateToAbsoluteCoordinate } from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";
import GameAI from "./GameAI.js";
import ShipDefinitions, { ShipType } from "@super-netcentric-battleship/shared/Game/ShipDefinitions.js";
import Ship from "../Ship/Ship.js";
import Random from "../../lib/Random.js";
import AttackTile from "../Ship/AttackTile.js";
import { BoardTileState } from "@super-netcentric-battleship/shared/Game/BoardTileState.js";

//based on pong's "PUTO" algorithm
export default class PutoGameAI implements GameAI{
    worldState: AIWorldState;
    gameSettings: GameSettings;

    constructor(gameSettings: GameSettings, playerBoard: Board, artificialIntelligenceBoard: Board){
        this.gameSettings = gameSettings;
        this.worldState = new AIWorldState(playerBoard, artificialIntelligenceBoard);
    }

    notifyBoardTileUpdates(boardTileUpdates: BoardTileUpdate[]){
        for(const boardTileUpdate of boardTileUpdates){
            this.worldState.updateTileState(boardTileUpdate.coordinates.x, boardTileUpdate.coordinates.y, boardTileUpdate);
        }
    }

    generateFleet(): ShipPlacement[]{
        const availableShips = Object.values(ShipDefinitions).map(x=>new Ship(x));
        const fleet: ShipPlacement[] = [];
        const maxIterations = 1000;
        let currentFleetValue = 0;

        const sampleBoard = new Board(this.gameSettings.boardSize);
        let i = 0;
        while(i < maxIterations){
            const validShips = availableShips.filter(x=>currentFleetValue + x.value <= this.gameSettings.maxFleetValue);
            if(validShips.length <= 0) break;

            const ship = Random.randomElementFromArray(validShips);
            const orientation = this.generateRandomOrientation();
            const location = this.generateRandomPosition();
            
            try{
                ship.orientation = orientation;
                sampleBoard.placeShip(ship, location);

                fleet.push({
                    shipType: ship.type,
                    location: location,
                    orientation: orientation
                })

                currentFleetValue += ship.value;
            } catch {

            }

            i++;
        }        
        return fleet;
    }

    //TODO: actually implement the algorithm
    fireVolley(): {shipId: number, location: Coordinate, orientation: Orientation} | null{
        const tiles = this.worldState.getTiles();
        const unkilledTiles = tiles.filter(x=>x.health != null && x.health > 0);
        if(unkilledTiles.length > 0){
            return this.generateAttackingShot();
        } else {
            return this.generateExplorationShot();
        }
        
    }

    generateAttackingShot(){
        const validShips = this.worldState.artificialIntelligenceBoard.ships.filter(x=> x.alive);

        if(validShips.length <= 0) return null;
        const maxIterations = 1000;
        const maxPlateauIterations = 50;
        let plateauCounter = 0;
        let bestShot = null;
        let bestShotScore = -Infinity;
        let i = 0;
        while(i < maxIterations && plateauCounter < maxPlateauIterations){
            const ship = Random.randomElementFromArray(validShips);
            const shipId = this.worldState.artificialIntelligenceBoard.ships.indexOf(ship);
            const location = this.generateRandomPosition();
            const orientation = this.generateRandomOrientation();

            const score = this.calculateAttackingShotScore(ship.firingPattern, location, orientation)

            if(score > bestShotScore){
                bestShot = {
                    shipId: shipId,
                    location: location,
                    orientation: orientation
                }

                bestShotScore = score;

                plateauCounter = 0;
            } else{
                plateauCounter++;
            }

            i++;
        }

        return bestShot;
    }

    generateExplorationShot(){
        const validShips = this.worldState.artificialIntelligenceBoard.ships.filter(x=> x.alive);
        if(validShips.length <= 0) return null;
        const maxIterations = 1000;
        const maxPlateauIterations = 50;
        let plateauCounter = 0;
        let bestShot = null;
        let bestShotScore = -Infinity;
        let i = 0;
        while(i < maxIterations && plateauCounter < maxPlateauIterations){
            const ship = Random.randomElementFromArray(validShips);
            const shipId = this.worldState.artificialIntelligenceBoard.ships.indexOf(ship);
            const location = this.generateRandomPosition();
            const orientation = this.generateRandomOrientation();

            const score = this.calculateExplorationShotScore(ship.firingPattern, location, orientation)

            if(score > bestShotScore){
                bestShot = {
                    shipId: shipId,
                    location: location,
                    orientation: orientation
                }

                bestShotScore = score;

                plateauCounter = 0;
            } else{
                plateauCounter++;
            }

            i++;
        }

        return bestShot;
    }

    calculateExplorationShotScore(firingPattern: AttackTile[], location: Coordinate, orientation: Orientation): number{
        let score = 0;
        for(const attackTile of firingPattern){
            const absoluteCoordinate = relativeCoordinateToAbsoluteCoordinate(attackTile.relativeCoordinates, location, orientation);
            
            //shoot at unrevealed tiles
            if(this.worldState.getTile(absoluteCoordinate.x, absoluteCoordinate.y)?.state != BoardTileState.Hidden) continue;
            
            //shoot value tiles adjacent to previously revealed ships
            for(let i = -1; i <= 1; i++){
                for(let j = -1; j <= 1; j++){
                    if(i == 0 && j == 0) continue;

                    const tile = this.worldState.getTile(i + absoluteCoordinate.x, j + absoluteCoordinate.y);
                    if(tile == null) continue;
                    const state = tile.state;
                    if(state == BoardTileState.DamagedTile || state == BoardTileState.DestoyedTile || state == BoardTileState.Ship){
                        //reward 3 points for direct adjacency, and 1 for diagonal
                        score += i + j % 2 == 0? 1 : 3;
                    };
                }
            }
        }

        return score;
    }

    calculateAttackingShotScore(firingPattern: AttackTile[], location: Coordinate, orientation: Orientation): number{
        let score = 0;
        for(const attackTile of firingPattern){
            const absoluteCoordinate = relativeCoordinateToAbsoluteCoordinate(attackTile.relativeCoordinates, location, orientation);
            const tileHealth = this.worldState.getTile(absoluteCoordinate.x, absoluteCoordinate.y)?.health;
            if(tileHealth != null) score += Math.min(tileHealth, attackTile.damage);
        }

        return score;
    }

    generateRandomOrientation(): Orientation{
        return Random.randomElementFromArray([Orientation.Right, Orientation.Down, Orientation.Left, Orientation.Up]);
    }

    generateRandomPosition(): Coordinate{
        return {
            x: Random.randomInteger(0, this.gameSettings.boardSize - 1),
            y: Random.randomInteger(0, this.gameSettings.boardSize - 1)
        }
    }
}