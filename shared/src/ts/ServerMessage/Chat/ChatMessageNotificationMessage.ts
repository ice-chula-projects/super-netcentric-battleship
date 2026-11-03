import GameMessage from "../../GameMessage.js";
import { ServerMessageType } from "../ServerMessageType.js";

export interface ChatMessageNotificationMessage extends GameMessage{
    readonly type: ServerMessageType.ChatMessageNotification;
    channelId: string;
    message: string;
    author: {username: string, id:string};
}

export class ChatMessageNotificationMessageBuilder implements ChatMessageNotificationMessage{
    readonly type = ServerMessageType.ChatMessageNotification;
    readonly timestamp: number = Date.now();
    channelId: string = "";
    message: string = "";
    author: { username: string; id: string; } = {username: "", id: ""};

    setChannelId(channelId: string){
        this.channelId = channelId;
        return this;
    }

    setMessage(message: string){
        this.message = message;
        return this;
    }

    setAuthor(author: typeof this.author){
        this.author = author;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}