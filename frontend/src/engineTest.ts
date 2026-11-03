import * as ServerMessage from "@super-netcentric-battleship/shared/ServerMessage.js";
import * as ClientMessage from "@super-netcentric-battleship/shared/ClientMessage.js";

//TODO: config
const PORT = 17040;

//find the game server at the same host with different port
const url = "ws://" + window.location.hostname + ":" + PORT;
const webSocket = new WebSocket(url);

webSocket.addEventListener("open", () => {
  console.log("connected")
})
webSocket.addEventListener("close", ()=>{console.log("disconnected"), alert("Server probably crashed, pls tell me about it")})
webSocket.addEventListener("message", (message: MessageEvent) => {
  const serverMessage = JSON.parse(message.data) as ServerMessage.ServerMessageType
  console.log(serverMessage);
})

//expose to console for testing

//@ts-ignore
window.ServerMessage = ServerMessage;
//@ts-ignore
window.ClientMessage = ClientMessage;
//@ts-ignore
window.webSocket = webSocket;