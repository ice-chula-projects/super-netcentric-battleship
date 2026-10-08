import GameMessage from "../GameMessage.js";
import { ClientMessageType } from "./ClientMessageType.js";

export interface UpdateChatChannelSubscriptionMessage extends GameMessage{
    readonly type: ClientMessageType.UpdateChatChannelSubscription;
    channelId: string;
    //true for subscribe to channel, false for unsubscribe from channel
    subscribe: boolean;
}

export class UpdateChatChannelSubscriptionMessageBuilder implements UpdateChatChannelSubscriptionMessage{
    readonly type = ClientMessageType.UpdateChatChannelSubscription;
    readonly timestamp: number = Date.now();
    channelId: string = "";
    subscribe: boolean = false;

    setChannelId(channelId: string){
        this.channelId = channelId;
        return this;
    }

    setSubscribe(subscribe: boolean){
        this.subscribe = subscribe;
        return this;
    }

    toJsonString(){
        return JSON.stringify(this);
    };
}