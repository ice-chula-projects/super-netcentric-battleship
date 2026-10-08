import { ActiveUserInfoMessage } from "./ActiveUserInfoMessage.js";
import { PongMessage } from "./PongMessage.js";
import { ServerErrorMessage } from "./ServerErrorMessage.js";
import { UserInfoMessage } from "./UserInfoMessage.js";

export * from "./ServerMessageType.js";
export * from "./PongMessage.js";
export * from "./UserInfoMessage.js";
export * from "./ServerErrorMessage.js"
export * from "./ActiveUserInfoMessage.js"

export type ServerMessage = PongMessage | UserInfoMessage | ServerErrorMessage | ActiveUserInfoMessage;