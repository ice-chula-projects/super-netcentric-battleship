export enum ClientMessageType{
    Ping = "ping",
    RequestUserInfo = "requestUserInfo",
    UpdateUserInfo = "updateUserInfo",
    RequestActiveUsers = "requestActiveUsers",
    UpdateChatChannelSubscription = "updateChatChannelSubscription",
    SendToChat = "sendToChat",
    CreateLobby = "createLobby",
    JoinLobby = "joinLobby",
    ModifyGameSettings = "modifyGameSettings",
    StartGame = "startGame",
    UpdateReadyState = "updateReadyState",
    RequestPublicLobbies = "requestPublicLobbies",
    FireVolleyAction = "fireVolleyAction",
    InitializeFleetAction = "InitializeFleetAction",
    UseAbilityAction = "useAbilityAction"
}