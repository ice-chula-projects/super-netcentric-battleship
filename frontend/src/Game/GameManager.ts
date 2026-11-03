import { getOppositePlayer, Player } from "@super-netcentric-battleship/shared/Game/Player.js";
import GameBoard from "./Board";
import GameSettings from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import { CurrentTurnNotificationMessage, ServerMessage, ServerMessageType, UpdateBoardTileStatusesNotificationMessage } from "@super-netcentric-battleship/shared/ServerMessage.js";
import { FireVolleyActionMessageBuilder, InitializeFleetActionMessageBuilder, ShipPlacement } from "@super-netcentric-battleship/shared/ClientMessage.js";
import Coordinate from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";


export class GameManager{
    active: boolean = false;
    webSocket: WebSocket;
    boards:{
        [Player.Player1]: GameBoard,
        [Player.Player2]: GameBoard
    } | null = null;

    currentGameSettings: GameSettings | null = null;
    playerId: Player | null = null;
    currentTurn: Player | null = null;
    lastTurnUpdateTimeStamp: number | null = null;


    constructor(webSocket: WebSocket){
        this.webSocket = webSocket;

        this.webSocket.addEventListener("message", this.handleServerMessage.bind(this));
    }

    getPlayerBoard(): GameBoard{
        if(!this.active) throw new Error("Game is not Active");
        return this.boards[this.playerId];
    }

    getOpponentBoard(): GameBoard{
        if(!this.active) throw new Error("Game is not Active");
        return this.boards[getOppositePlayer(this.playerId)];
    }

    fireVolley(originatingShipId: number, targetCoordinates: Coordinate, volleyOrientation: Orientation){
        const message = new FireVolleyActionMessageBuilder()
        .setOriginatingShipId(originatingShipId)
        .setTargetCoordinates(targetCoordinates)
        .setVolleyOrientation(volleyOrientation)

        this.webSocket.send(message.toJsonString());
    }

    initializeFleet(fleet: ShipPlacement[]){
        const message = new InitializeFleetActionMessageBuilder()
        .setFleet(fleet)

        this.webSocket.send(message.toJsonString());
    }

    handleServerMessage(message: MessageEvent){
        const serverMessage = JSON.parse(message.data) as ServerMessage;

        switch(serverMessage.type){
            case ServerMessageType.CurrentTurnNotification:
                this.handleCurrentTurnNotificationMessage(serverMessage); 
            break;
            case ServerMessageType.UpdateBoardTileStatusesNotification:
                this.handleUpdateBoardTileStatusesNotificationMessage(serverMessage);
            break;
        }
    }

    handleCurrentTurnNotificationMessage(message: CurrentTurnNotificationMessage){
        if(!this.active) return;
        
        this.currentTurn = message.currentTurn;
        this.lastTurnUpdateTimeStamp = message.timestamp;
    }

    handleUpdateBoardTileStatusesNotificationMessage(message: UpdateBoardTileStatusesNotificationMessage){
        if(!this.active) return;
        
        for(const boardTileStatus of message.boardTileStatuses){
            this.boards[boardTileStatus.boardOwner].updateTileState(boardTileStatus);
        }
    }

    startGame(gameSettings: GameSettings, playerId: Player){
        if(this.active) throw new Error("can not start game while one is already active");
        this.currentGameSettings = gameSettings;
        this.playerId = playerId;

        this.initializeBoards()

        this.active = true;
    }

    stopGame(){
        if(!this.active) throw new Error("cannot stop game that is inactive");
        this.currentGameSettings = null;
        this.playerId = null;
        this.boards = null;
        this.active = false;
    }

    initializeBoards(){
        this.boards = {
            [Player.Player1]: new GameBoard(this.currentGameSettings.boardSize),
            [Player.Player2]: new GameBoard(this.currentGameSettings.boardSize)
        };
    }
}