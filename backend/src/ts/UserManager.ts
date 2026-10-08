import User from "./User.js";

//TODO: add database for persistent user info storage
export default class UserManager{
    private activeUsers: Record<string, User> = {};
    activeUserCount: number = 0;

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

    //TODO: link to database of all users, not just active ones
    getUser(userId: string): User | null {
        return this.activeUsers[userId];
    }

    userExists(userId: string): boolean {
        return this.getUser(userId) != null;
    }
}