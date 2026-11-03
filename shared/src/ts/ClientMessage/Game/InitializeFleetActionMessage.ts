import Coordinate, { CoordinateFactory } from "../../Game/Coordinate.js";
import { Orientation } from "../../Game/Orientation.js";
import { ShipType } from "../../Game/ShipDefinitions.js";
import GameMessage from "../../GameMessage.js";
import { ClientMessageType } from "../ClientMessageType.js";

export interface ShipPlacement{
    location: Coordinate;
    orientation: Orientation;
    shipType: ShipType;
}

export interface InitializeFleetActionMessage extends GameMessage{
    readonly type: ClientMessageType.InitializeFleetAction;
    fleet: ShipPlacement[];
}

export class InitializeFleetActionMessageBuilder implements InitializeFleetActionMessage{
    readonly type = ClientMessageType.InitializeFleetAction;
    readonly timestamp: number = Date.now();

    fleet: ShipPlacement[] = [];

    setFleet(fleet: ShipPlacement[]){
        this.fleet = fleet;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}