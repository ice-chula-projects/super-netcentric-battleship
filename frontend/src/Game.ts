import { GameStates } from "@super-netcentric-battleship/shared/ServerMessage.js";
import GameBoard from "./Board";

export enum Player{
    player = "player",
    enemy = "enemy"
}
export class Game{
    active: boolean = false;
    webSocket: WebSocket;
    state: GameStates
    boards:{
        [Player.player]: GameBoard,
        [Player.enemy]: GameBoard
    } = {
        [Player.player]: null,
        [Player.enemy]: null
    }

    constructor(webSocket){
        this.webSocket = webSocket;
    }
}