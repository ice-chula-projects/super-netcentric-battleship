import Coordinate, { CoordinateFactory } from "../../Game/Coordinate.js";
import GameMessage from "../../GameMessage.js";
import { ClientMessageType } from "../ClientMessageType.js";

export interface FireVolleyActionMessage extends GameMessage{
    readonly type: ClientMessageType.FireVolleyAction;

    originatingShipId: number;
    targetCoordinates: Coordinate;
}

export class FireVolleyActionMessageBuilder implements FireVolleyActionMessage{
    readonly type = ClientMessageType.FireVolleyAction;
    readonly timestamp: number = Date.now();

    originatingShipId: number = 0;
    targetCoordinates: Coordinate = CoordinateFactory.createCoordinate(0,0);

    setOriginatingShipId(originatingShipId: number){
        this.originatingShipId = originatingShipId;
        return this;
    };

    setTargetCoordinates(targetCoordinates: Coordinate){
        this.targetCoordinates = targetCoordinates;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}