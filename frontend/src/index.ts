import * as ServerMessage from "@super-netcentric-battleship/shared/ServerMessage.js";
import * as ClientMessage from "@super-netcentric-battleship/shared/ClientMessage.js";

//TODO: config
const PORT = 8080;

//find the game server at the same host with different port
const url = "ws://" + window.location.hostname + ":" + PORT;
const webSocket = new WebSocket(url);

function messageComponent(author: { username: string }, timestamp: Date, messageText: string) {
  const messageElement = document.createElement("li")
  messageElement.innerHTML = `
    <p style="font-weight: bold;">${author.username}</p>
    <span style="color: gray; font-size: 10px;">${timestamp.toTimeString()}</span>
    <p>${messageText}</p>
  `
  return messageElement
}

let currentUser: { username: string };
webSocket.addEventListener("open", () => {
  console.log("connected")
  webSocket.send(new ClientMessage.RequestUserInfoMessageBuilder().toJsonString())
  webSocket.send(new ClientMessage.RequestActiveUsersMessageBuilder().toJsonString())
})
webSocket.addEventListener("close", ()=>{console.log("disconnected")})
webSocket.addEventListener("message", (message: MessageEvent) => {
  const serverMessage = JSON.parse(message.data) as ServerMessage.ServerMessage
  switch (serverMessage.type) {
    case ServerMessage.ServerMessageType.ChatMessageNotification:
      document.querySelector("#global-chat").appendChild(messageComponent(serverMessage.author, new Date(serverMessage.timestamp), serverMessage.message))
      break;
    case ServerMessage.ServerMessageType.UserInfo:
      currentUser = serverMessage.userInfo
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
  }
})

//expose to console for testing

//@ts-ignore
window.ServerMessage = ServerMessage;
//@ts-ignore
window.ClientMessage = ClientMessage;
//@ts-ignore
window.webSocket = webSocket;

document.querySelector("#send-to-global-chat-button").addEventListener("click", () => {
  const messageText = (document.querySelector("#current-message") as HTMLInputElement).value
  document.querySelector("#global-chat").appendChild(messageComponent(currentUser, new Date(), messageText))
  webSocket.send(new ClientMessage.SendToChatMessageBuilder().setChannelId("global").setMessage(messageText).toJsonString())
})

document.querySelector("#change-username-button").addEventListener("click", () => {
  const username = (document.querySelector("#new-username") as HTMLInputElement).value
  webSocket.send(new ClientMessage.UpdateUserInfoMessageBuilder().setUsername(username).toJsonString())
})

document.querySelector("#refresh-active-users-button").addEventListener("click", () => {
  webSocket.send(new ClientMessage.RequestActiveUsersMessageBuilder().toJsonString())
})
