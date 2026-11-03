export enum ServerMessageType{
    Pong = "pong",
    UserInfo = "userInfo",   
    Error = "error",
    ActiveUsersInfo = "activeUsersInfo",
    ChatMessageNotification = "chatMessageNotification",
    UpdateBoardTileStatusesNotification = "updateBoardTileStatusesNotification",
    LobbyInformationNotification = "lobbyInformationNotification",
    CurrentTurnNotification = "currentTurnNotification"
}