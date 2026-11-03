import { ChatMessageNotificationMessageBuilder } from "@super-netcentric-battleship/shared/ServerMessage.js";
import ChatChannel from "./ChatChannel.js";
import ChatMessage from "./ChatMessage.js";
import User from "../User/User.js";
import { v4 as uuidv4 } from 'uuid';

export default class ChatManager {
    readonly channels: Record<string, ChatChannel> = {};


    generateNewChannelId(): string {
        const existngChannelIds = Object.keys(this.channels);
        while (true) {
            const channelId = uuidv4();
            if (existngChannelIds.includes(channelId)) continue;
            return channelId;
        }
    }

    addChannel(channelId: string){
        if(this.channelExists(channelId)) throw new Error("Tried to add a channel with duplicate Id");

        const channel = new ChatChannel(channelId);
        this.channels[channelId] = channel;
    }

    removeChannel(channelId: string){
        if(!this.channelExists(channelId)) throw new Error("Tried to remove a channel that doesn't exist");
        const channel = this.channels[channelId];
        channel.unsubscribeAllUsers();
        delete this.channels[channelId];
    }

    channelExists(channelId: string): boolean{
        return this.channels[channelId] != null;
    }

    sendMessage(message: string, author: User, channelId: string) {
        const channel = this.channels[channelId];
        if(channel == null) throw new Error("Tried to send a message to a non existant channel");

        const chatMessage = new ChatMessage(message, author);
        channel.addChatMessage(chatMessage);

        const notificationMessage = new ChatMessageNotificationMessageBuilder()
            .setChannelId(channelId)
            .setAuthor({username: chatMessage.author.username, id: chatMessage.author.id})
            .setMessage(chatMessage.message)
        const notificationMessageJsonString = notificationMessage.toJsonString();
        
        for (const subscribedUser of channel.subscribedUsers) {
            if (subscribedUser == chatMessage.author) continue;
            subscribedUser.socket.send(notificationMessageJsonString);
        }
    }

    subscribe(user: User, channelId: string){
        const channel = this.channels[channelId];
        if(channel == null) throw new Error("Tried to subscribe to a channel that doesn't exist");

        channel.subscribe(user);
    }

    unsubscribe(user: User, channelId: string){
        const channel = this.channels[channelId];
        if(channel == null) throw new Error("Tried to subscribe to a channel that doesn't exist");

        channel.unsubscribe(user);
    }
}