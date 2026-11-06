import User from "../User/ActiveUser.js";

export default class ChatMessage{
    readonly message: string;
    readonly author: User;

    constructor(message: string, author: User){
        this.message = message;
        this.author = author;
    }
}