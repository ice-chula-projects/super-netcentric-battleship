import './components/GameHeader';
import './components/UserSidebar';
import './components/AuthenticationPopover';    

import LoginManager from './Game/LoginManager';

//TODO: config
const PORT = 17040;

type AdminGame = {
    number: number;
    id: string;
    score: string;
};

const games: AdminGame[] = [
    { number: 1, id: '101', score: '(Alice) 10 - 8 (Bob)' },
    { number: 2, id: '121', score: '(Casie) 9 - 3 (Bob)' },
    { number: 3, id: '111', score: '(Casie) 7 - 6 (Alice)' },
];

const gamesList = document.querySelector('#games-list')!;

// Hide everything until authorization is established.
document.querySelector('main').style.visibility = 'hidden';

const url = 'ws://' + window.location.hostname + ':' + PORT;
const webSocket = new WebSocket(url);

const loginManager = new LoginManager(webSocket);
let dashboardInitialized = false;

function authorizeAdmin(): void {
    if (!loginManager.user) {
        return;
    }

    if (!loginManager.isAuthenticated || !loginManager.isAdmin) {
        window.location.replace('/');
        return;
    }

    if (dashboardInitialized) {
        return;
    }

    dashboardInitialized = true;
    document.body.style.visibility = 'visible';

    // renderGames();
}

document.addEventListener('auth-state-changed', authorizeAdmin);

if (loginManager.user) {
    authorizeAdmin();
}
