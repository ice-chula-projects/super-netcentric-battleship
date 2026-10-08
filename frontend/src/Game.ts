import { GameStates } from "@super-netcentric-battleship/shared/ServerMessage.js";
import GameBoard from "./Board";

export class Game{
    active: boolean = false;
    webSocket: WebSocket;
    state: GameStates
    boards:{
        player: GameBoard,
        enemy: GameBoard
    } = {
        player: null,
        enemy: null
    }

    constructor(webSocket){
        this.webSocket = webSocket;
    }
}