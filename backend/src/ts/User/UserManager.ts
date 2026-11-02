import User from "./User.js";
import { Database } from "../Database/Database.js";
import type { AuthUser } from "../Authentication/types.js";

//TODO: add database for persistent user info storage
export default class UserManager{
    private activeUsers: Record<string, User> = {};
    private database: Database;
  
    activeUserCount: number = 0;

    constructor(database: Database) {
        this.database = database;
    }
  
    registerActiveUser(user: User){
        if(this.activeUsers[user.id] != null) throw new Error("tried to register an existing user");
        this.activeUsers[user.id] = user;
        this.activeUserCount++;
    }

    removeActiveUser(user: User){
        if(this.activeUsers[user.id] == null) throw new Error("tried to remove a user that doesn't exist");
        delete this.activeUsers[user.id];
        this.activeUserCount--;
    }

    getActiveUsers(): User[]{
        return Object.values(this.activeUsers);
    }

    // Websocket user records
    getUser(userId: string): User | null {
        return this.activeUsers[userId];
    }

    userExists(userId: string): boolean {
        return this.getUser(userId) != null;
    }

    // Auth/Database account Users
    async getAccount(accountId: string): Promise<AuthUser> {
        return this.database.getUserFromUuid(accountId);
    }

    async getAccountFromName(username: string): Promise<AuthUser> {
        return this.database.getUserFromName(username);
    }
}