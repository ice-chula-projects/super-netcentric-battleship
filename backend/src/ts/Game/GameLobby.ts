import GameSettings, { GameSettingsPresetNames, GameSettingsPresets } from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import ActiveUser from "../User/ActiveUser.js";
import ChatManager from "../Chat/ChatManager.js";
import Game from "./Game.js";
import { GameEndNotificationMessageBuilder, GameStartNotificationMessageBuilder, LobbyExitNotificationMessageBuilder, LobbyInfoNotificationMessage, LobbyInfoNotificationMessageBuilder, LobbyPlayerInformation } from "@super-netcentric-battleship/shared/ServerMessage.js";
import { Player } from "@super-netcentric-battleship/shared/Game/Player.js";
import { ClientActionMessage } from "@super-netcentric-battleship/shared/ClientMessage.js";
import AIControlledGame from "./AI/AIControlledGame.js";
import GameLobbyManager from "./GameLobbyManager.js";

export interface LobbyMember{
    user: ActiveUser,
    ready: boolean
}

export enum GameType {
    Multiplayer,
    AI
}

export default class GameLobby{
    readonly lobbyManager: GameLobbyManager
    readonly id: string;
    readonly members: LobbyMember[] = [];
    readonly chatManager: ChatManager;
    readonly chatChannelId: string;
    
    hostUser: ActiveUser | null = null;
    isPublic: boolean = false;
    name: string = "Untitled Lobby";
    description: string = "";
    gameSettings: GameSettings;
    activeGame: Game | AIControlledGame |null = null;

    get isFull(): boolean{
        return this.members.length >= 2;
    }

    get isReady(): boolean{
        return this.members.every(x => x.ready);
    }

    get gameInProgress(): boolean{
        return this.activeGame != null;
    }

    get gameType(): GameType | null{
        if(!this.gameInProgress) return null;
        if(this.activeGame instanceof Game) return GameType.Multiplayer
        else return GameType.AI
    }

    get isAIGame(): boolean{
        return this.gameType == GameType.AI;
    }

    setPublic(isPublic: boolean){
        this.isPublic = isPublic;
    }

    setName(name: string){
        this.name = name;
    }

    setDescription(description: string){
        this.description = description;
    }

    constructor(lobbyManager: GameLobbyManager, id:string, chatManager: ChatManager, name: string, description: string, isPublic: boolean, gameSettingPreset: GameSettingsPresetNames){
        this.name = name;
        this.lobbyManager = lobbyManager;
        this.description = description;
        this.isPublic = isPublic;
        
        this.id = id;
        this.chatManager = chatManager;
        this.chatChannelId = chatManager.generateNewChannelId();
        this.chatManager.addChannel(this.chatChannelId);
        this.gameSettings = GameSettingsPresets[gameSettingPreset];
    }

    toLobbyInformationMessage(user: ActiveUser): LobbyInfoNotificationMessage{
        const connectedUsers: LobbyPlayerInformation[] = []

        for(const member of this.members){
            connectedUsers.push({
                userId: member.user.id,
                username: member.user.username,
                isHost: member.user.id == this.hostUser?.id,
                playerId: this.getPlayerIdFromMember(member),
                ready: member.ready
            })
        }
        
        return new LobbyInfoNotificationMessageBuilder()
        .setLobbyCode(this.id)
        .setName(this.name)
        .setDescription(this.description)
        .setIsPublic(this.isPublic)
        .setGameSettings(this.gameSettings)
        .setChatChannelId(this.chatChannelId)
        .setConnectedUsers(connectedUsers)
        .setIsHost(this.hostUser == user)
        .setIsReady(this.isReady);
    }

    addUser(user: ActiveUser){
        if(this.isFull) throw new Error("Attempted to add a user to a full lobby");
        this.members.push({
            user: user,
            ready: false
        });
        
        if(this.hostUser == null) this.hostUser = user;

        this.chatManager.subscribe(user, this.chatChannelId);
        user.setCurrentLobby(this);
        this.notifyLobbyInformation();
    }

    removeUser(user: ActiveUser){
        if(user.currentLobby != this) throw new Error("Attempted to remove a user who is not part of this lobby");

        if(this.gameInProgress){
            this.stopGame("a participating player left the lobby");
        }

        // remove user
        this.members.splice(this.members.indexOf(this.getMemberFromUser(user)), 1);   
        this.chatManager.unsubscribe(user, this.chatChannelId);
        user.setCurrentLobby(null);

        user.socket.send(new LobbyExitNotificationMessageBuilder().toJsonString());

        if(this.members.length <= 0){
            this.deleteLobby();
            return;
        }

        // migrate host if the user was the host
        if(user == this.hostUser){
            this.hostUser = this.members.length == 0? null : this.members[0].user;
        }

        this.notifyLobbyInformation();
    }

    updateReadyStatus(user: ActiveUser, ready: boolean){
        for(const member of this.members){
            if(member.user == user){
                member.ready = ready;
                this.notifyLobbyInformation();
                return;
            }
        }

        throw new Error("cannot update ready status for player in different lobby")
    }

    deleteLobby(){
        if(this.activeGame) this.stopGame("Lobby deleted");
        this.lobbyManager.notifyLobbyDeletion(this);

        for(const member of this.members){
            member.user.setCurrentLobby(null);
        }

        this.chatManager.removeChannel(this.chatChannelId);
    }

    notifyLobbyInformation(){
        for(const member of this.members){
            const message = this.toLobbyInformationMessage(member.user);
            member.user.socket.send(message.toJsonString());
        }
    }

    requestUpdateGameSettings(requester: ActiveUser, gameSettings: Partial<GameSettings>){
        if(requester != this.hostUser) throw new Error("Only the host can modify game settings");
        this.updateGameSettings(gameSettings);
    }

    updateGameSettings(gameSettings: Partial<GameSettings>){
        Object.assign(this.gameSettings, gameSettings);

        this.notifyLobbyInformation();
    }

    requestGameStart(requester: ActiveUser){
        if(requester != this.hostUser) throw new Error("Only the host can start the game");
        if(!this.isReady) throw new Error("Cannot start game lobby when all players arent ready");

        this.startGame();
    }

    requestAIGameStart(requester: ActiveUser){
        if(requester != this.hostUser) throw new Error("Only the host can start the game");

        this.startAIGame();
    }

    notifyClientActionMessage(clientActionMessage: ClientActionMessage, actingUser: ActiveUser){
        if(!this.gameInProgress) throw new Error("Cannot take actions while game is not in progress");
        this.activeGame?.takeAction(clientActionMessage, this.getPlayerIdFromUser(actingUser))
    }

    getMemberFromUser(user: ActiveUser): LobbyMember{
        for(const member of this.members){
            if(member.user == user) return member;
        }

        throw new Error("User not in lobby");
    }

    getPlayerIdFromUser(user: ActiveUser): Player{
        return this.getPlayerIdFromMember(this.getMemberFromUser(user));
    }

    getPlayerIdFromMember(member: LobbyMember): Player{
        //this is kinda ugly, if modified be sure to make it consistent with startGame()
        if(this.members[0] == member) return Player.Player1;
        if(this.members[1] == member) return Player.Player2;

        throw new Error(">2 Players is currently not supported")
    }

    startGame(){
        if(!this.isFull) throw new Error("Cannot start game when lobby is not full");
        if(this.gameInProgress) throw new Error("Cannot start a new game while game is already in progess");

        const player1User = this.members[0].user;
        const player2User = this.members[1].user;

        player1User.socket.send(new GameStartNotificationMessageBuilder().setPlayerId(Player.Player1).toJsonString());
        player2User.socket.send(new GameStartNotificationMessageBuilder().setPlayerId(Player.Player2).toJsonString());

        this.activeGame = new Game(this.gameSettings, player1User, player2User);
    }

    startAIGame(){
        if(this.members.length != 1) throw new Error("Cannot start AI game in lobby with more than 1 member");
        if(this.gameInProgress) throw new Error("Cannot start a new game while game is already in progess");

        const user = this.members[0].user;
        user.socket.send(new GameStartNotificationMessageBuilder().setPlayerId(Player.Player1).toJsonString());
        
        this.activeGame = new AIControlledGame(this.gameSettings, user);
    }
    
    stopGame(reason: string){
        if(!this.gameInProgress) throw new Error("Cannot stop game when none is in progress");

        this.activeGame!.terminateGame();
        const finalScore = this.activeGame!.score;
        this.activeGame = null;

        const message = new GameEndNotificationMessageBuilder()
        .setFinalScore(finalScore)
        .setReason(reason);

        const jsonString = message.toJsonString();
        for(const member of this.members){
            member.user.socket.send(jsonString);
            member.ready = false;
        }
    }
}