import * as ClientMessage from "@super-netcentric-battleship/shared/ClientMessage.js";
import * as ServerMessage from "@super-netcentric-battleship/shared/ServerMessage.js";
import Camera from "./Game/Camera";
import { Game, GameManager } from "./Game/GameManager";
import { LobbyManager } from "./Game/LobbyManager";

//TODO: config
const PORT = 17040;

//find the game server at the same host with different port
const url = "ws://" + window.location.hostname + ":" + PORT;
const webSocket = new WebSocket(url);
const game = new Game(webSocket);
const camera = new Camera(document.getElementById("canvas") as HTMLCanvasElement, game);

const gameManager = new GameManager(webSocket);
const lobbyManager = new LobbyManager(webSocket, gameManager);

//TODO: move none setup logic outside of index.ts
function messageComponent(author: { username: string }, timestamp: Date, messageText: string) {
  const messageElement = document.createElement("li")
  messageElement.innerHTML = `
    <p style="font-weight: bold;">${author.username}</p>
    <span style="color: gray; font-size: 10px;">${timestamp.toTimeString()}</span>
    <p>${messageText}</p>
  `
  return messageElement
}

let currentUser: { username: string, id: string };
webSocket.addEventListener("open", () => {
  console.log("connected")
  webSocket.send(new ClientMessage.RequestUserInfoMessageBuilder().toJsonString())
  webSocket.send(new ClientMessage.RequestActiveUsersMessageBuilder().toJsonString())
})
webSocket.addEventListener("close", ()=>{console.log("disconnected"), alert("Server probably crashed, pls tell me about it")})
webSocket.addEventListener("message", (message: MessageEvent) => {
  const serverMessage = JSON.parse(message.data) as ServerMessage.ServerMessage
  console.log(serverMessage);
  switch (serverMessage.type) {
    case ServerMessage.ServerMessageType.ChatMessageNotification:
      document.querySelector("#global-chat").appendChild(messageComponent(serverMessage.author, new Date(serverMessage.timestamp), serverMessage.message))
      break;
    case ServerMessage.ServerMessageType.UserInfo:
      currentUser = serverMessage.userInfo
      game.playerId = serverMessage.userInfo.id;
      document.querySelector("#current-username").innerHTML = currentUser.username
      if (!/guest\#\d\d\d\d\d\d/.test(currentUser.username)) {
        alert(`Hello ${currentUser.username}`)
        webSocket.send(new ClientMessage.RequestActiveUsersMessageBuilder().toJsonString())
      }
      break;
    case ServerMessage.ServerMessageType.ActiveUsersInfo:
      const activeUsers = document.querySelector("#active-users")
      activeUsers.innerHTML = ""
      for (const user of serverMessage.activeUsers) {
        const userElement = document.createElement("li")
        userElement.innerHTML = user.username
        activeUsers.appendChild(userElement)
      }
      break;
    case ServerMessage.ServerMessageType.Error:
      alert(serverMessage.error);
    break;
  }
})

//expose to console for testing

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

document.querySelector("#send-to-global-chat-button").addEventListener("click", () => {
  const messageText = (document.querySelector("#current-message") as HTMLInputElement).value;
  (document.querySelector("#current-message") as HTMLInputElement).value = ""
  document.querySelector("#global-chat").appendChild(messageComponent(currentUser, new Date(), messageText))
  if (messageText.trim().length === 0) {
    return;
  }
  webSocket.send(new ClientMessage.SendToChatMessageBuilder().setChannelId("global").setMessage(messageText).toJsonString())
})

document.querySelector("#change-username-button").addEventListener("click", () => {
  const username = (document.querySelector("#new-username") as HTMLInputElement).value
  webSocket.send(new ClientMessage.UpdateUserInfoMessageBuilder().setUsername(username).toJsonString())
})

document.querySelector("#refresh-active-users-button").addEventListener("click", () => {
  webSocket.send(new ClientMessage.RequestActiveUsersMessageBuilder().toJsonString())
})

document.querySelector("#join-game").addEventListener("click", () => {
  const gameId = (document.querySelector("#current-game-id") as HTMLInputElement).value;
  game.joinGame(gameId);
})
