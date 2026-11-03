import { ActiveUsersInfoMessage } from "./User/ActiveUsersInfoMessage.js";
import { ChatMessageNotificationMessage } from "./Chat/ChatMessageNotificationMessage.js";
import { PongMessage } from "./PongMessage.js";
import { ServerErrorMessage } from "./ServerErrorMessage.js";
import { UpdateBoardTileStatusesNotificationMessage } from "./Game/UpdateBoardTileNotificationMessage.js";
import { UserInfoMessage } from "./User/UserInfoMessage.js";
import { CurrentTurnNotificationMessage } from "./Game/CurrentTurnNotificationMessage.js";
import { LobbyInfoNotificationMessage } from "./Game/Lobby/LobbyInfoNotificationMessage.js";
import { PublicLobbiesInfoMessage } from "./Game/Lobby/PublicLobbiesInfoMessage.js";
import { GameStartNotificationMessage } from "./Game/Lobby/GameStartNotificationMessage.js";
import { GameEndNotificationMessage } from "./Game/Lobby/GameEndNotificationMessage.js";

export * from "./ServerMessageType.js";
export * from "./PongMessage.js";
export * from "./User/UserInfoMessage.js";
export * from "./ServerErrorMessage.js";
export * from "./User/ActiveUsersInfoMessage.js";
export * from "./Chat/ChatMessageNotificationMessage.js";
export * from "./Game/UpdateBoardTileNotificationMessage.js";
export * from "./Game/CurrentTurnNotificationMessage.js";
export * from "./Game/Lobby/LobbyInfoNotificationMessage.js";
export * from "./Game/Lobby/PublicLobbiesInfoMessage.js"
export * from "./Game/Lobby/GameStartNotificationMessage.js";
export * from "./Game/Lobby/GameEndNotificationMessage.js";

export type ServerMessage = PongMessage |
UserInfoMessage |
ServerErrorMessage |
ActiveUsersInfoMessage |
ChatMessageNotificationMessage | 
UpdateBoardTileStatusesNotificationMessage |
CurrentTurnNotificationMessage |
LobbyInfoNotificationMessage | 
PublicLobbiesInfoMessage |
GameStartNotificationMessage |
GameEndNotificationMessage;