import { ShipType } from "./ShipDefinitions.js"

export default interface GameSettings{
    boardSize: number,
    maxFleetValue: number,
    
    //in seconds
    timeLimitPerTurn: number
    allowedShipTypes: ShipType[]
}

export enum GameSettingsPresetNames{
    Classic,
    SuperNetcentricBattleShipShipHooray
}

export const GameSettingsPresets: Record<GameSettingsPresetNames, GameSettings> = {
    [GameSettingsPresetNames.Classic]:{
        boardSize: 8,
        maxFleetValue: 4,
        timeLimitPerTurn: 10,
        allowedShipTypes: [ShipType.Standard]
    },
    [GameSettingsPresetNames.SuperNetcentricBattleShipShipHooray]:{
        boardSize: 16,
        maxFleetValue: 20,
        timeLimitPerTurn: 10,

        //all ship types expect for standard (0)
        allowedShipTypes: Object.values(ShipType).filter(x=>typeof x === "number").filter(x => x > 0)
    }
}