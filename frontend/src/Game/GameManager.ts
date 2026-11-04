import { getOppositePlayer, Player } from "@super-netcentric-battleship/shared/Game/Player.js";
import GameBoard from "./Board";
import GameSettings from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import { CurrentTurnNotificationMessage, ServerMessage, ServerMessageType, UpdateBoardTileStatusesNotificationMessage } from "@super-netcentric-battleship/shared/ServerMessage.js";
import { FireVolleyActionMessageBuilder, InitializeFleetActionMessageBuilder, ShipPlacement } from "@super-netcentric-battleship/shared/ClientMessage.js";
import Coordinate, { CoordinateFactory } from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";
import { GameState } from "@super-netcentric-battleship/shared/Game/GameState.js";
import ShipDefinitions, { ShipType } from "@super-netcentric-battleship/shared/Game/ShipDefinitions.js";


export class GameManager extends EventTarget {
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

    get currentGameState(): GameState | null{
        if(!this.active) return null;
        if(this.currentTurn == null) return GameState.ShipPlacement;
        else return GameState.Battle;
    }

    get opponentId(): Player | null{
        if(this.playerId == null) return null;
        return getOppositePlayer(this.playerId);
    }

    get isPlayersTurn(): boolean | null{
        if(this.playerId == null) return null;
        return this.currentTurn == this.playerId;
    }

    fleet: ShipPlacement[] = [];

    get fleetValue(): number{
        return this.fleet.map(x => ShipDefinitions[x.shipType].value).reduce((a,b) => a + b, 0);
    }

    constructor(webSocket: WebSocket) {
        super()
        this.webSocket = webSocket;

        this.webSocket.addEventListener("message", this.handleServerMessage.bind(this));
    }

    getPlayerBoard(): GameBoard{
        if(!this.active) throw new Error("Game is not Active");
        return this.boards![this.playerId!];
    }

    getOpponentBoard(): GameBoard{
        if(!this.active) throw new Error("Game is not Active");
        return this.boards![this.opponentId!];
    }

    addShipToFleet(shipType: ShipType, location: Coordinate, orientation: Orientation){
        if(this.currentGameState != GameState.ShipPlacement) throw new Error("Cannot add ship to fleet in non ship placement state");
        const shipDefinition = ShipDefinitions[shipType];
        if(this.fleetValue + shipDefinition.value > this.currentGameSettings!.maxFleetValue) throw new Error("Added ship will exceed max fleet value");
        location = CoordinateFactory.copyCoordinate(location);

        this.getPlayerBoard().addShip(shipDefinition, location, orientation);
        this.fleet.push({
            shipType: shipType,
            location: location,
            orientation: orientation
        })
    }

    submitFleet(){
        this.initializeFleet(this.fleet);
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
        this.notifyStateChanged();
    }

    handleUpdateBoardTileStatusesNotificationMessage(message: UpdateBoardTileStatusesNotificationMessage){
        if(!this.active) return;

        for(const boardTileStatus of message.boardTileStatuses){
            this.boards![boardTileStatus.boardOwner].updateTileState(boardTileStatus);
        }
        this.notifyStateChanged();
    }

    startGame(gameSettings: GameSettings, playerId: Player){
        if(this.active) throw new Error("can not start game while one is already active");
        this.currentGameSettings = gameSettings;
        this.playerId = playerId;

        this.initializeBoards()

        this.active = true;
        this.notifyStateChanged();
    }

    stopGame(){
        if(!this.active) throw new Error("cannot stop game that is inactive");
        this.currentGameSettings = null;
        this.playerId = null;
        this.boards = null;
        this.currentTurn = null;
        this.lastTurnUpdateTimeStamp = null;
        this.fleet = [];

        this.active = false;
        this.notifyStateChanged();
    }

    initializeBoards(){
        this.boards = {
            [Player.Player1]: new GameBoard(this.currentGameSettings!.boardSize),
            [Player.Player2]: new GameBoard(this.currentGameSettings!.boardSize)
        };
    }
  
    private notifyStateChanged() {
        this.dispatchEvent(new Event("state-change"));
    }
}
