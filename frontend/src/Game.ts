import { GameStateNotificationMessage, GameStates } from "@super-netcentric-battleship/shared/ServerMessage.js";
import GameBoard, { BoardTileTypes } from "./Board";
import { JoinGameMessageBuilder, SendBoardSetupMessageBuilder, SendGameActionMessageBuilder, Ship } from "@super-netcentric-battleship/shared/ClientMessage.js";

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
    gameId: string = null;
    boards:{
        [Player.player]: GameBoard,
        [Player.enemy]: GameBoard
    } = {       
        [Player.player]: null,
        [Player.enemy]: null
    }
    ships: Ship[] = [];

    lastShot = {
        x: null,
        y: null
    }

    constructor(webSocket){
        this.webSocket = webSocket;
    }

    joinGame(gameId:string){
        const message = new JoinGameMessageBuilder()
        .setGameId(gameId);

        this.webSocket.send(message.toJsonString());
    }

    initializeGame(){
        if(this.active) throw new Error("attempted to start game while game already in progress");
        this.active = true;

        this.boards[Player.player] = new GameBoard();
        this.boards[Player.enemy] = new GameBoard();
        
    }

    informGameState(gameMessage: GameStateNotificationMessage){
        switch(gameMessage.gameState){                
            case GameStates.Deploying:
                this.initializeGame();
                this.state = GameStates.Deploying;
            break;
            case GameStates.Fighting:
                this.playersTurn = gameMessage.currentTurn.id == this.playerId;
                this.state = GameStates.Fighting;
            break;
            case GameStates.Finished:
                this.state = GameStates.Forming;
                this.active = false;
                this.gameId = null;
                alert("Game Ended")
            break;
        }
    }

    informShotResult(hit: boolean){
        this.boards[Player.enemy].setTile(this.lastShot.x, this.lastShot.y, hit ? BoardTileTypes.Hit : BoardTileTypes.Miss);
    }

    informOpponentAction(x: number, y: number){
        this.boards[Player.player].shootTile(x,y);
        this.playersTurn = true;
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

    shoot(x: number, y:number){
        if(this.playersTurn == false) throw new Error("Tried to shoot during opponent's turn");
        this.playersTurn = false;
        this.lastShot.x = x;
        this.lastShot.y = y;
        
        const message = new SendGameActionMessageBuilder()
        .setX(x)
        .setY(y)
        
        this.webSocket.send(message.toJsonString());
    }
}