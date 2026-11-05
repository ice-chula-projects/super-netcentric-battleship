import GameSettings, { GameSettingsPresetNames, GameSettingsPresets } from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import User from "../User/User.js";
import ChatManager from "../Chat/ChatManager.js";
import Game from "./Game.js";
import { GameEndNotificationMessageBuilder, GameStartNotificationMessageBuilder, LobbyExitNotificationMessageBuilder, LobbyInfoNotificationMessage, LobbyInfoNotificationMessageBuilder, LobbyPlayerInformation } from "@super-netcentric-battleship/shared/ServerMessage.js";
import { Player } from "@super-netcentric-battleship/shared/Game/Player.js";
import { ClientActionMessage } from "@super-netcentric-battleship/shared/ClientMessage.js";

export interface LobbyMember{
    user: User,
    ready: boolean
}

export default class GameLobby{
    readonly id: string;
    readonly members: LobbyMember[] = [];
    readonly chatManager: ChatManager;
    readonly chatChannelId: string;
    
    hostUser: User | null = null;
    isPublic: boolean = false;
    name: string = "Untitled Lobby";
    description: string = "";
    gameSettings: GameSettings;
    activeGame: Game | null = null;

    get isFull(): boolean{
        return this.members.length >= 2;
    }

    get isReady(): boolean{
        return this.members.every(x => x.ready);
    }

    get gameInProgress(): boolean{
        return this.activeGame != null;
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

    constructor(id:string, chatManager: ChatManager, name: string, description: string, isPublic: boolean){
        this.name = name;
        this.description = description;
        this.isPublic = isPublic;
        
        this.id = id;
        this.chatManager = chatManager;
        this.chatChannelId = chatManager.generateNewChannelId();
        this.chatManager.addChannel(this.chatChannelId);
        this.gameSettings = GameSettingsPresets[GameSettingsPresetNames.classic];
    }

    toLobbyInformationMessage(): LobbyInfoNotificationMessage{
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
        .setConnectedUsers(connectedUsers);
    }

    addUser(user: User){
        if(this.isFull) throw new Error("Attempted to add a user to a full lobby");
        this.members.push({
            user: user,
            ready: false
        });
        
        if(this.hostUser == null) this.hostUser = user;

        this.chatManager.subscribe(user, this.chatChannelId);
        user.setCurrentLobbyCode(this.id);
        this.notifyLobbyInformation();
    }

    removeUser(user: User){
        if(user.currentLobbyCode != this.id) throw new Error("Attempted to remove a user who is not part of this lobby");

        if(this.gameInProgress){
            this.stopGame();
        }

        // remove user
        this.members.splice(this.members.indexOf(this.getMemberFromUser(user)), 1);   
        user.setCurrentLobbyCode(null);

        user.socket.send(new LobbyExitNotificationMessageBuilder().toJsonString());

        // migrate host if the user was the host
        if(user == this.hostUser){
            this.hostUser = this.members.length == 0? null : this.members[0].user;
        }

        this.notifyLobbyInformation();
    }

    updateReadyStatus(user: User, ready: boolean){
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

        if(this.activeGame) this.stopGame();

        for(const member of this.members){
            member.user.setCurrentLobbyCode(null);
        }

        this.chatManager.removeChannel(this.chatChannelId);
    }

    notifyLobbyInformation(){
        const message = this.toLobbyInformationMessage();
        const jsonString = message.toJsonString();
        for(const member of this.members){
            member.user.socket.send(jsonString);
        }
    }

    requestUpdateGameSettings(requester: User, gameSettings: Partial<GameSettings>){
        if(requester != this.hostUser) throw new Error("Only the host can modify game settings");
        this.updateGameSettings(gameSettings);
    }

    updateGameSettings(gameSettings: Partial<GameSettings>){
        Object.assign(this.gameSettings, gameSettings);

        this.notifyLobbyInformation();
    }

    requestGameStart(requester: User){
        if(requester != this.hostUser) throw new Error("Only the host can start the game");
        if(!this.isReady) throw new Error("Cannot start game lobby when all players arent ready");

        this.startGame();
    }

    notifyClientActionMessage(clientActionMessage: ClientActionMessage, actingUser: User){
        if(!this.gameInProgress) throw new Error("Cannot take actions while game is not in progress");
        this.activeGame?.takeAction(clientActionMessage, this.getPlayerIdFromUser(actingUser))
    }

    getMemberFromUser(user: User): LobbyMember{
        for(const member of this.members){
            if(member.user == user) return member;
        }

        throw new Error("User not in lobby");
    }

    getPlayerIdFromUser(user: User): Player{
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
    
    stopGame(){
        if(!this.gameInProgress) throw new Error("Cannot stop game when none is in progress");

        const message = new GameEndNotificationMessageBuilder();
        const jsonString = message.toJsonString();
        for(const members of this.members){
            members.user.socket.send(jsonString);
        }
        this.activeGame = null;
    }
}