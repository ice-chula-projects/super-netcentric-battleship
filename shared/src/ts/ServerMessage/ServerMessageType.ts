export enum ServerMessageType{
    Pong = "pong",
    UserInfo = "userInfo",   
    Error = "error",
    ActiveUsersInfo = "activeUsersInfo",
    ChatMessageNotification = "chatMessageNotification",
    UpdateBoardTileStatusesNotification = "updateBoardTileStatusesNotification",
    LobbyInfoNotification = "lobbyInfoNotification",
    CurrentTurnNotification = "currentTurnNotification",
    PublicLobbiesInfo = "publicLobbiesInfo",
    GameStartNotification = "gameStartNotification",
    GameEndNotification = "gameEndNotification",
    MatchCompleteNotification = "matchCompleteNotification",
    RematchStatusNotification = "rematchStatusNotification",
    MatchStartNotification = "matchStartNotification"
}