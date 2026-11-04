import { PingMessage } from "./PingMessage.js";
import { RequestActiveUsersMessage } from "./User/RequestActiveUsersMessage.js";
import { RequestUserInfoMessage } from "./User/RequestUserInfoMessage.js";
import { SendToChatMessage } from "./Chat/SendToChatMessage.js";
import { UpdateChatChannelSubscriptionMessage } from "./Chat/UpdateChatChannelSubscriptionMessage.js";
import { UpdateUserInfoMessage } from "./User/UpdateUserInfoMessage.js";
import { CreateLobbyMessage } from "./Game/Lobby/CreateLobbyMessage.js";
import { JoinLobbyMessage } from "./Game/Lobby/JoinLobbyMessage.js";
import { ModifyGameSettingsMessage } from "./Game/Lobby/ModifyGameSettingsMessage.js";
import { StartGameMessage } from "./Game/Lobby/StartGameMessage.js";
import { UpdateReadyStateMessage } from "./Game/Lobby/UpdateReadyStateMessage.js";
import { RequestPublicLobbiesMessage } from "./Game/Lobby/RequestPublicLobbiesMessage.js";
import { FireVolleyActionMessage } from "./Game/FireVolleyActionMessage.js";
import { InitializeFleetActionMessage } from "./Game/InitializeFleetActionMessage.js";
import { UseAbilityActionMessage } from "./Game/UseAbilityActionMessage.js";
import { RequestRematchActionMessage } from "./Game/RequestRematchActionMessage.js";

export * from "./ClientMessageType.js";
export * from "./PingMessage.js";
export * from "./User/RequestUserInfoMessage.js";
export * from "./User/UpdateUserInfoMessage.js";
export * from "./User/RequestActiveUsersMessage.js";
export * from "./Chat/UpdateChatChannelSubscriptionMessage.js";
export * from "./Chat/SendToChatMessage.js";
export * from "./Game/Lobby/CreateLobbyMessage.js";
export * from "./Game/Lobby/JoinLobbyMessage.js";
export * from "./Game/Lobby/ModifyGameSettingsMessage.js";
export * from "./Game/Lobby/StartGameMessage.js";
export * from "./Game/Lobby/UpdateReadyStateMessage.js"
export * from "./Game/Lobby/RequestPublicLobbiesMessage.js";
export * from "./Game/FireVolleyActionMessage.js";
export * from "./Game/InitializeFleetActionMessage.js";
export * from "./Game/UseAbilityActionMessage.js";
export * from "./Game/RequestRematchActionMessage.js"

export type ClientMessage = PingMessage |
RequestUserInfoMessage |
UpdateUserInfoMessage |
RequestActiveUsersMessage |
UpdateChatChannelSubscriptionMessage |
SendToChatMessage |
CreateLobbyMessage |
JoinLobbyMessage |
ModifyGameSettingsMessage |
StartGameMessage |
UpdateReadyStateMessage |
RequestPublicLobbiesMessage |
FireVolleyActionMessage |
InitializeFleetActionMessage |
UseAbilityActionMessage |
RequestRematchActionMessage;

export type ClientActionMessage = FireVolleyActionMessage |
InitializeFleetActionMessage |
UseAbilityActionMessage |
RequestRematchActionMessage;