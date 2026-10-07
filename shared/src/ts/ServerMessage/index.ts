import { PongMessage } from "./PongMessage.js";
import { UserInfoMessage } from "./UserInfoMessage.js";

export * from "./ServerMessageType.js";
export * from "./PongMessage.js";
export * from "./UserInfoMessage.js";

export type ServerMessage = PongMessage | UserInfoMessage;