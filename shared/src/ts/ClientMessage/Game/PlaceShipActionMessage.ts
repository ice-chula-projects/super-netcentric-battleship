import Coordinate, { CoordinateFactory } from "../../Game/Coordinate.js";
import { Orientation } from "../../Game/Orientation.js";
import { ShipType } from "../../Game/ShipDefinitions.js";
import GameMessage from "../../GameMessage.js";
import { ClientMessageType } from "../ClientMessageType.js";

export interface PlaceShipActionMessage extends GameMessage{
    readonly type: ClientMessageType.PlaceShipAction;

    location: Coordinate;
    orientation: Orientation;
    shipType: ShipType;
}

export class PlaceShipActionMessageBuilder implements PlaceShipActionMessage{
    readonly type = ClientMessageType.PlaceShipAction;
    readonly timestamp: number = Date.now();

    location: Coordinate = CoordinateFactory.createCoordinate(0,0);
    orientation: Orientation = Orientation.Right;
    shipType: ShipType = ShipType.Standard;

    setLocation(location: Coordinate){
        this.location = location;
        return this;
    }

    setOrientation(orientation: Orientation){
        this.orientation = orientation;
        return this;
    }

    setShipType(shipType: ShipType){
        this.shipType = shipType;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}