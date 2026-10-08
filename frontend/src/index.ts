import * as ServerMessage from "@super-netcentric-battleship/shared/ServerMessage.js";
import * as ClientMessage from "@super-netcentric-battleship/shared/ClientMessage.js";

//TODO: config
const PORT = 8080;

//find the game server at the same host with different port
const url = "ws://" + window.location.hostname + ":" + PORT;
const webSocket = new WebSocket(url);

webSocket.addEventListener("open", ()=>{console.log("connected")})
webSocket.addEventListener("close", ()=>{console.log("disconnected")})
webSocket.addEventListener("message", (message)=>{console.log(JSON.parse(message.data))})

//expose to console for testing

//@ts-ignore
window.ServerMessage = ServerMessage;
//@ts-ignore
window.ClientMessage = ClientMessage;
//@ts-ignore
window.webSocket = webSocket;