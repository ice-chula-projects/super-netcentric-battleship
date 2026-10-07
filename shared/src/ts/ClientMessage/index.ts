import { PingMessage } from "./PingMessage.js";
import { RequestUserInfoMessage } from "./RequestUserInfoMessage.js";

export * from "./ClientMessageType.js";
export * from "./PingMessage.js";
export * from "./RequestUserInfoMessage.js"

export type ClientMessage = PingMessage | RequestUserInfoMessage;