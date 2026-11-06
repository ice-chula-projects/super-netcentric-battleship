import ChatMessage from "./ChatMessage.js";
import ActiveUser from "../User/ActiveUser.js";

export default class ChatChannel{
    //TODO: configuration
    //number of messages before old messages start getting deleted
    static readonly MAX_MESSAGES = 100;
    
    readonly channelId: string;
    readonly chatMessages: ChatMessage[] = [];
    readonly subscribedUsers: ActiveUser[] = [];

    constructor(channelId: string){
        this.channelId = channelId;
    }

    //adds a message and deletes an old message if the message array is too long
    addChatMessage(chatMessage: ChatMessage){
        this.chatMessages.push(chatMessage);
        if(this.chatMessages.length > ChatChannel.MAX_MESSAGES) this.chatMessages.shift();
    }

    subscribe(user: ActiveUser){
        if(user.subscribedChatChannels.includes(this)) throw new Error("tried to subscribe a user who was already subscribed");
        user.subscribedChatChannels.push(this);
        this.subscribedUsers.push(user);
    }

    unsubscribe(user: ActiveUser){
        if(user.subscribedChatChannels.indexOf(this) == -1) throw new Error("tried to unsubscribe a user who wasn't subscribed")
        user.subscribedChatChannels.splice(user.subscribedChatChannels.indexOf(this), 1);
        this.subscribedUsers.splice(this.subscribedUsers.indexOf(user), 1);
    }

    unsubscribeAllUsers(){
        for(const subscribedUser of this.subscribedUsers){
            const index = subscribedUser.subscribedChatChannels.indexOf(this);
            if(index != -1) subscribedUser.subscribedChatChannels.splice(index, 1);
        }

        this.subscribedUsers.splice(0,this.subscribedUsers.length);
    }
    
}