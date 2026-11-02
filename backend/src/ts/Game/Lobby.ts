import GameSettings, { GameSettingsPresetNames, GameSettingsPresets } from "@super-netcentric-battleship/shared/Game/GameSettings.js";
import User from "../User/User.js";

export default class Lobby{
    isPublic: boolean = false;
    name: string = "Untitled Lobby";
    description: string = "";
    gameSettings: GameSettings;

    readonly id: string;
    readonly hostId: string;
    readonly players: User[] = [];

    get isFull(): boolean{
        return this.players.length >= 2;
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

    constructor(hostUser: User, id:string){
        this.id = id;
        this.hostId = hostUser.id;
        this.players.push(hostUser);
        this.gameSettings = GameSettingsPresets[GameSettingsPresetNames.classic];
    }
}