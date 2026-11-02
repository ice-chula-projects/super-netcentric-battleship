import GameSettings, { GameSettingsPresetNames, GameSettingsPresets } from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import User from "../User/User.js";
import ChatManager from "../Chat/ChatManager.js";
import Game from "./Game.js";

export default class GameLobby{
    isPublic: boolean = false;
    name: string = "Untitled Lobby";
    description: string = "";
    gameSettings: GameSettings;
    activeGame: Game | null = null;

    readonly id: string;
    readonly hostId: string;
    readonly players: User[] = [];
    readonly chatManager: ChatManager;
    readonly chatChannelId: string;

    get isFull(): boolean{
        return this.players.length >= 2;
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

    constructor(hostUser: User, id:string, chatManager: ChatManager){
        this.id = id;
        this.hostId = hostUser.id;
        this.chatManager = chatManager;
        this.chatChannelId = chatManager.generateNewChannelId();
        this.chatManager.addChannel(this.chatChannelId);
        this.gameSettings = GameSettingsPresets[GameSettingsPresetNames.classic];

        this.addUser(hostUser);
    }

    addUser(user: User){
        if(this.isFull) throw new Error("Attempted to add a user to a full lobby");
        this.players.push(user);
        this.chatManager.subscribe(user, this.chatChannelId);
        user.setCurrentlyInGameLobby(true);
    }

    deleteLobby(){
        for(const user of this.players){
            user.setCurrentlyInGameLobby(false);
        }

        this.players.splice(0,this.players.length);
        this.chatManager.removeChannel(this.chatChannelId);
    }

    startGame(){
        if(!this.isFull) throw new Error("Cannot start game when lobby is not full");

        this.activeGame = new Game(this.gameSettings,this.players[0], this.players[1]);
    }
}