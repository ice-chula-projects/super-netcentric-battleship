import * as ClientMessage from "@super-netcentric-battleship/shared/ClientMessage.js";
import * as ServerMessage from "@super-netcentric-battleship/shared/ServerMessage.js";
import Camera from "./Game/Camera";
import { Game, GameManager } from "./Game/GameManager";
import { LobbyManager } from "./Game/LobbyManager";

// Config & Setup
const PORT = 17040;
const url = "ws://" + window.location.hostname + ":" + PORT;
const webSocket = new WebSocket(url);

const game = new Game(webSocket);
const gameManager = new GameManager(webSocket);
const lobbyManager = new LobbyManager(webSocket, gameManager);
const camera = new Camera(document.getElementById("canvas") as HTMLCanvasElement, game);

let currentUser: { username: string; id: string } = { username: "Player", id: "" };

// Helper to render chat items
function messageComponent(author: { username: string }, timestamp: Date, messageText: string) {
  const messageElement = document.createElement("li");
  messageElement.innerHTML = `
    <p style="font-weight: bold; margin: 0;">${author.username}</p>
    <span style="color: gray; font-size: 10px;">${timestamp.toLocaleTimeString()}</span>
    <p style="margin: 2px 0 0 0;">${messageText}</p>
  `;
  return messageElement;
}

// Helper to render public lobbies in the sidebar
interface PublicLobby {
  id: string;
  name: string;
  creator: string;
  description: string;
}

function renderPublicLobbies(lobbies: PublicLobby[]) {
  const container = document.querySelector("#lobbies-list");
  if (!container) return;

  container.replaceChildren();

  if (lobbies.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "lobby-description";
    emptyMsg.textContent = "No active public lobbies.";
    container.appendChild(emptyMsg);
    return;
  }

  lobbies.forEach((lobby) => {
    const card = document.createElement("div");
    card.className = "lobby-card";

    const cardHeader = document.createElement("div");
    cardHeader.className = "lobby-card-header";

    const title = document.createElement("span");
    title.className = "lobby-title";
    title.textContent = lobby.name;

    const creator = document.createElement("span");
    creator.className = "lobby-creator";
    creator.textContent = `by ${lobby.creator}`;

    cardHeader.appendChild(title);
    cardHeader.appendChild(creator);

    const desc = document.createElement("p");
    desc.className = "lobby-description";
    desc.textContent = lobby.description || "No description provided.";

    const joinBtn = document.createElement("button");
    joinBtn.className = "join-lobby-card-btn";
    joinBtn.type = "button";
    joinBtn.textContent = "Join";
    joinBtn.addEventListener("click", () => {
      game.joinGame(lobby.id);
    });

    card.appendChild(cardHeader);
    card.appendChild(desc);
    card.appendChild(joinBtn);

    container.appendChild(card);
  });
}

// ------------------------------------------------------------------
// WebSocket Lifecycle & Communication
// ------------------------------------------------------------------
webSocket.addEventListener("open", () => {
  console.log("WebSocket connected.");
  webSocket.send(new ClientMessage.RequestUserInfoMessageBuilder().toJsonString());
  webSocket.send(new ClientMessage.RequestActiveUsersMessageBuilder().toJsonString());
  // Request active public lobbies on connect
  thisSendWSMessage({ type: "FETCH_PUBLIC_LOBBIES" });
});

webSocket.addEventListener("close", () => {
  console.log("disconnected");
  alert("Server probably crashed, pls tell me about it");
});

function thisSendWSMessage(msgObject: Record<string, unknown>) {
  if (webSocket.readyState === WebSocket.OPEN) {
    webSocket.send(JSON.stringify(msgObject));
  }
}

webSocket.addEventListener("message", (message: MessageEvent) => {
  let data: any;
  try {
    data = JSON.parse(message.data);
  } catch (e) {
    return;
  }

  // Support for custom JSON message types (e.g., Lobbies list) alongside ServerMessageType enum
  if (data.type === "PUBLIC_LOBBIES_LIST" && Array.isArray(data.lobbies)) {
    renderPublicLobbies(data.lobbies);
    return;
  }

  const serverMessage = data as ServerMessage.ServerMessage;
  console.log(serverMessage);

  switch (serverMessage.type) {
    case ServerMessage.ServerMessageType.ChatMessageNotification:
      document
        .querySelector("#global-chat")
        ?.appendChild(
          messageComponent(serverMessage.author, new Date(serverMessage.timestamp), serverMessage.message)
        );
      break;

    case ServerMessage.ServerMessageType.UserInfo:
      currentUser = serverMessage.userInfo;
      game.playerId = serverMessage.userInfo.id;
      const usernameEl = document.querySelector("#current-username");
      if (usernameEl) usernameEl.innerHTML = currentUser.username;

      if (!/guest\#\d\d\d\d\d\d/.test(currentUser.username)) {
        alert(`Hello ${currentUser.username}`);
        webSocket.send(new ClientMessage.RequestActiveUsersMessageBuilder().toJsonString());
      }
      break;

    case ServerMessage.ServerMessageType.ActiveUsersInfo:
      const activeUsers = document.querySelector("#active-users");
      if (activeUsers) {
        activeUsers.innerHTML = "";
        for (const user of serverMessage.activeUsers) {
          const userElement = document.createElement("li");
          userElement.innerHTML = user.username;
          activeUsers.appendChild(userElement);
        }
      }
      break;

    case ServerMessage.ServerMessageType.Error:
      alert(serverMessage.error);
      break;
  }
});

// ------------------------------------------------------------------
// DOM Event Handling & UI Integration
// ------------------------------------------------------------------

// Global Chat Send
document.querySelector("#send-to-global-chat-button")?.addEventListener("click", () => {
  const input = document.querySelector("#current-message") as HTMLInputElement;
  const messageText = input.value;
  input.value = "";

  if (messageText.trim().length === 0) return;

  document
    .querySelector("#global-chat")
    ?.appendChild(messageComponent(currentUser, new Date(), messageText));

  webSocket.send(
    new ClientMessage.SendToChatMessageBuilder()
      .setChannelId("global")
      .setMessage(messageText)
      .toJsonString()
  );
});

// Username Update
document.querySelector("#change-username-button")?.addEventListener("click", () => {
  const username = (document.querySelector("#new-username") as HTMLInputElement).value;
  if (username.trim()) {
    webSocket.send(new ClientMessage.UpdateUserInfoMessageBuilder().setUsername(username).toJsonString());
  }
});

// Sidebar Refresh Active Users
document.querySelector("#refresh-active-users-button")?.addEventListener("click", () => {
  webSocket.send(new ClientMessage.RequestActiveUsersMessageBuilder().toJsonString());
});

// Sidebar Refresh Public Lobbies
document.querySelector("#refresh-lobbies-button")?.addEventListener("click", () => {
  thisSendWSMessage({ type: "FETCH_PUBLIC_LOBBIES" });
});

// Sidebar Join Game by ID Input
document.querySelector("#join-game")?.addEventListener("click", () => {
  const gameId = (document.querySelector("#current-game-id") as HTMLInputElement).value;
  if (gameId.trim()) {
    game.joinGame(gameId);
  }
});

// Modal Events (triggered by index.html forms)
document.addEventListener("lobby:created", (e: Event) => {
  const customEvent = e as CustomEvent<{
    lobbyName: string;
    lobbyDescription: string;
    accessType: "public" | "private";
  }>;

  if (customEvent.detail) {
    const { lobbyName, lobbyDescription, accessType } = customEvent.detail;

    // Send Lobby Creation over WebSocket
    thisSendWSMessage({
      type: "CREATE_LOBBY",
      payload: {
        name: lobbyName,
        description: lobbyDescription,
        isPrivate: accessType === "private",
        creator: currentUser.username,
      },
    });
  }
});

document.addEventListener("game:joined", (e: Event) => {
  const customEvent = e as CustomEvent<{ gameId: string }>;
  if (customEvent.detail && customEvent.detail.gameId) {
    game.joinGame(customEvent.detail.gameId);
  }
});

// Expose objects to window context for browser debugging/testing
//@ts-ignore
window.ServerMessage = ServerMessage;
//@ts-ignore
window.ClientMessage = ClientMessage;
//@ts-ignore
window.webSocket = webSocket;
//@ts-ignore
window.camera = camera;
//@ts-ignore
window.lobbyManager = lobbyManager;
//@ts-ignore
window.gameManager = gameManager;
//@ts-ignore
window.game = game;