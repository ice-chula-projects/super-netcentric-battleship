export enum ClientMessageType{
    Ping = "ping",
    RequestUserInfo = "requestUserInfo",
    UpdateUserInfo = "updateUserInfo",
    RequestActiveUsers = "requestActiveUsers",
    UpdateChatChannelSubscription = "updateChatChannelSubscription",
    SendToChat = "sendToChat",
    createLobby = "createLobby",
    joinLobby = "joinLobby",
    modifyGameSettings = "modifyGameSettings",
    startGame = "startGame",
    updateReadyState = "updateReadyState",
    requestPublicLobbies = "requestPublicLobbies"
}