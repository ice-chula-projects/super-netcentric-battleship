import GameSettings from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import AIWorldState from "./AIWorldState.js";
import Board, { BoardTileUpdate } from "../Board/Board.js";
import { ShipPlacement } from "@super-netcentric-battleship/shared/ClientMessage.js";
import Coordinate from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";
import GameAI from "./GameAI.js";
import ShipDefinitions, { ShipType } from "@super-netcentric-battleship/shared/Game/ShipDefinitions.js";
import Ship from "../Ship/Ship.js";
import Random from "../../lib/Random.js";

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
            this.worldState.updateTileState(boardTileUpdate.coordinates.x, boardTileUpdate.coordinates.y, boardTileUpdate.state);
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
        const validShips = this.worldState.artificialIntelligenceBoard.ships.filter(x=> x.alive);
        if(validShips.length <= 0) return null;
        const ship = Random.randomElementFromArray(validShips);
        const shipId = this.worldState.artificialIntelligenceBoard.ships.indexOf(ship);
        const location = this.generateRandomPosition();
        const orientation = this.generateRandomOrientation();

        return {
            shipId: shipId,
            location: location,
            orientation: orientation
        }
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