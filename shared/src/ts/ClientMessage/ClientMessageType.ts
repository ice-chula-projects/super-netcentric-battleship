export enum ClientMessageType{
    Ping = "ping",
    RequestUserInfo = "requestUserInfo",
    UpdateUserInfo = "updateUserInfo",
    RequestActiveUsers = "requestActiveUsers",
    UpdateChatChannelSubscription = "updateChatChannelSubscription",
    SendToChat = "sendToChat",
<<<<<<< HEAD
    SendGameAction = "sendGameAction",
    SendBoardSetup = "sendBoardSetup",
    JoinGame = "joinGame",
    Login = "login",
    Register = "register"
=======
    CreateLobby = "createLobby",
    JoinLobby = "joinLobby",
    ModifyGameSettings = "modifyGameSettings",
    StartGame = "startGame",
    UpdateReadyState = "updateReadyState",
    RequestPublicLobbies = "requestPublicLobbies",
    FireVolleyAction = "fireVolleyAction",
    InitializeFleetAction = "InitializeFleetAction",
    UseAbilityAction = "useAbilityAction"
>>>>>>> game-engine
}