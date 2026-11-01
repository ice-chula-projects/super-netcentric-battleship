import Board from "@super-netcentric-battleship/shared/Game/Board/Board.js";
import Ship from "@super-netcentric-battleship/shared/Game/Ship/Ship.js";
import ShipTile from "@super-netcentric-battleship/shared/Game/Ship/ShipTile.js";
import Coordinate from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import Camera from "./Camera";
import GameBoard, { BoardTileTypes } from "./Board";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";

const shipTiles = [
    new ShipTile(new Coordinate(0,0)),
    new ShipTile(new Coordinate(0,-1)),
    new ShipTile(new Coordinate(0,-2)),
    new ShipTile(new Coordinate(1,0)),
    new ShipTile(new Coordinate(2,0)),
    new ShipTile(new Coordinate(2,-1)),
    new ShipTile(new Coordinate(3,-1)),
]

const ship = new Ship(shipTiles);
ship.orientation = Orientation.Down
const board = new Board(8);
board.placeShip(ship, new Coordinate(0,3));
ship.orientation = Orientation.Right
board.placeShip(ship, new Coordinate(4,4));


//render visualization of board
const gameBoard = new GameBoard()
for(let x = 0; x < 8; x++){
    for(let y = 0; y < 8; y++){
        const type = board.board[x][y].hasShip ? BoardTileTypes.Ship : BoardTileTypes.Empty;
        gameBoard.setTile(x, y, type)
    }
}
const camera = new Camera(document.getElementById("canvas") as HTMLCanvasElement, null);
camera.stop();
camera.drawBoard(gameBoard, 20, 20, 460, "board")

//@ts-ignore
window.board = board;
//@ts-ignore
window.Ship = Ship;
//@ts-ignore
window.Board = Board;
//@ts-ignore
window.Coordinate = Coordinate;
//@ts-ignore
window.ShipTile = ShipTile;