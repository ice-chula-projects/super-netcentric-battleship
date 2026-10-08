import GameMessage from "../GameMessage.js";
import { ClientMessageType } from "./ClientMessageType.js";

export interface SendBoardSetupMessage extends GameMessage{
    readonly type: ClientMessageType.SendBoardSetup;
    x: number;
    y: number;
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
    x: number = 0;
    y: number = 0;
    ships: Ship[] = []; 
    setX(x: number){
        this.x = x;
        return this;
    }

    setY(y: number){
        this.y = y;
        return this;
    }

    setShips(ships: Ship[]){
        this.ships = ships;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}