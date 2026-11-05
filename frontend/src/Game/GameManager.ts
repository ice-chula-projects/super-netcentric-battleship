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

export class GameManager extends EventTarget {
    initialized: boolean = false;
    matchInProgress: boolean = false;
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
    fleetSubmitted: boolean = false;
    get fleetValue(): number {
        return this.fleet.map((x) => ShipDefinitions[x.shipType].value).reduce((a, b) => a + b, 0);
    }

    constructor(webSocket: WebSocket) {
        super();
        this.webSocket = webSocket;

        this.webSocket.addEventListener('message', this.handleServerMessage.bind(this));
    }

    getPlayerBoard(): GameBoard {
        if (!this.initialized) throw new Error('Game is not Initialized');
        return this.boards![this.playerId!];
    }

    getOpponentBoard(): GameBoard {
        if (!this.initialized) throw new Error('Game is not Initialized');
        return this.boards![this.opponentId!];
    }

    resetFleet(){
        this.fleet = [];
        this.initializeBoards();
    }

    addShipToFleet(shipType: ShipType, location: Coordinate, orientation: Orientation) {
        if (this.currentGameState != GameState.ShipPlacement) {
            alert('Cannot add ship to fleet in non ship placement state');
            return;            
        }
        const shipDefinition = ShipDefinitions[shipType];
        if (this.fleetValue + shipDefinition.value > this.currentGameSettings!.maxFleetValue){
            alert('Added ship will exceed max fleet value');
            return;
        }
        location = CoordinateFactory.copyCoordinate(location);

        this.getPlayerBoard().addShip(shipDefinition, location, orientation);
        this.fleet.push({
            shipType: shipType,
            location: location,
            orientation: orientation,
        });
    }

    submitFleet() {
        if(this.fleetSubmitted) {
            alert("Cannot submit fleet twice");
            return;
        }
        this.initializeFleet(this.fleet);

        this.fleetSubmitted = true;
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
                break;
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

        this.currentTurn = message.currentTurn;
        this.lastTurnUpdateTimeStamp = message.timestamp;
        this.notifyStateChanged();
    }

    handleUpdateBoardTileStatusesNotificationMessage(
        message: UpdateBoardTileStatusesNotificationMessage,
    ) {
        if (!this.matchInProgress) return;

        for (const boardTileStatus of message.boardTileStatuses) {
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

        this.initialized = true;
        this.fleetSubmitted = false;
        this.dispatchEvent(
            new CustomEvent('allowed-ship-types-change', {
                detail: this.currentGameSettings.allowedShipTypes,
            }),
        );
        this.notifyStateChanged();
    }

    startNewMatch() {
        if (this.matchInProgress)
            throw new Error('cannot start new match when match is already in progress');
        this.initializeBoards();
        this.lastTurnUpdateTimeStamp = null;
        this.fleet = [];
        this.fleetSubmitted = false;
        this.matchWinner = null;
        this.rematchStatus = {
            [Player.Player1]: false,
            [Player.Player2]: false,
        };
        this.currentTurn = null;

        this.matchInProgress = true;

        this.notifyStateChanged();
    }

    endMatch(winner: Player) {
        if (!this.matchInProgress) throw new Error('cannot end match when no match is in progress');
        this.matchWinner = winner;
        this.matchInProgress = false;
        this.notifyStateChanged()
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
        this.fleetSubmitted = false;
        this.matchWinner = null;
        this.score = null;
        this.rematchStatus = null;

        this.initialized = false;
        this.matchInProgress = false;
        this.notifyStateChanged();
    }

    initializeBoards() {
        this.boards = {
            [Player.Player1]: new GameBoard(this.currentGameSettings!.boardSize),
            [Player.Player2]: new GameBoard(this.currentGameSettings!.boardSize),
        };
    }

    private notifyStateChanged() {
        this.dispatchEvent(new Event('state-change'));
    }
}
