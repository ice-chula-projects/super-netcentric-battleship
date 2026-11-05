import {
    LoginMessageBuilder,
    RegisterMessageBuilder,
} from '@super-netcentric-battleship/shared/ClientMessage.js';

interface AuthenticationCredentials {
    username: string;
    password: string;
}

export default class LoginManager {
    private _isAuthenticated = false;
    private _username: string | null = null;
    private _user: {
        username: string;
        id: string;
    } | null = null;

    private _isAdmin = false;
    private _isGuest = true;
    private pendingAuthenticationOperation: 'login' | 'register' | null = null;

    constructor(private readonly webSocket: WebSocket) {
        document.addEventListener('auth-login-request', this.handleLoginRequest);
        document.addEventListener('auth-register-request', this.handleRegisterRequest);
    }

    get user() {
        return this._user;
    }

    get isAdmin(): boolean {
        return this._isAdmin;
    }

    get isGuest(): boolean {
        return this._isGuest;
    }

    get isAuthenticated(): boolean {
        return this._isAuthenticated;
    }

    get username(): string | null {
        return this._username;
    }

    dispose() {
        document.removeEventListener('auth-login-request', this.handleLoginRequest);
        document.removeEventListener('auth-register-request', this.handleRegisterRequest);
    }

    private handleLoginRequest = (event: Event) => {
        const { username, password } = (event as CustomEvent<AuthenticationCredentials>).detail;

        const message = new LoginMessageBuilder().setUsername(username).setPassword(password);

        this.pendingAuthenticationOperation = 'login';
        this.sendMessage(message.toJsonString());
    };

    private handleRegisterRequest = (event: Event) => {
        const { username, password } = (event as CustomEvent<AuthenticationCredentials>).detail;

        const message = new RegisterMessageBuilder().setUsername(username).setPassword(password);

        this.pendingAuthenticationOperation = 'register';
        this.sendMessage(message.toJsonString());
    };

    private sendMessage(message: string) {
        if (this.webSocket.readyState !== WebSocket.OPEN) {
            this.notifyError('Unable to connect to the game server.');
            return;
        }

        try {
            this.webSocket.send(message);
        } catch {
            this.notifyError('Failed to send authentication request.');
        }
    }

    handleUserInfo(userInfo: { username: string; id: string; isAdmin: boolean }) {
        const isGuest = /^guest#\d{6}$/i.test(userInfo.username);

        this._user = {
            username: userInfo.username,
            id: userInfo.id,
        };

        this._isGuest = isGuest;
        this._isAuthenticated = !isGuest;
        this._isAdmin = !isGuest && userInfo.isAdmin === true;

        this.notifyStateChanged();
    }

    private notifyStateChanged() {
        document.dispatchEvent(
            new CustomEvent('auth-state-changed', {
                detail: {
                    user: this._user,
                    username: this._user?.username ?? null,
                    isAuthenticated: this._isAuthenticated,
                    isGuest: this._isGuest,
                    isAdmin: this._isAdmin,
                },
            }),
        );
    }

    private notifyError(message: string) {
        document.dispatchEvent(
            new CustomEvent('auth-error', {
                detail: { message },
            }),
        );
    }

    handleServerError(message: string): boolean {
        if (!this.pendingAuthenticationOperation) {
            return false;
        }

        this.pendingAuthenticationOperation = null;
        this.notifyError(message);

        return true;
    }
}
