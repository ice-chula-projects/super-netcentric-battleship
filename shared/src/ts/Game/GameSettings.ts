export default interface GameSettings{
    boardSize: number,
    maxFleetValue: number,
    
    //in seconds
    timeLimitPerTurn: number
}

export enum GameSettingsPresetNames{
    classic
}

export const GameSettingsPresets: Record<GameSettingsPresetNames, GameSettings> = {
    [GameSettingsPresetNames.classic]:{
        boardSize: 8,
        maxFleetValue: 4,
        timeLimitPerTurn: 10
    }
}