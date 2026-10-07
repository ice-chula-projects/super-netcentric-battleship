import WebSocket from "ws";

export default class User{
    socket: WebSocket;
    id: string;
    active: boolean = true;
    username: string;

    setUsername(username:string){
        this.username = username;
    }

    //TODO: random username system
    static generateRandomUsername(): string{
        return "guest";
    }

    constructor(socket: WebSocket, id: string){
        this.socket = socket;
        this.id = id;
        this.username = User.generateRandomUsername();

        this.socket.on("close", () => {this.active = false});
    }   
}