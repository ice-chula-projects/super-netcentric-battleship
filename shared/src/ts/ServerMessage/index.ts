import { ActiveUsersInfoMessage } from "./User/ActiveUsersInfoMessage.js";
import { ChatMessageNotificationMessage } from "./Chat/ChatMessageNotificationMessage.js";
import { PongMessage } from "./PongMessage.js";
import { ServerErrorMessage } from "./ServerErrorMessage.js";
import { UpdateBoardTileStatusesNotificationMessage } from "./Game/UpdateBoardTileNotification.js";
import { UserInfoMessage } from "./User/UserInfoMessage.js";

export * from "./ServerMessageType.js";
export * from "./PongMessage.js";
export * from "./User/UserInfoMessage.js";
export * from "./ServerErrorMessage.js";
export * from "./User/ActiveUsersInfoMessage.js";
export * from "./Chat/ChatMessageNotificationMessage.js";
export * from "./Game/UpdateBoardTileNotification.js"

export type ServerMessage = PongMessage |
UserInfoMessage |
ServerErrorMessage |
ActiveUsersInfoMessage |
ChatMessageNotificationMessage | 
UpdateBoardTileStatusesNotificationMessage;