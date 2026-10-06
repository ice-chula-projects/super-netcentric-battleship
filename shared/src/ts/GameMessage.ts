export enum GameMessageType{
    PingRequest = "ping",
    PingResponse = "pong"
}

export default interface GameMessage{
    type: GameMessageType;
}