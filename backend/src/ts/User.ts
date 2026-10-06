import WebSocket from "ws";

export default class User{
    socket: WebSocket;
    id: string;
    active: boolean = true;

    constructor(socket: WebSocket, id: string){
        this.socket = socket;
        this.id = id;

        this.socket.on("close", () => {this.active = false});
    }   
}