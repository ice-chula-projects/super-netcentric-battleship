import { PingMessage } from "./PingMessage.js";
import { RequestActiveUsersMessage } from "./User/RequestActiveUsersMessage.js";
import { RequestUserInfoMessage } from "./User/RequestUserInfoMessage.js";
import { SendToChatMessage } from "./Chat/SendToChatMessage.js";
import { UpdateChatChannelSubscriptionMessage } from "./Chat/UpdateChatChannelSubscriptionMessage.js";
import { UpdateUserInfoMessage } from "./User/UpdateUserInfoMessage.js";

export * from "./ClientMessageType.js";
export * from "./PingMessage.js";
export * from "./User/RequestUserInfoMessage.js"
export * from "./User/UpdateUserInfoMessage.js"
export * from "./User/RequestActiveUsersMessage.js"
export * from "./Chat/UpdateChatChannelSubscriptionMessage.js"
export * from "./Chat/SendToChatMessage.js"

export type ClientMessage = PingMessage |
RequestUserInfoMessage |
UpdateUserInfoMessage |
RequestActiveUsersMessage |
UpdateChatChannelSubscriptionMessage |
SendToChatMessage;