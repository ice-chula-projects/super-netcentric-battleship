import * as ServerMessage from '@super-netcentric-battleship/shared/ServerMessage.js';
import * as ClientMessage from '@super-netcentric-battleship/shared/ClientMessage.js';

import './components/GameHeader';
import UserSidebar from './components/UserSidebar';
import LoginManager from './Game/LoginManager';
import './components/UserSidebar';
import './components/UserAvatar';
import './components/AuthenticationPopover';
import './components/AuthenticationPopover';

// TODO: config
const PORT = 17040;

// ============================================================
// TYPES
// ============================================================

type AdminLobby = {
    lobbyCode: string;
    name: string;
    description: string;
    isPublic: boolean;
    gameSettings: unknown;
    chatChannelId: string;
    connectedUsers: {
        userId: string;
        username: string;
        isHost: boolean;
        playerId: unknown;
        ready: boolean;
    }[];
};

// ============================================================
// DOM ELEMENTS
// ============================================================

const userSidebar = document.querySelector<UserSidebar>('user-sidebar');
userSidebar!.isOpen = false;

const lobbiesList = document.querySelector<HTMLDivElement>('#lobbies-list')!;
const refreshLobbiesButton = document.querySelector<HTMLButtonElement>('#refresh-lobbies')!;

// ============================================================
// WEBSOCKET & AUTHENTICATION
// ============================================================

// Connect to the game server at the same host, different port.
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const url = protocol + '//' + window.location.hostname + ':' + PORT;

const webSocket = new WebSocket(url);
const loginManager = new LoginManager(webSocket);

let dashboardInitialized = false;

// ============================================================
// LOBBY MANAGEMENT
// ============================================================

const lobbies = new Map<string, AdminLobby>();

function requestLobbies(): void {
    if (webSocket.readyState !== WebSocket.OPEN) {
        console.error('Cannot request lobbies: WebSocket is not connected.');
        return;
    }

    lobbies.clear();
    renderLobbies();

    lobbiesList.textContent = 'Loading lobbies...';

    const message = new ClientMessage.RequestAllGameLobbiesMessageBuilder()
        .setPage(0)
        .setLobbiesPerPage(null);

    webSocket.send(message.toJsonString());
}

function resetLobby(lobbyCode: string): void {
    if (webSocket.readyState !== WebSocket.OPEN) {
        console.error('Cannot reset lobby: WebSocket is not connected.');
        return;
    }

    const lobby = lobbies.get(lobbyCode);

    if (!lobby) {
        return;
    }

    const confirmed = window.confirm(
        `Are you sure you want to reset lobby "${lobby.name}" (${lobbyCode})?`,
    );

    if (!confirmed) {
        return;
    }

    const message = new ClientMessage.ResetGameLobbyMessageBuilder().setLobbyCode(lobbyCode);

    webSocket.send(message.toJsonString());

    // Request an updated list after the reset.
    requestLobbies();
}

function renderLobbies(): void {
    lobbiesList.replaceChildren();

    if (lobbies.size === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No lobbies found.';
        lobbiesList.appendChild(emptyMessage);
        return;
    }

    for (const lobby of lobbies.values()) {
        const lobbyElement = document.createElement('article');
        lobbyElement.className = 'admin-lobby';

        const info = document.createElement('div');
        info.className = 'admin-lobby-info';

        const name = document.createElement('h3');
        name.textContent = lobby.name || 'Unnamed Lobby';

        const code = document.createElement('p');
        code.textContent = `Code: ${lobby.lobbyCode}`;

        const description = document.createElement('p');
        description.textContent = lobby.description || 'No description';

        const visibility = document.createElement('p');
        visibility.textContent = lobby.isPublic ? 'Public' : 'Private';

        const players = document.createElement('p');
        players.textContent = `Players: ${lobby.connectedUsers.length}`;

        const playerList = document.createElement('p');
        playerList.textContent =
            lobby.connectedUsers
                .map((player) => {
                    const host = player.isHost ? ' (Host)' : '';
                    const ready = player.ready ? ' (Ready)' : '';

                    return `${player.username}${host}${ready}`;
                })
                .join(', ') || 'No connected players';

        const resetButton = document.createElement('button');
        resetButton.type = 'button';
        resetButton.textContent = 'Reset Lobby';
        resetButton.className = 'admin-lobby-reset';

        resetButton.addEventListener('click', () => {
            resetLobby(lobby.lobbyCode);
        });

        info.append(name, code, description, visibility, players, playerList);

        lobbyElement.append(info, resetButton);
        lobbiesList.appendChild(lobbyElement);
    }
}

// Refresh button.
refreshLobbiesButton.addEventListener('click', requestLobbies);

// ============================================================
// AUTHORIZATION
// ============================================================

const dashboard = document.querySelector<HTMLElement>('.dashboard');

if (!dashboard) {
    throw new Error('Could not find .dashboard');
}

if (!dashboard || !lobbiesList || !refreshLobbiesButton) {
    throw new Error('Admin dashboard elements are missing.');
}

// Hide admin-only content until authorization succeeds.
dashboard.hidden = true;

// Keep the login header accessible to guests.
document.body.style.visibility = 'visible';

function authorizeAdmin(): void {
    // Always hide the dashboard unless authorization succeeds.
    dashboard.hidden = true;

    // Wait until user information is available.
    if (!loginManager.user) {
        return;
    }

    // Guests can stay on the page but cannot see the dashboard.
    if (loginManager.isGuest) {
        if (userSidebar) {
            userSidebar.hidden = true;
        }
        return;
    }

    // Redirect authenticated non-admin users.
    if (!loginManager.isAuthenticated || !loginManager.isAdmin) {
        window.location.replace('/');
        return;
    }

    // Avoid initializing the dashboard more than once.
    if (dashboardInitialized) {
        dashboard.hidden = false;
        return;
    }

    dashboardInitialized = true;

    // Authorized admins can see the dashboard.
    dashboard.hidden = false;

    if (userSidebar) {
        userSidebar.hidden = false;
    }

    console.log('Admin dashboard initialized.');
}

document.addEventListener('auth-state-changed', authorizeAdmin);

// ============================================================
// WEBSOCKET EVENTS
// ============================================================

webSocket.addEventListener('open', () => {
    console.log('Connected to game server.');

    // Request the current user's information.
    webSocket.send(new ClientMessage.RequestUserInfoMessageBuilder().toJsonString());
    userSidebar.isOpen = false;
});

webSocket.addEventListener('close', () => {
    console.log('Disconnected from game server.');

    if (!dashboardInitialized) {
        document.body.style.visibility = 'visible';

        const message = document.createElement('p');
        message.className = 'games-error';
        message.textContent = 'Unable to connect to the game server.';
    }
});

webSocket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
});

webSocket.addEventListener('message', (event: MessageEvent) => {
    let serverMessage: ServerMessage.ServerMessage;

    try {
        serverMessage = JSON.parse(event.data) as ServerMessage.ServerMessage;
    } catch (error) {
        console.error('Invalid server message:', error);
        return;
    }

    switch (serverMessage.type) {
        // ----------------------------------------------------
        // USER INFORMATION
        // ----------------------------------------------------

        case ServerMessage.ServerMessageType.UserInfo: {
            const userInfo = serverMessage.userInfo;

            if (userInfo.username === null || userInfo.id === null) {
                break;
            }

            loginManager.handleUserInfo({
                username: userInfo.username,
                id: userInfo.id,
                isAdmin: userInfo.isAdmin,
            });

            // Request active users once we know the user isn't a guest.
            if (!loginManager.isGuest) {
                webSocket.send(new ClientMessage.RequestActiveUsersMessageBuilder().toJsonString());
            }
            break;
        }

        // ----------------------------------------------------
        // ACTIVE USERS
        // ----------------------------------------------------

        case ServerMessage.ServerMessageType.ActiveUsersInfo: {
            if (!userSidebar) {
                break;
            }
            userSidebar.activeUsers = serverMessage.activeUsers.map((user) => user.username);
            break;
        }

        case ServerMessage.ServerMessageType.LobbyInfoNotification: {
            const lobby: AdminLobby = {
                lobbyCode: serverMessage.lobbyCode,
                name: serverMessage.name,
                description: serverMessage.description,
                isPublic: serverMessage.isPublic,
                gameSettings: serverMessage.gameSettings,
                chatChannelId: serverMessage.chatChannelId,
                connectedUsers: serverMessage.connectedUsers,
            };

            lobbies.set(lobby.lobbyCode, lobby);
            renderLobbies();
            break;
        }

        // ----------------------------------------------------
        // SERVER ERRORS
        // ----------------------------------------------------

        case ServerMessage.ServerMessageType.Error: {
            console.error('Server error:', serverMessage.error);
            console.error('Message type:', serverMessage.type);
            loginManager.handleServerError(serverMessage.error);
            break;
        }
        default: {
            console.error('Message type:', serverMessage.type);
            break;
        }
    }
});
