import ActiveUser from "./ActiveUser.js";
import WebSocket from "ws";
import type { AuthPassword } from "../Authentication/types.js";
import Database from "../Database/Database.js";
import AuthenticationManager from "../Authentication/AuthenticationManager.js";
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserInfoMessage } from "@super-netcentric-battleship/shared/ClientMessage.js";
import { ServerMessage, UserInfoMessage, UserInfoMessageBuilder } from "@super-netcentric-battleship/shared/ServerMessage.js";
import ChatManager from "../Chat/ChatManager.js";

export interface DatabaseUser {
    id: string,
    username: string,
    password: AuthPassword,
    isAdmin: boolean
}

interface UserDatabase {
    users: Record<string, DatabaseUser>
}

export default class UserManager{
    //maps websocket ids to users
    private activeUsers: Record<string, ActiveUser> = {};
    private database: Database;
    private authenticationManager: AuthenticationManager;
    private chatManager: ChatManager;
    private userDatabase: UserDatabase | null = null;

    private get databaseLoaded(): boolean {
        return this.userDatabase != null;
    }
  
    private async loadDatabase(){
        this.userDatabase = await this.database.exists("userDatabase") ? (await this.database.get("userDatabase") as UserDatabase) : {users:{}};
    } 

    private async saveDatabase(){
        this.database.set("userDatabase", this.userDatabase);
    }

    activeUserCount: number = 0;
    constructor(database: Database, chatManager: ChatManager) {
        this.database = database;
        this.chatManager = chatManager;
        this.authenticationManager = new AuthenticationManager();

        this.loadDatabase();
    }
  
    registerWebSocket(socket: WebSocket, webSocketId: string): ActiveUser{
        if(this.activeUsers[webSocketId] != null) throw new Error("WebSocket already registered");
        
        const user = ActiveUser.createGuestAccount(socket, webSocketId)
        this.chatManager.subscribe(user, "global");
        this.activeUsers[webSocketId] = user;
        this.activeUserCount++;

        return user;
    }

    removeWebSocket(webSocketId: string){
        const user = this.activeUsers[webSocketId];
        if(user == null) throw new Error("tried to remove a websocket that doesn't exist");
        user.notifyDeletion();
        delete this.activeUsers[webSocketId];
        this.activeUserCount--;
    }
    
    private updateWebSocketUser(webSocketId: string, user: ActiveUser){
        const originalUser = this.activeUsers[webSocketId];
        if(originalUser == null) throw new Error("tried to update a websocket that doesn't exist");
        originalUser.notifyDeletion();

        this.chatManager.subscribe(user, "global");
        this.activeUsers[webSocketId] = user;
    }

    getActiveUsers(): ActiveUser[]{
        return Object.values(this.activeUsers);
    }

    getUserFromWebSocketId(webSocketId: string): ActiveUser {
        if(this.activeUsers[webSocketId] == null) throw new Error("User does not exist");
        return this.activeUsers[webSocketId];
    }

    async login(websocket: WebSocket, webSocketId: string, username: string, password: string): Promise<ServerMessage>{
        const user = await this.getDatabaseUserFromUsername(username);

        if(!(await this.authenticationManager.verifyPassword(password, user.password))) throw new Error("Incorrect password");

        const activeUser = ActiveUser.fromDatabaseUser(websocket, webSocketId, user)
        this.updateWebSocketUser(webSocketId, activeUser);

        return activeUser.toUserInfoMessage();
    }

    async registerAccount(websocket: WebSocket, webSocketId: string, username: string, password: string): Promise<ServerMessage>{
        if(await this.usernameExistsInDatabase(username)) throw new Error("Username already taken");

        const user: DatabaseUser = {
            username: username,
            password: await this.authenticationManager.hashPassword(password),
            id: uuidv4(),
            isAdmin: false
        }

        this.userDatabase!.users[user.id] = user;

        const activeUser = ActiveUser.fromDatabaseUser(websocket, webSocketId, user)
        this.updateWebSocketUser(webSocketId, activeUser);
        this.saveDatabase();

        return activeUser.toUserInfoMessage();
    }

    async updateUserInfo(webSocketId: string, message: UpdateUserInfoMessage): Promise<ServerMessage>{
        const user = this.getUserFromWebSocketId(webSocketId);
        const databaseUser = await this.getDatabaseUser(user.id);

        //this field also should garentees that the user exists in the database
        if(user.isGuest) throw new Error ("only registered user can update their profiles");

        if(message.username != null){
            const newUsername = message.username;
            if(await this.usernameExistsInDatabase(newUsername)) throw new Error("Username already taken");

            user.setUsername(newUsername);
            databaseUser.username = newUsername;
        }

        if(message.password != null){
            const newPassword = message.password;

            databaseUser.password = await this.authenticationManager.hashPassword(newPassword);
        }

        this.saveDatabase();

        return user.toUserInfoMessage();
    }

    async usernameExistsInDatabase(username: string): Promise<boolean>{
        const databaseUsers = Object.values(this.userDatabase!.users);

        for(const databaseUser of databaseUsers){
            if(databaseUser.username == username) return true;
        }

        return false;
    }

    async getDatabaseIdFromUsername(username: string): Promise<string>{
        if (!this.databaseLoaded) await this.loadDatabase();
        //this isnt scalable, but works for now
        const databaseUsers = Object.values(this.userDatabase!.users);

        for(const databaseUser of databaseUsers){
            if(databaseUser.username == username) return databaseUser.id;
        }

        throw new Error("Username does not exist");
    }

    async getDatabaseUserFromUsername(username:string): Promise<DatabaseUser>{
        return this.userDatabase!.users[await this.getDatabaseIdFromUsername(username)];
    }

    async getDatabaseUser(id: string): Promise<DatabaseUser>{
        if (!this.databaseLoaded) await this.loadDatabase();
        const user = this.userDatabase!.users[id];
        if (user == null) throw new Error("User does not exist");
        return user;
    }

    databaseUserToUserInfoMessage(databaseUser: DatabaseUser): UserInfoMessage{
        return new UserInfoMessageBuilder()
        .setId(databaseUser.id)
        .setSubscribedChatChannelIds(null)
        .setUsername(databaseUser.username)
        .setIsAdmin(databaseUser.isAdmin)
        .setIsGuest(false);
    }
}