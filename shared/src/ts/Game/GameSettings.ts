export default interface GameSettings{
    boardSize: number,
    maxFleetValue: number
}

export enum GameSettingsPresetNames{
    classic
}

export const GameSettingsPresets: Record<GameSettingsPresetNames, GameSettings> = {
    [GameSettingsPresetNames.classic]:{
        boardSize: 8,
        maxFleetValue: 4
    }
}