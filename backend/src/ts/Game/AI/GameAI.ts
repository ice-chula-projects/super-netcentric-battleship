import GameSettings from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import AIWorldState from "./AIWorldState.js";
import Board, { BoardTileUpdate } from "../Board/Board.js";
import { ShipPlacement } from "@super-netcentric-battleship/shared/ClientMessage.js";
import Coordinate from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";

export default interface GameAI{
    notifyBoardTileUpdates(boardTileUpdates: BoardTileUpdate[]): void;
    generateFleet(): ShipPlacement[];
    fireVolley(): {shipId: number, location: Coordinate, orientation: Orientation} | null;
}