export enum ClientMessageType{
    Ping = "ping",
    RequestUserInfo = "requestUserInfo",
    UpdateUserInfo = "updateUserInfo",
    RequestActiveUsers = "requestActiveUsers",
    UpdateChatChannelSubscription = "updateChatChannelSubscription",
    SendToChat = "sendToChat",
    SendGameAction = "sendGameAction",
    SendBoardSetup = "sendBoardSetup",
    JoinGame = "joinGame",
    Login = "login",
    Register = "register"
}