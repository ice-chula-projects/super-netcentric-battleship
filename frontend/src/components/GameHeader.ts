import { appStyles } from '../styles';
import LobbyScreen from './LobbyScreen';
import AuthenticationPopover from './AuthenticationPopover';
import './ShipModes';
import shipModesCSS from './ShipModes.css?inline';
import Camera from '../Game/Camera';
import ShipModes from './ShipModes';
export default class GameHeader extends HTMLElement {
    private authenticationPopover!: AuthenticationPopover;
    private shadow: ShadowRoot;
    set camera(camera: Camera){
        const shipModeSelect = this.shadow.querySelector<ShipModes>("ship-modes");
        shipModeSelect.camera = camera;
    }
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [appStyles];
        shadow.innerHTML = /* html */ `
            <style>
                ${shipModesCSS}
                :host {
                    display: block;
                }

                header {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    height: var(--header-height);
                    padding: 1rem 2rem;
                    position: fixed;
                    width: 100vw;
                    top: 0;
                    align-items: flex-end;
                    height: auto;
                    background-image: linear-gradient(
                        120deg,
                        var(--color-satellite-glow),
                        var(--color-satellite-base)
                    );
                    border-radius: 0 0 8px 8px;
                    border-bottom: 2px solid var(--color-satellite-glow);
                    box-shadow: 0 5px 4px 6px #00000025;
                    z-index: 20;
                    box-sizing: border-box;
                }

                .row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .mobile-text {
                    display: none;
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

                .avatar-button user-avatar {
                    display: flex;
                }

                :host([variant="admin"]) .invisible-as-admin {
                    display: none;
                }

                @media (max-width: 639px) {
                    .full-text {
                        display: none;
                    }

                    .mobile-text {
                        display: inline;
                    }
                }
            </style>

            <header class="flex-space">
                <section class="row">
                    <button
                        class="icon"
                        id="sidebar-toggle"
                        type="button"
                        aria-label="Toggle user sidebar"
                        aria-controls="user-sidebar"
                        aria-expanded="true"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                aria-hidden="true"
                            >
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                    </button>
                    <h1>
                        <span class="full-text space-mono-bold">Ship Ship Hooray!</span>
                        <span class="mobile-text space-mono-bold">SSH!</span>
                    </h1>
                </section>

                <section class="row">
                    <div class="invisible-as-admin">
                        <ship-modes></ship-modes>
                    </div>
                    <div class="invisible-as-admin">
                        <button
                            popovertarget="lobby-form"
                            id="current-game-id"
                            class="space-grotesk-medium secondary"
                        >
                            <span class="full-text">Game Lobby</span>
                            <span class="mobile-text">Lobby</span>
                        </button>
                        <lobby-screen id="lobby-form" popover></lobby-screen>
                    </div>
                    <button
                        class="icon invisible-as-admin"
                        id="chat-toggle"
                        type="button"
                        aria-label="Toggle chat"
                        aria-controls="chat-sidebar"
                        aria-expanded="true"
                    >
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 -960 960 960"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M240-399h313v-60H240v60Zm0-130h480v-60H240v60Zm0-130h480v-60H240v60ZM80-80v-740q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H240L80-80Zm134-220h606v-520H140v600l74-80Zm-74 0v-520 520Z"
                                fill="currentColor"
                            ></path>
                        </svg>
                    </button>
                    <auth-popover></auth-popover>
                </section>
            </header>
        `;

        this.shadow = shadow;
        const chatToggle = shadow.querySelector('#chat-toggle')!;
        const userSidebarToggle = shadow.querySelector<HTMLButtonElement>('#sidebar-toggle')!;
        

        this.authenticationPopover = shadow.querySelector('auth-popover')!;

        chatToggle.addEventListener('click', () => {
            this.dispatchEvent(
                new CustomEvent('chat-toggle', {
                    bubbles: true,
                }),
            );
        });

        userSidebarToggle.addEventListener('click', () => {
            this.dispatchEvent(
                new CustomEvent('user-sidebar-toggle', {
                    bubbles: true,
                }),
            );
        });

        document.addEventListener('sidebar-state-change', (event) => {
            const { isOpen } = (event as CustomEvent<{ isOpen: boolean }>).detail;
            chatToggle.setAttribute('aria-expanded', String(isOpen));
        });

        document.addEventListener('user-sidebar-state-change', (event) => {
            const { isOpen } = (event as CustomEvent<{ isOpen: boolean }>).detail;

            userSidebarToggle.setAttribute('aria-expanded', String(isOpen));
        });

        const header = shadow.querySelector('header')!;

        const resizeObserver = new ResizeObserver(([entry]) => {
            const height = entry.borderBoxSize[0].blockSize;

            document.documentElement.style.setProperty('--header-height', `${height}px`);
        });

        resizeObserver.observe(header);
    }

    get username(): string {
        return this.authenticationPopover.username;
    }

    set username(value: string) {
        this.authenticationPopover.username = value;
    }

    get lobbyScreen(): LobbyScreen | null {
        return this.shadowRoot?.querySelector('lobby-screen') ?? null;
    }
}

customElements.define('game-header', GameHeader);
