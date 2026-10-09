import { GameStates } from "@super-netcentric-battleship/shared/ServerMessage.js";
import GameBoard from "./Board";
import { SendBoardSetupMessageBuilder, Ship } from "@super-netcentric-battleship/shared/ClientMessage.js";

export enum Player{
    player = "player",
    enemy = "enemy"
}
export class Game{
    active: boolean = false;
    playersTurn: boolean = false;
    webSocket: WebSocket;
    state: GameStates = GameStates.Forming;
    playerId: string = null;
    boards:{
        [Player.player]: GameBoard,
        [Player.enemy]: GameBoard
    } = {       
        [Player.player]: null,
        [Player.enemy]: null
    }
    ships: Ship[] = [];


    constructor(webSocket){
        this.webSocket = webSocket;
    }

    initializeGame(){
        if(this.active) throw new Error("attempted to start game while game already in progress");
        this.active = true;

        this.boards[Player.player] = new GameBoard();
        this.boards[Player.enemy] = new GameBoard();
        
    }

    informGameState(gameState: GameStates){
        switch(gameState){
            case GameStates.Deploying:
                this.initializeGame();
                this.state = GameStates.Deploying;
            break;
            case GameStates.Fighting:

                this.state = GameStates.Fighting;
            break;
        }
    }

    addShip(x: number, y: number, orientation: "down" | "right"){
        if(this.ships.length >= 4){
            alert("Cannot place more than 4 ships")
            return;
        }

        const success = this.boards[Player.player].placeShip(x,y, orientation)
        if(!success){
            alert("Invalid Ship Placement")
            return;
        }
        const ship = new Ship(x, y, orientation);
        this.ships.push(ship);

        if(this.ships.length == 4){
            const message = new SendBoardSetupMessageBuilder()
            .setShips(this.ships);
            this.webSocket.send(message.toJsonString());
        }
    }
}