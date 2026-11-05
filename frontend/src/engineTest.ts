import * as ServerMessage from "@super-netcentric-battleship/shared/ServerMessage.js";
import * as ClientMessage from "@super-netcentric-battleship/shared/ClientMessage.js";
import { ShipType } from "@super-netcentric-battleship/shared/Game/ShipDefinitions.js";
import { CoordinateFactory } from "@super-netcentric-battleship/shared/Game/Coordinate.js";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";
import { LobbyManager } from "./Game/LobbyManager";
import { GameManager } from "./Game/GameManager";
import Camera from "./Game/Camera";
import { GameSettingsPresetNames, GameSettingsPresets } from "@super-netcentric-battleship/shared/Game/GameSettings.js";

//TODO: config
const PORT = 17040;

//find the game server at the same host with different port
const url = 'ws://' + window.location.hostname + ':' + PORT;
const webSocket = new WebSocket(url);

const gameManager = new GameManager(webSocket);
const lobbyManager = new LobbyManager(webSocket, gameManager);
const camera = new Camera(document.getElementById('canvas') as HTMLCanvasElement, gameManager);

webSocket.addEventListener('open', () => {
    console.log('connected');
});
webSocket.addEventListener('close', () => {
    (console.log('disconnected'), alert('Server probably crashed, pls tell me about it'));
});
webSocket.addEventListener('message', (message: MessageEvent) => {
    const serverMessage = JSON.parse(message.data) as ServerMessage.ServerMessageType;
    console.log(serverMessage);
});

//expose to console for testing

//@ts-ignore
window.ServerMessage = ServerMessage;
//@ts-ignore
window.ClientMessage = ClientMessage;
//@ts-ignore
window.webSocket = webSocket;
//@ts-ignore
window.lobbyManager = lobbyManager;
//@ts-ignore
window.gameManager = gameManager;
//@ts-ignore
window.camera = camera;