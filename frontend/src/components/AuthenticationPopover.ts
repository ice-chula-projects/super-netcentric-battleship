import { appStyles } from '../styles';
import UserAvatar from './UserAvatar';

interface AuthenticationCredentials {
    username: string;
    password: string;
}

export default class AuthenticationPopover extends HTMLElement {
    private avatar!: UserAvatar;
    private accountButton!: HTMLButtonElement;
    private authenticationPopover!: HTMLElement;

    private loginForm!: HTMLFormElement;
    private registerForm!: HTMLFormElement;
    private errorElement!: HTMLParagraphElement;

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [appStyles];

        shadow.innerHTML = /* html */ `
            <style>
                :host {
                    display: inline-flex;
                }

                .avatar-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    border: none;
                    background: none;
                    cursor: pointer;
                    border-radius: 50%;
                    outline: 1.5px solid var(--color-satellite-foreground-border);
                    line-height: 0;
                }

                .avatar-button:hover {
                    outline: 2px solid var(--color-satellite-glow);
                    outline-offset: 3px;
                }

                user-avatar {
                    display: flex;
                }

                #auth-popover {
                    position: fixed;
                    inset: calc(var(--header-height, 0px) + 0.75rem) 1rem auto auto;
                    margin: 0;
                    padding: 1.5rem;
                    width: min(340px, calc(100vw - 2rem));
                    box-sizing: border-box;

                    background: var(--color-satellite-base);
                    color: var(--color-satellite-foreground);
                    border: 2px solid var(--color-satellite-glow);
                    border-radius: 12px;
                    box-shadow: 0 8px 24px #00000030;

                    z-index: 30;
                }

                .auth-header {
                    margin-bottom: 1.25rem;
                }

                .auth-header h2 {
                    margin: 0;
                    color: #465f80;
                    font-size: 1.4rem;
                }

                .auth-tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.25rem;
                }

                .auth-tabs button {
                    flex: 1;
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .auth-form label {
                    font-weight: 600;
                }

                .auth-form input {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 0.75rem;
                    border: 2px solid var(--color-satellite-foreground-border);
                    border-radius: 8px;
                    background: var(--color-satellite-foreground);
                    color: #263a3a;
                    font: inherit;
                }

                .auth-form input:focus {
                    outline: 2px solid var(--color-satellite-glow);
                    outline-offset: 2px;
                }

                .auth-form button[type="submit"] {
                    margin-top: 0.5rem;
                }

                .auth-error {
                    color: #c0392b;
                    font-size: 0.875rem;
                    margin: 0 0 0.75rem;
                }

                [hidden] {
                    display: none !important;
                }
            </style>

            <button
                type="button"
                class="avatar-button"
                id="account-button"
                popovertarget="auth-popover"
                aria-label="Open account menu"
            >
                <user-avatar></user-avatar>
            </button>

            <div id="auth-popover" popover>
                <div class="auth-header">
                    <h2 class="space-mono-bold">Account</h2>
                </div>

                <div class="auth-tabs" role="group" aria-label="Authentication">
                    <button
                        type="button"
                        id="login-tab"
                        class="mode-selector"
                        aria-pressed="true"
                    >
                        Login
                    </button>

                    <button
                        type="button"
                        id="register-tab"
                        class="mode-selector"
                        aria-pressed="false"
                    >
                        Register
                    </button>
                </div>
                <p
                    id="auth-error"
                    class="auth-error"
                    role="alert"
                    aria-live="polite"
                    hidden
                ></p>

                <form id="login-form" class="auth-form">
                    <label for="login-username">Username</label>
                    <input
                        type="text"
                        id="login-username"
                        name="username"
                        autocomplete="username"
                        placeholder="Enter username"
                        required
                    />

                    <label for="login-password">Password</label>
                    <input
                        type="password"
                        id="login-password"
                        name="password"
                        autocomplete="current-password"
                        placeholder="Enter password"
                        required
                    />

                    <button type="submit">Login</button>
                </form>

                <form id="register-form" class="auth-form" hidden>
                    <label for="register-username">Username</label>
                    <input
                        type="text"
                        id="register-username"
                        name="username"
                        autocomplete="username"
                        placeholder="Choose a username"
                        required
                    />

                    <label for="register-password">Password</label>
                    <input
                        type="password"
                        id="register-password"
                        name="password"
                        autocomplete="new-password"
                        placeholder="Choose a password"
                        required
                    />

                    <button type="submit">Create Account</button>
                </form>
            </div>
        `;

        this.avatar = shadow.querySelector('user-avatar')!;
        this.accountButton = shadow.querySelector('#account-button')!;
        this.authenticationPopover = shadow.querySelector('#auth-popover')!;

        this.loginForm = shadow.querySelector('#login-form')!;
        this.registerForm = shadow.querySelector('#register-form')!;
        this.errorElement = shadow.querySelector('#auth-error')!;

        shadow.querySelector('#login-tab')!.addEventListener('click', () => {
            this.showForm('login');
        });

        shadow.querySelector('#register-tab')!.addEventListener('click', () => {
            this.showForm('register');
        });

        this.loginForm.addEventListener('submit', (event) => {
            this.handleSubmit(event, this.loginForm, 'auth-login-request');
        });

        this.registerForm.addEventListener('submit', (event) => {
            this.handleSubmit(event, this.registerForm, 'auth-register-request');
        });
    }

    connectedCallback() {
        document.addEventListener('auth-state-changed', this.handleAuthenticationStateChange);
        document.addEventListener('auth-error', this.handleAuthenticationError);
    }

    disconnectedCallback() {
        document.removeEventListener('auth-state-changed', this.handleAuthenticationStateChange);
        document.removeEventListener('auth-error', this.handleAuthenticationError);
    }

    get username(): string {
        return this.avatar.username;
    }

    set username(value: string) {
        this.avatar.username = value;
    }

    private showForm(form: 'login' | 'register') {
        const isLogin = form === 'login';

        this.loginForm.hidden = !isLogin;
        this.registerForm.hidden = isLogin;

        this.shadowRoot!.querySelector('#login-tab')!.setAttribute('aria-pressed', String(isLogin));

        this.shadowRoot!.querySelector('#register-tab')!.setAttribute(
            'aria-pressed',
            String(!isLogin),
        );

        this.clearError();
    }

    private handleSubmit(event: SubmitEvent, form: HTMLFormElement, eventName: string) {
        event.preventDefault();

        const usernameInput = form.elements.namedItem('username') as HTMLInputElement;
        const passwordInput = form.elements.namedItem('password') as HTMLInputElement;

        const credentials: AuthenticationCredentials = {
            username: usernameInput.value.trim(),
            password: passwordInput.value,
        };

        if (!credentials.username || !credentials.password) {
            return;
        }

        this.clearError();

        this.dispatchEvent(
            new CustomEvent<AuthenticationCredentials>(eventName, {
                detail: credentials,
                bubbles: true,
                composed: true,
            }),
        );

        // Do not retain the password in the form after submission.
        passwordInput.value = '';
    }

    private clearError() {
        this.errorElement.textContent = '';
        this.errorElement.hidden = true;
    }

    private handleAuthenticationStateChange = (event: Event) => {
        const { username, isAuthenticated, isGuest } = (
            event as CustomEvent<{
                username: string | null;
                isAuthenticated: boolean;
                isGuest: boolean;
            }>
        ).detail;

        this.username = username ?? '';

        this.accountButton.setAttribute(
            'aria-label',
            isAuthenticated
                ? `Account: ${username}`
                : isGuest
                  ? `Guest account: ${username}`
                  : 'Open account menu',
        );

        if (isAuthenticated) {
            this.authenticationPopover.hidePopover();
            this.loginForm.reset();
            this.registerForm.reset();
            this.clearError();
        }
    };

    private handleAuthenticationError = (event: Event) => {
        const { message } = (event as CustomEvent<{ message: string }>).detail;

        this.errorElement.textContent = message;
        this.errorElement.hidden = false;
    };
}

customElements.define('auth-popover', AuthenticationPopover);
