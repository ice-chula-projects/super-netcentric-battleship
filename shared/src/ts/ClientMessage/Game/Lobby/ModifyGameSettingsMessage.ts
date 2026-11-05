import GameSettings from "../../../Game/GameSettings.js";
import GameMessage from "../../../GameMessage.js";
import { ClientMessageType } from "../../ClientMessageType.js";

export interface ModifyGameSettingsMessage extends GameMessage{
    readonly type: ClientMessageType.ModifyGameSettings;

    settings: Partial<GameSettings>
}

export class ModifyGameSettingsMessageBuilder implements ModifyGameSettingsMessage{
    readonly type = ClientMessageType.ModifyGameSettings;
    readonly timestamp: number = Date.now();
    settings: Partial<GameSettings> = {};

    setSettings(settings: Partial<GameSettings>){
        this.settings = settings;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}