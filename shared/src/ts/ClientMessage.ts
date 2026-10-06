export enum ClientMessageType{
    Ping = "ping"
}

export default interface ClientMessage{
    type: ClientMessageType;
}