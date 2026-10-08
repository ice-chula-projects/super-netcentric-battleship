import GameMessage from "../GameMessage.js";
import { ServerMessageType } from "./ServerMessageType.js";

export interface GameStateNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.GameStateNotification;
    gameId: string | null;
    chatChannelId: string | null;
    gameState: GameStates
    currentTurn: {username: string, id: string} | null;
}

//TODO: somehow reuse this with the one defined in the backend so that we don't have a duplicate
export enum GameStates{
    Forming = "forming",
    Deploying = "deploying",
    Fighting = "fighting",
    Finished = "finished"
}

export class GameStateNotificationMessageBuilder implements GameStateNotificationMessage{
    readonly type = ServerMessageType.GameStateNotification;
    readonly timestamp: number = Date.now();
    currentTurn: { username: string; id: string; } | null = null;
    gameId: string | null = null;
    chatChannelId: string | null = null;
    gameState: GameStates = GameStates.Forming;

    setCurrentTurn(currentTurn: typeof this.currentTurn){
        this.currentTurn = currentTurn;
        return this;
    }

    setGameId(gameId: string){
        this.gameId = gameId;
        return this;
    }

    setChatChannelId(chatChannelId: string){
        this.chatChannelId = chatChannelId;
        return this;
    }

    setGameState(gameState: GameStates){
        this.gameState = gameState;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}