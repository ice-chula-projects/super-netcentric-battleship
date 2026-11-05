import { getOppositePlayer, Player } from '@super-netcentric-battleship/shared/Game/Player.js';
import GameBoard from './Board';
import GameSettings from '@super-netcentric-battleship/shared/Game/GameSettings.js';
import {
    CurrentTurnNotificationMessage,
    MatchCompleteNotificationMessage,
    MatchStartNotificationMessage,
    RematchStatusNotificationMessage,
    ServerMessage,
    ServerMessageType,
    UpdateBoardTileStatusesNotificationMessage,
} from '@super-netcentric-battleship/shared/ServerMessage.js';
import {
    FireVolleyActionMessageBuilder,
    InitializeFleetActionMessageBuilder,
    RequestRematchActionMessageBuilder,
    ShipPlacement,
} from '@super-netcentric-battleship/shared/ClientMessage.js';
import Coordinate, {
    CoordinateFactory,
} from '@super-netcentric-battleship/shared/Game/Coordinate.js';
import { Orientation } from '@super-netcentric-battleship/shared/Game/Orientation.js';
import { GameState } from '@super-netcentric-battleship/shared/Game/GameState.js';
import ShipDefinitions, {
    ShipType,
} from '@super-netcentric-battleship/shared/Game/ShipDefinitions.js';

<<<<<<< HEAD
export class GameManager extends EventTarget {
    initialized: boolean = false;
    matchInProgress: boolean = false;
=======

export class GameManager extends EventTarget {
    active: boolean = false;
>>>>>>> 0d1f8ef (Connected Lobby System)
    webSocket: WebSocket;
    boards: {
        [Player.Player1]: GameBoard;
        [Player.Player2]: GameBoard;
    } | null = null;

    currentGameSettings: GameSettings | null = null;
    playerId: Player | null = null;
    currentTurn: Player | null = null;
    lastTurnUpdateTimeStamp: number | null = null;
    matchWinner: Player | null = null;
    score: {
        [Player.Player1]: number;
        [Player.Player2]: number;
    } | null = null;

    rematchStatus: {
        [Player.Player1]: boolean;
        [Player.Player2]: boolean;
    } | null = null;

    get rematchReqeuested(): boolean | null {
        if (this.rematchStatus == null) return null;
        return this.rematchStatus[Player.Player1] || this.rematchStatus[Player.Player2];
    }

    get currentGameState(): GameState | null {
        if (!this.initialized) return null;
        if (this.matchWinner != null) return GameState.End;
        else if (this.currentTurn == null) return GameState.ShipPlacement;
        else return GameState.Battle;
    }

    get opponentId(): Player | null {
        if (this.playerId == null) return null;
        return getOppositePlayer(this.playerId);
    }

    get isPlayersTurn(): boolean | null {
        if (this.playerId == null) return null;
        return this.currentTurn == this.playerId;
    }

    get playerScore(): number | null {
        if (this.playerId == null) return null;
        return this.score![this.playerId!];
    }

    get opponentScore(): number | null {
        if (this.playerId == null) return null;
        return this.score![this.opponentId!];
    }

    fleet: ShipPlacement[] = [];

    get fleetValue(): number {
        return this.fleet.map((x) => ShipDefinitions[x.shipType].value).reduce((a, b) => a + b, 0);
    }

    constructor(webSocket: WebSocket) {
<<<<<<< HEAD
        super();
=======
        super()
>>>>>>> 0d1f8ef (Connected Lobby System)
        this.webSocket = webSocket;

        this.webSocket.addEventListener('message', this.handleServerMessage.bind(this));
    }

<<<<<<< HEAD
    getPlayerBoard(): GameBoard {
        if (!this.initialized) throw new Error('Game is not Initialized');
        return this.boards![this.playerId!];
    }

    getOpponentBoard(): GameBoard {
        if (!this.initialized) throw new Error('Game is not Initialized');
=======
    getPlayerBoard(): GameBoard{
        if(!this.active) throw new Error("Game is not Active");
        return this.boards![this.playerId!];
    }

    getOpponentBoard(): GameBoard{
        if(!this.active) throw new Error("Game is not Active");
>>>>>>> 0d1f8ef (Connected Lobby System)
        return this.boards![this.opponentId!];
    }

    addShipToFleet(shipType: ShipType, location: Coordinate, orientation: Orientation) {
        if (this.currentGameState != GameState.ShipPlacement)
            throw new Error('Cannot add ship to fleet in non ship placement state');
        const shipDefinition = ShipDefinitions[shipType];
<<<<<<< HEAD
        if (this.fleetValue + shipDefinition.value > this.currentGameSettings!.maxFleetValue)
            throw new Error('Added ship will exceed max fleet value');
=======
        if(this.fleetValue + shipDefinition.value > this.currentGameSettings!.maxFleetValue) throw new Error("Added ship will exceed max fleet value");
>>>>>>> 0d1f8ef (Connected Lobby System)
        location = CoordinateFactory.copyCoordinate(location);

        this.getPlayerBoard().addShip(shipDefinition, location, orientation);
        this.fleet.push({
            shipType: shipType,
            location: location,
<<<<<<< HEAD
            orientation: orientation,
        });
=======
            orientation: orientation
        })
>>>>>>> 0d1f8ef (Connected Lobby System)
    }

    submitFleet() {
        this.initializeFleet(this.fleet);
    }

    fireVolley(
        originatingShipId: number,
        targetCoordinates: Coordinate,
        volleyOrientation: Orientation,
    ) {
        const message = new FireVolleyActionMessageBuilder()
            .setOriginatingShipId(originatingShipId)
            .setTargetCoordinates(targetCoordinates)
            .setVolleyOrientation(volleyOrientation);

        this.webSocket.send(message.toJsonString());
    }

    initializeFleet(fleet: ShipPlacement[]) {
        const message = new InitializeFleetActionMessageBuilder().setFleet(fleet);

        this.webSocket.send(message.toJsonString());
    }

    requestRematch() {
        const message = new RequestRematchActionMessageBuilder();

        this.webSocket.send(message.toJsonString());
    }

    handleServerMessage(message: MessageEvent) {
        const serverMessage = JSON.parse(message.data) as ServerMessage;

        switch (serverMessage.type) {
            case ServerMessageType.CurrentTurnNotification:
                this.handleCurrentTurnNotificationMessage(serverMessage);
<<<<<<< HEAD
                break;
=======
            break;
>>>>>>> 0d1f8ef (Connected Lobby System)
            case ServerMessageType.UpdateBoardTileStatusesNotification:
                this.handleUpdateBoardTileStatusesNotificationMessage(serverMessage);
                break;
            case ServerMessageType.MatchStartNotification:
                this.handleMatchStartNotificationMessage(serverMessage);
                break;
            case ServerMessageType.MatchCompleteNotification:
                this.handleMatchCompleteNotificationMessage(serverMessage);
                break;
            case ServerMessageType.RematchStatusNotification:
                this.handleRematchStatusNotificationMessage(serverMessage);
                break;
        }
    }

<<<<<<< HEAD
    handleMatchStartNotificationMessage(_message: MatchStartNotificationMessage) {
        this.startNewMatch();
    }

    handleMatchCompleteNotificationMessage(message: MatchCompleteNotificationMessage) {
        this.endMatch(message.winner);
        this.score = message.score;
    }

    handleRematchStatusNotificationMessage(message: RematchStatusNotificationMessage) {
        this.rematchStatus = message.rematchStatus;
    }

    handleCurrentTurnNotificationMessage(message: CurrentTurnNotificationMessage) {
        if (!this.matchInProgress) return;
=======
    handleCurrentTurnNotificationMessage(message: CurrentTurnNotificationMessage){
        if(!this.active) return;
>>>>>>> 0d1f8ef (Connected Lobby System)

        this.currentTurn = message.currentTurn;
        this.lastTurnUpdateTimeStamp = message.timestamp;
        this.notifyStateChanged();
    }

<<<<<<< HEAD
    handleUpdateBoardTileStatusesNotificationMessage(
        message: UpdateBoardTileStatusesNotificationMessage,
    ) {
        if (!this.matchInProgress) return;

        for (const boardTileStatus of message.boardTileStatuses) {
=======
    handleUpdateBoardTileStatusesNotificationMessage(message: UpdateBoardTileStatusesNotificationMessage){
        if(!this.active) return;

        for(const boardTileStatus of message.boardTileStatuses){
>>>>>>> 0d1f8ef (Connected Lobby System)
            this.boards![boardTileStatus.boardOwner].updateTileState(boardTileStatus);
        }
        this.notifyStateChanged();
    }

    initializeGame(gameSettings: GameSettings, playerId: Player) {
        if (this.initialized) throw new Error('cannot initialize game twice');
        this.currentGameSettings = gameSettings;
        this.playerId = playerId;
        this.score = {
            [Player.Player1]: 0,
            [Player.Player2]: 0,
        };

        this.initializeBoards();

<<<<<<< HEAD
        this.initialized = true;
=======
        this.active = true;
>>>>>>> 0d1f8ef (Connected Lobby System)
        this.notifyStateChanged();
    }

    startNewMatch() {
        if (this.matchInProgress)
            throw new Error('cannot start new match when match is already in progress');
        this.initializeBoards();
        this.lastTurnUpdateTimeStamp = null;
        this.fleet = [];
        this.matchWinner = null;
        this.rematchStatus = {
            [Player.Player1]: false,
            [Player.Player2]: false,
        };
        this.currentTurn = null;

        this.matchInProgress = true;
    }

    endMatch(winner: Player) {
        if (!this.matchInProgress) throw new Error('cannot end match when no match is in progress');
        this.matchWinner = winner;
        this.matchInProgress = false;
    }

    unInitializeGame() {
        if (!this.initialized)
            throw new Error("cannot unintialize game that isn't already initialized");
        this.currentGameSettings = null;
        this.playerId = null;
        this.boards = null;
        this.currentTurn = null;
        this.lastTurnUpdateTimeStamp = null;
        this.fleet = [];
        this.matchWinner = null;
        this.score = null;
        this.rematchStatus = null;

<<<<<<< HEAD
        this.initialized = false;
        this.matchInProgress = false;
=======
        this.active = false;
>>>>>>> 0d1f8ef (Connected Lobby System)
        this.notifyStateChanged();
    }

    initializeBoards() {
        this.boards = {
            [Player.Player1]: new GameBoard(this.currentGameSettings!.boardSize),
<<<<<<< HEAD
            [Player.Player2]: new GameBoard(this.currentGameSettings!.boardSize),
        };
    }

    private notifyStateChanged() {
        this.dispatchEvent(new Event('state-change'));
=======
            [Player.Player2]: new GameBoard(this.currentGameSettings!.boardSize)
        };
    }
  
    private notifyStateChanged() {
        this.dispatchEvent(new Event("state-change"));
>>>>>>> 0d1f8ef (Connected Lobby System)
    }
}
