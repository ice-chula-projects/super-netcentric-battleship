import { BoardTileState } from "../../Game/BoardTileState.js";
import Coordinate from "../../Game/Coordinate.js";
import { Player } from "../../Game/Player.js";
import GameMessage from "../../GameMessage.js";
import { ServerMessageType } from "../ServerMessageType.js";

export type BoardTileStatus = {
    boardOwner: Player,
    state: BoardTileState,
    coordinate: Coordinate,
    health: number | null,
    maxHealth: number | null,
    shipId: number | null
}

export interface UpdateBoardTileStatusesNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.UpdateBoardTileStatusesNotification;
    boardTileStatuses: BoardTileStatus[]
}

export class UpdateBoardTileStatusesNotificationMessageBuilder implements UpdateBoardTileStatusesNotificationMessage{
    readonly type = ServerMessageType.UpdateBoardTileStatusesNotification;
    readonly timestamp: number = Date.now();

    boardTileStatuses: BoardTileStatus[] = [];
    
    addBoardTileStatus(boardTileStatus: BoardTileStatus){
        this.boardTileStatuses.push(boardTileStatus);
        return this;
    }

    setBoardTileStatuses(boardTileStatuses: BoardTileStatus[]){
        this.boardTileStatuses = boardTileStatuses;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}