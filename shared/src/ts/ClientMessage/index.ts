import { PingMessage } from "./PingMessage.js";
import { RequestActiveUsersMessage } from "./RequestActiveUsersMessage.js";
import { RequestUserInfoMessage } from "./RequestUserInfoMessage.js";
import { UpdateUserInfoMessage } from "./UpdateUserInfoMessage.js";

export * from "./ClientMessageType.js";
export * from "./PingMessage.js";
export * from "./RequestUserInfoMessage.js"
export * from "./UpdateUserInfoMessage.js"
export * from "./RequestActiveUsersMessage.js"

export type ClientMessage = PingMessage | RequestUserInfoMessage | UpdateUserInfoMessage | RequestActiveUsersMessage;