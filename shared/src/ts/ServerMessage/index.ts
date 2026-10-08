import { ActiveUsersInfoMessage } from "./ActiveUsersInfoMessage.js";
import { ChatMessageNotificationMessage } from "./ChatMessageNotificationMessage.js";
import { PongMessage } from "./PongMessage.js";
import { ServerErrorMessage } from "./ServerErrorMessage.js";
import { UserInfoMessage } from "./UserInfoMessage.js";

export * from "./ServerMessageType.js";
export * from "./PongMessage.js";
export * from "./UserInfoMessage.js";
export * from "./ServerErrorMessage.js";
export * from "./ActiveUsersInfoMessage.js";
export * from "./ChatMessageNotificationMessage.js";

export type ServerMessage = PongMessage | UserInfoMessage | ServerErrorMessage | ActiveUsersInfoMessage | ChatMessageNotificationMessage;