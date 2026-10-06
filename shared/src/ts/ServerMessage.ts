export enum ServerMessageType{
    Pong = "pong"
}

export default interface ServerMessage{
    type: ServerMessageType;
}