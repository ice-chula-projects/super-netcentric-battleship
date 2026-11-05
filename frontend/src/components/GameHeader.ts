import { appStyles } from '../styles';
import LobbyScreen from './LobbyScreen';

export default class GameHeader extends HTMLElement {
    private usernameButton!: HTMLButtonElement;
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [appStyles];
        shadow.innerHTML = /* html */ `
            <style>
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
                }

                .right {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .mobile-text {
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
                <h1>
                    <span class="full-text space-mono-bold">Ship Ship Hooray!</span>
                    <span class="mobile-text space-mono-bold">SSH!</span>
                </h1>

                <div class="right">
                    <div>
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
                    <div>
                        <button
                            popovertarget="username-form"
                            id="current-username"
                            class="space-grotesk-medium secondary"
                        ></button>

                        <form id="username-form" popover>
                            <label for="new-username">Enter new username:</label><br />
                            <input type="text" id="new-username" placeholder="Ex. Alice" required />
                            <button type="submit" id="change-username-button" class="secondary">
                                Change Username
                            </button>
                        </form>
                    </div>
                    <button
                        class="icon"
                        id="sidebar-toggle"
                        type="button"
                        aria-label="Toggle sidebar"
                        aria-controls="sidebar"
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
                </div>
            </header>
        `;
        const usernameForm = shadow.querySelector<HTMLElement>('#username-form')!;
        const sidebarToggle = shadow.querySelector('#sidebar-toggle')!;

        this.usernameButton = shadow.querySelector('#current-username')!;

        usernameForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = shadow.querySelector<HTMLInputElement>('#new-username')!.value;
            this.dispatchEvent(
                new CustomEvent('change-username', {
                    detail: { username },
                    bubbles: true,
                }),
            );
            usernameForm.hidePopover();
        });

        sidebarToggle.addEventListener('click', () => {
            this.dispatchEvent(
                new CustomEvent('sidebar-toggle', {
                    bubbles: true,
                }),
            );
        });

        document.addEventListener('sidebar-state-change', (event) => {
            const { isOpen } = (event as CustomEvent<{ isOpen: boolean }>).detail;
            sidebarToggle.setAttribute('aria-expanded', String(isOpen));
        });

        const header = shadow.querySelector('header')!;

        const resizeObserver = new ResizeObserver(([entry]) => {
            const height = entry.borderBoxSize[0].blockSize;

            document.documentElement.style.setProperty('--header-height', `${height}px`);
        });

        resizeObserver.observe(header);
    }

    get username(): string {
        return this.usernameButton.textContent ?? '';
    }

    set username(value: string) {
        this.usernameButton.textContent = value;
    }

    get lobbyScreen(): LobbyScreen | null {
        return this.shadowRoot?.querySelector('lobby-screen') ?? null;
    }
}

customElements.define('game-header', GameHeader);
