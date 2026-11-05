import * as ServerMessage from '@super-netcentric-battleship/shared/ServerMessage.js';
import * as ClientMessage from '@super-netcentric-battleship/shared/ClientMessage.js';
import Camera from './Game/Camera';
import { GameManager } from './Game/GameManager';
import { LobbyManager } from './Game/LobbyManager';
import './components/ChatSidebar';
import './components/GameHeader';
import './components/ChatMessage';
import './components/LobbyScreen';
import './components/UserAvatar';
import './components/UserSidebar';
import type ChatSidebar from './components/ChatSidebar';
import GameHeader from './components/GameHeader';
import UserSidebar from './components/UserSidebar';

console.log('index.ts loaded');
//TODO: config
const PORT = 17040;

//find the game server at the same host with different port
const url = 'ws://' + window.location.hostname + ':' + PORT;
const webSocket = new WebSocket(url);
const gameManager = new GameManager(webSocket);
const lobbyManager = new LobbyManager(webSocket, gameManager);
const camera = new Camera(document.getElementById('canvas') as HTMLCanvasElement, gameManager);

//TODO: move none setup logic outside of index.ts
const header = document.querySelector('game-header') as GameHeader;
const chatSidebar = document.querySelector('chat-sidebar') as ChatSidebar;
const lobbyScreen = document.querySelector<GameHeader>('game-header')!.lobbyScreen;
const userSidebar = document.querySelector<UserSidebar>('user-sidebar');

let currentUser: { username: string; id: string };
webSocket.addEventListener('open', () => {
    console.log('connected');
    webSocket.send(new ClientMessage.RequestUserInfoMessageBuilder().toJsonString());
    webSocket.send(new ClientMessage.RequestActiveUsersMessageBuilder().toJsonString());
    lobbyScreen!.manager = lobbyManager;
    lobbyManager.requestPublicLobbies(0);
});
webSocket.addEventListener('close', () => {
    (console.log('disconnected'), alert('Server probably crashed, pls tell me about it'));
});
webSocket.addEventListener('message', (message: MessageEvent) => {
    const serverMessage = JSON.parse(message.data) as ServerMessage.ServerMessage;
    console.log(serverMessage);
    switch (serverMessage.type) {
        case ServerMessage.ServerMessageType.ChatMessageNotification:
            chatSidebar.addMessage(
                serverMessage.author,
                new Date(serverMessage.timestamp),
                serverMessage.message,
                serverMessage.author.username === currentUser?.username,
            );
            break;
        case ServerMessage.ServerMessageType.UserInfo:
            if (serverMessage.userInfo.username === null || serverMessage.userInfo.id === null) {
                return;
            }
            currentUser = serverMessage.userInfo as unknown as { username: string; id: string };
            // game.playerId = serverMessage.userInfo.id;
            header.username = currentUser.username;
            if (!/guest\#\d\d\d\d\d\d/.test(currentUser.username)) {
                alert(`Hello ${currentUser.username}`);
                webSocket.send(new ClientMessage.RequestActiveUsersMessageBuilder().toJsonString());
            }
            break;
        case ServerMessage.ServerMessageType.ActiveUsersInfo:
            if (!userSidebar) {
                break;
            }

            userSidebar.activeUsers = serverMessage.activeUsers.map((user) => user.username);
            break;
        case ServerMessage.ServerMessageType.Error:
            alert(serverMessage.error);
            break;
    }
});

//expose to console for testing

//@ts-ignore
window.ServerMessage = ServerMessage;
//@ts-ignore
window.ClientMessage = ClientMessage;
//@ts-ignore
window.webSocket = webSocket;
//@ts-ignore
window.camera = camera;

chatSidebar.addEventListener('send-chat-message', (event) => {
    const { message, channelId } = (
        event as CustomEvent<{
            message: string;
            channelId: string;
        }>
    ).detail;

    chatSidebar.addMessage(currentUser, new Date(), message, true);

    webSocket.send(
        new ClientMessage.SendToChatMessageBuilder()
            .setChannelId(channelId)
            .setMessage(message)
            .toJsonString(),
    );
});

header?.addEventListener('change-username', (event) => {
    const { username } = (event as CustomEvent<{ username: string }>).detail;

    if (username === currentUser.username || username.trim().length === 0) {
        return;
    }

    webSocket.send(
        new ClientMessage.UpdateUserInfoMessageBuilder().setUsername(username).toJsonString(),
    );
});

document.addEventListener('refresh-active-users', () => {
    webSocket.send(new ClientMessage.RequestActiveUsersMessageBuilder().toJsonString());
});
