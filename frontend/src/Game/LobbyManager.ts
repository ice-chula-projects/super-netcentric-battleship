<<<<<<< HEAD
import {
    CreateLobbyMessageBuilder,
    ExitLobbyMessageBuilder,
    JoinLobbyMessageBuilder,
    ModifyGameSettingsMessageBuilder,
    RequestPublicLobbiesMessageBuilder,
    StartGameMessageBuilder,
    UpdateReadyStateMessageBuilder,
} from '@super-netcentric-battleship/shared/ClientMessage.js';
import GameSettings from '@super-netcentric-battleship/shared/Game/GameSettings.js';
import {
    GameEndNotificationMessage,
    GameStartNotificationMessage,
    LobbyExitNotificationMessage,
    LobbyInfoNotificationMessage,
    LobbyPlayerInformation,
    PublicLobbiesInfoMessage,
    PublicLobbyInformation,
    ServerMessage,
    ServerMessageType,
} from '@super-netcentric-battleship/shared/ServerMessage.js';
import { GameManager } from './GameManager';
=======
import { CreateLobbyMessageBuilder, JoinLobbyMessageBuilder, ModifyGameSettingsMessageBuilder, RequestPublicLobbiesMessageBuilder, StartGameMessageBuilder, UpdateReadyStateMessageBuilder } from "@super-netcentric-battleship/shared/ClientMessage.js";
import GameSettings from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import { GameEndNotificationMessage, GameStartNotificationMessage, LobbyInfoNotificationMessage, LobbyPlayerInformation, PublicLobbiesInfoMessage, PublicLobbyInformation, ServerMessage, ServerMessageType } from "@super-netcentric-battleship/shared/ServerMessage.js";
import { GameManager } from "./GameManager";
>>>>>>> 0d1f8ef (Connected Lobby System)

export class LobbyManager extends EventTarget {
    readonly webSocket: WebSocket;
    readonly gameManager: GameManager;

    currentLobbyInfo: {
<<<<<<< HEAD
        lobbyCode: string;
        name: string;
        description: string;
        isPublic: boolean;
        gameSettings: GameSettings;
        chatChannelId: string;
        connectedUsers: LobbyPlayerInformation[];
    } | null = null;
=======
        lobbyCode: string
        name: string,
        description: string,
        isPublic: boolean,
        gameSettings: GameSettings,
        chatChannelId: string,
        connectedUsers: LobbyPlayerInformation[];
    } | null = null
>>>>>>> 0d1f8ef (Connected Lobby System)

    publicLobbies: PublicLobbyInformation[] = [];
    currentPublicLobbyPage: number = 0;
    lobbiesPerPage: number = 0;
    totalPublicLobbies: number = 0;

    get totalPages(): number {
        return Math.ceil(this.totalPublicLobbies / this.lobbiesPerPage);
    }

    get currentlyInLobby(): boolean {
        return this.currentLobbyInfo != null;
    }

    constructor(webSocket: WebSocket, gameManager: GameManager) {
<<<<<<< HEAD
        super();
=======
        super()
>>>>>>> 0d1f8ef (Connected Lobby System)
        this.webSocket = webSocket;
        this.gameManager = gameManager;

        this.webSocket.addEventListener('message', this.handleServerMessage.bind(this));
    }

    createLobby(name: string, description: string, isPublic: boolean = true) {
        const message = new CreateLobbyMessageBuilder()
            .setName(name)
            .setDescription(description)
            .setIsPublic(isPublic);

        this.webSocket.send(message.toJsonString());
    }

    joinLobby(lobbyCode: string) {
        const message = new JoinLobbyMessageBuilder().setLobbyCode(lobbyCode);

        this.webSocket.send(message.toJsonString());
    }

    exitLobby() {
        const message = new ExitLobbyMessageBuilder();
        this.webSocket.send(message.toJsonString());
    }

    modifyGameSettings(settings: Partial<GameSettings>) {
        const message = new ModifyGameSettingsMessageBuilder().setSettings(settings);

        this.webSocket.send(message.toJsonString());
    }

    requestPublicLobbies(page: number, lobbiesPerPage: number | null = null) {
        const message = new RequestPublicLobbiesMessageBuilder()
            .setPage(page)
            .setLobbiesPerPage(lobbiesPerPage);

        this.webSocket.send(message.toJsonString());
    }

    updateReadyState(ready: boolean) {
        const message = new UpdateReadyStateMessageBuilder().setReady(ready);

        this.webSocket.send(message.toJsonString());
    }

    startGame() {
        const message = new StartGameMessageBuilder();

        this.webSocket.send(message.toJsonString());
    }

    handleServerMessage(message: MessageEvent) {
        const serverMessage = JSON.parse(message.data) as ServerMessage;

        switch (serverMessage.type) {
            case ServerMessageType.LobbyInfoNotification:
                this.handleLobbyInfoNotificationMessage(serverMessage);
                break;
            case ServerMessageType.PublicLobbiesInfo:
                this.handlePublicLobbiesInfoMessage(serverMessage);
                break;
            case ServerMessageType.GameStartNotification:
                this.handleGameStartNotificationMessage(serverMessage);
                break;
            case ServerMessageType.GameEndNotification:
                this.handleGameEndNotificationMessage(serverMessage);
                break;
            case ServerMessageType.LobbyExitNotification:
                this.handleLobbyExitNotificationMessage(serverMessage);
                break;
        }
    }

    //TODO: insert logic that would update HTML from these
    handleLobbyInfoNotificationMessage(lobbyInfoNotificationMessage: LobbyInfoNotificationMessage) {
        this.currentLobbyInfo = {
<<<<<<< HEAD
            lobbyCode: lobbyInfoNotificationMessage.lobbyCode,
            name: lobbyInfoNotificationMessage.name,
            description: lobbyInfoNotificationMessage.description,
            isPublic: lobbyInfoNotificationMessage.isPublic,
            gameSettings: lobbyInfoNotificationMessage.gameSettings,
            chatChannelId: lobbyInfoNotificationMessage.chatChannelId,
            connectedUsers: lobbyInfoNotificationMessage.connectedUsers,
=======
          lobbyCode: lobbyInfoNotificationMessage.lobbyCode,
          name: lobbyInfoNotificationMessage.name,
          description: lobbyInfoNotificationMessage.description,
          isPublic: lobbyInfoNotificationMessage.isPublic,
          gameSettings: lobbyInfoNotificationMessage.gameSettings,
          chatChannelId: lobbyInfoNotificationMessage.chatChannelId,
          connectedUsers: lobbyInfoNotificationMessage.connectedUsers
>>>>>>> 0d1f8ef (Connected Lobby System)
        };
        this.notifyStateChanged();
    }

    handlePublicLobbiesInfoMessage(publicLobbiesInfoMessage: PublicLobbiesInfoMessage) {
        this.publicLobbies = publicLobbiesInfoMessage.lobbies;
        this.currentPublicLobbyPage = publicLobbiesInfoMessage.page;
        this.lobbiesPerPage = publicLobbiesInfoMessage.lobbiesPerPage;
        this.totalPublicLobbies = publicLobbiesInfoMessage.totalLobbies;
        this.notifyStateChanged();
    }

<<<<<<< HEAD
    handleGameStartNotificationMessage(gameStartNotificationMessage: GameStartNotificationMessage) {
        this.gameManager.initializeGame(
            this.currentLobbyInfo!.gameSettings,
            gameStartNotificationMessage.playerId,
        );
    }

    handleGameEndNotificationMessage(gameEndNotificationMessage: GameEndNotificationMessage) {
        this.gameManager.unInitializeGame();
        alert(gameEndNotificationMessage.reason);
=======
    handleGameStartNotificationMessage(gameStartNotificationMessage: GameStartNotificationMessage){
        this.gameManager.startGame(this.currentLobbyInfo!.gameSettings, gameStartNotificationMessage.playerId);
        this.notifyStateChanged();
    }

    handleGameEndNotificationMessage(gameEndNotificationMessage: GameEndNotificationMessage){
        this.gameManager.stopGame();
        this.notifyStateChanged();
    }

    private notifyStateChanged() {
        this.dispatchEvent(new Event("state-change"));
>>>>>>> 0d1f8ef (Connected Lobby System)
    }

    handleLobbyExitNotificationMessage(_message: LobbyExitNotificationMessage) {
        this.currentLobbyInfo = null;
        this.notifyStateChanged();
    }

    private notifyStateChanged() {
        this.dispatchEvent(new Event('state-change'));
    }
}
