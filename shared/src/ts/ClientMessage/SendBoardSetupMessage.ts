import GameMessage from "../GameMessage.js";
import { ClientMessageType } from "./ClientMessageType.js";

export interface SendBoardSetupMessage extends GameMessage{
    readonly type: ClientMessageType.SendBoardSetup;
    ships: Ship[];
}

export class Ship {
    x: number = 0;
    y: number = 0;
    orientation: "down" | "right" = "down";

    constructor(x: number, y:number, orientation: "down" | "right"){
        this.x = x;
        this.y = y;
        this.orientation = orientation;
    }
}

export class SendBoardSetupMessageBuilder implements SendBoardSetupMessage{
    readonly type = ClientMessageType.SendBoardSetup;
    readonly timestamp: number = Date.now();
    ships: Ship[] = []; 

    setShips(ships: Ship[]){
        this.ships = ships;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}