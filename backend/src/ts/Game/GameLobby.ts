import GameSettings, { GameSettingsPresetNames, GameSettingsPresets } from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import User from "../User/User.js";
import ChatManager from "../Chat/ChatManager.js";
import Game from "./Game.js";
import { LobbyInfoNotificationMessage, LobbyInfoNotificationMessageBuilder, LobbyPlayerInformation } from "@super-netcentric-battleship/shared/ServerMessage.js";
import { Player } from "@super-netcentric-battleship/shared/Game/Player.js";

export interface LobbyMember{
    user: User,
    ready: boolean
}

export default class GameLobby{
    readonly id: string;
    readonly hostId: string;
    readonly members: LobbyMember[] = [];
    readonly chatManager: ChatManager;
    readonly chatChannelId: string;

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

    constructor(hostUser: User, id:string, chatManager: ChatManager, name: string, description: string, isPublic: boolean){
        this.name = name;
        this.description = description;
        this.isPublic = isPublic;
        
        this.id = id;
        this.hostId = hostUser.id;
        this.chatManager = chatManager;
        this.chatChannelId = chatManager.generateNewChannelId();
        this.chatManager.addChannel(this.chatChannelId);
        this.gameSettings = GameSettingsPresets[GameSettingsPresetNames.classic];

        this.addUser(hostUser);
    }

    toLobbyInformationMessage(): LobbyInfoNotificationMessage{
        const connectedUsers: LobbyPlayerInformation[] = []

        for(const member of this.members){
            connectedUsers.push({
                userId: member.user.id,
                username: member.user.username,
                isHost: member.user.id == this.hostId,
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

        this.chatManager.subscribe(user, this.chatChannelId);
        user.setCurrentLobbyCode(this.id);
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
        if(requester.id != this.hostId) throw new Error("Only the host can modify game settings");
        this.updateGameSettings(gameSettings);
    }

    updateGameSettings(gameSettings: Partial<GameSettings>){
        Object.assign(this.gameSettings, gameSettings);

        this.notifyLobbyInformation();
    }

    requestGameStart(requester: User){
        if(requester.id != this.hostId) throw new Error("Only the host can start the game");
        if(!this.isReady) throw new Error("Cannot start game lobby when all players arent ready");

        this.startGame();
    }

    getmemberFromUser(user: User): LobbyMember{
        for(const member of this.members){
            if(member.user == user) return member;
        }

        throw new Error("User not in lobby");
    }

    getPlayerIdFromMember(member: LobbyMember): Player{
        //this is kinda ugly, if modified be sure to make it consistent with startGame()
        if(this.members[0] == member) return Player.Player1;
        if(this.members[1] == member) return Player.Player2;

        throw new Error(">2 Players is currently not supported")
    }

    startGame(){
        if(!this.isFull) throw new Error("Cannot start game when lobby is not full");
        
        this.activeGame = new Game(this.gameSettings,this.members[0].user, this.members[1].user);
    }
}