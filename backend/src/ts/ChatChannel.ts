import ChatMessage from "./ChatMessage.js";
import User from "./User.js";

export default class ChatChannel{
    //TODO: configuration
    //number of messages before old messages start getting deleted
    static readonly MAX_MESSAGES = 100;
    
    readonly channelId: string;
    readonly chatMessages: ChatMessage[] = [];
    readonly subscribedUsers: User[] = [];

    constructor(channelId: string){
        this.channelId = channelId;
    }

    //adds a message and deletes an old message if the message array is too long
    addChatMessage(chatMessage: ChatMessage){
        this.chatMessages.push(chatMessage);
        if(this.chatMessages.length > ChatChannel.MAX_MESSAGES) this.chatMessages.shift();
    }

    subscribe(user: User){
        if(user.subscribedChatChannelIds.includes(this.channelId)) throw new Error("tried to subscribe a user who was already subscribed");
        user.subscribedChatChannelIds.push(this.channelId);
        this.subscribedUsers.push(user);
    }

    unsubscribe(user: User){
        if(user.subscribedChatChannelIds.indexOf(this.channelId) == -1) throw new Error("tried to unsubscribe a user who wasn't subscribed")
        user.subscribedChatChannelIds.splice(user.subscribedChatChannelIds.indexOf(this.channelId), 1);
        this.subscribedUsers.splice(this.subscribedUsers.indexOf(user), 1);
    }

    unsubscribeAllUsers(){
        for(const subscribedUser of this.subscribedUsers){
            const index = subscribedUser.subscribedChatChannelIds.indexOf(this.channelId);
            if(index != -1) subscribedUser.subscribedChatChannelIds.splice(index, 1);
        }

        this.subscribedUsers.splice(0,this.subscribedUsers.length);
    }
    
}