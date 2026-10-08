import { JoinGameMessage } from "./JoinGameMessage.js";
import { PingMessage } from "./PingMessage.js";
import { RequestActiveUsersMessage } from "./RequestActiveUsersMessage.js";
import { RequestUserInfoMessage } from "./RequestUserInfoMessage.js";
import { SendBoardSetupMessage } from "./SendBoardSetupMessage.js";
import { SendGameActionMessage } from "./sendGameActionMessage.js";
import { SendToChatMessage } from "./SendToChatMessage.js";
import { UpdateChatChannelSubscriptionMessage } from "./UpdateChatChannelSubscriptionMessage.js";
import { UpdateUserInfoMessage } from "./UpdateUserInfoMessage.js";

export * from "./ClientMessageType.js";
export * from "./PingMessage.js";
export * from "./RequestUserInfoMessage.js"
export * from "./UpdateUserInfoMessage.js"
export * from "./RequestActiveUsersMessage.js"
export * from "./UpdateChatChannelSubscriptionMessage.js"
export * from "./SendToChatMessage.js"
export * from "./SendBoardSetupMessage.js";
export * from "./sendGameActionMessage.js";
export * from "./JoinGameMessage.js";

export type ClientMessage = PingMessage |
RequestUserInfoMessage |
UpdateUserInfoMessage |
RequestActiveUsersMessage |
UpdateChatChannelSubscriptionMessage |
SendToChatMessage |
SendBoardSetupMessage |
SendGameActionMessage |
JoinGameMessage;