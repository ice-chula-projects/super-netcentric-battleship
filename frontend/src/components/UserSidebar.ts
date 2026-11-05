import { appStyles } from '../styles';
import UserAvatar from './UserAvatar';
import './UserAvatar';

export default class UserSidebar extends HTMLElement {
    private activeUsersElement!: HTMLDivElement; 
    private usersListElement!: HTMLDivElement;

    private _activeUsers: string[] = [];
    private _users: string[] = [];
    private _isOpen = true;

    private layoutQuery = window.matchMedia('(max-width: 800px)');

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [appStyles];

        shadow.innerHTML = /* html */ `
            <style>
                :host {
                    display: block;
                }

                aside {
                    position: fixed;
                    top: var(--header-height, 0px);
                    left: 0;
                    bottom: 0;

                    width: min(350px, 85vw);
                    box-sizing: border-box;

                    background: var(--color-satellite-base);
                    border-right: 2px solid var(--color-satellite-glow);
                    box-shadow: 5px 0 12px #00000020;

                    overflow-y: auto;
                    transition: transform 250ms ease;
                    z-index: 10;
                }

                :host([collapsed]) aside {
                    transform: translateX(-100%);
                    pointer-events: none;
                }

                .sidebar-inner {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    padding: 1.5rem;
                }

                section {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .section-heading {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                }

                h3 {
                    margin: 0;
                    color: #465f80;
                    font-size: 1.2rem;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin: 0;
                    color: #465f80;
                    font-size: 1.5rem;
                }

                .users-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .users-icon svg {
                    width: 28px;
                    height: 28px;
                }

                #active-users {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;

                    list-style: none;
                    margin: 0;
                    padding: 0;
                }

                .users-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .user-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;

                    padding: 0.875rem;
                    border-radius: 12px;

                    background: var(--color-satellite-foreground);
                    border: 1px solid var(--color-satellite-foreground-border);

                    transition:
                        transform 150ms ease,
                        box-shadow 150ms ease,
                        border-color 150ms ease;
                }

                .user-item:hover {
                    transform: translateX(3px);
                    border-color: var(--color-satellite-glow);
                    box-shadow: 0 3px 8px #00000012;
                }

                .user-avatar {
                    display: flex;
                    flex-shrink: 0;
                }

                .user-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.3rem;
                    min-width: 0;
                }

                .user-name {
                    font-weight: 600;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .user-status {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.8rem;
                    color: #64748b;
                }

                .status-indicator {
                    width: 8px;
                    height: 8px;
                    flex-shrink: 0;
                    border-radius: 50%;
                    background: #22a06b;
                    box-shadow: 0 0 5px #22a06b66;
                }

                @media (max-width: 639px) {
                    aside {
                        width: 85vw;
                    }

                    .sidebar-inner {
                        padding: 1rem;
                    }
                }
            </style>

            <aside id="user-sidebar" aria-label="User sidebar">
                <div class="sidebar-inner">
                    <section>
                        <div class="section-heading">
                            <h3 class="space-mono-bold">Active Users</h3>

                            <button
                                type="button"
                                id="refresh-active-users-button"
                                class="secondary"
                            >
                                Refresh
                            </button>
                        </div>

                        <ul id="active-users" aria-label="Active users"></ul>
                    </section>

                    <section class="users-panel">
                        <h2 class="section-title">
                            <span class="users-icon" aria-hidden="true">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.7"
                                >
                                    <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </span>
                            Users
                        </h2>

                        <div id="users-list" class="users-list"></div>
                    </section>
                </div>
            </aside>
        `;

        this.usersListElement = shadow.querySelector('#users-list')!;
        this.activeUsersElement = shadow.querySelector('#active-users')!;
        shadow.querySelector('#refresh-active-users-button')!.addEventListener('click', () => {
            this.dispatchEvent(
                new CustomEvent('refresh-active-users', {
                    bubbles: true,
                    composed: true,
                }),
            );
        });
    }

    connectedCallback() {
        document.addEventListener('user-sidebar-toggle', this.handleToggle);
        this.layoutQuery.addEventListener('change', this.handleLayoutChange);

        // Start closed on smaller screens and open on larger screens.
        this.isOpen = !this.layoutQuery.matches;
    }

    disconnectedCallback() {
        document.removeEventListener('user-sidebar-toggle', this.handleToggle);
        this.layoutQuery.removeEventListener('change', this.handleLayoutChange);
    }

    get isOpen(): boolean {
        return this._isOpen;
    }

    set isOpen(value: boolean) {
        this._isOpen = value;
        this.toggleAttribute('collapsed', !value);

        this.dispatchEvent(
            new CustomEvent('user-sidebar-state-change', {
                detail: { isOpen: value },
                bubbles: true,
                composed: true,
            }),
        );
    }

    get activeUsers(): string[] {
        return [...this._activeUsers];
    }

    // Active users go away when they leave, but stay in the users panel
    set activeUsers(value: string[]) {
        this._activeUsers = Array.isArray(value)
            ? [...new Set(value)]
            : [];
        
        this._users = [
            ...new Set([...this._users, ...this._activeUsers]),
        ];
    
        this.renderActiveUsers();
        this.renderUsers();
    }

    get users(): string[] {
        return [...this._users];
    }

    set users(value: string[]) {
        this._users = Array.isArray(value) ? [...value] : [];
        this.renderUsers();
    }

    private handleToggle = () => {
        this.isOpen = !this.isOpen;
    };

    private handleLayoutChange = () => {
        this.isOpen = !this.layoutQuery.matches;
    };

    private renderActiveUsers() {
        const userElements = this._activeUsers.map((username) => {
            const item = document.createElement('li');
            item.className = 'user-item';

            const avatar = new UserAvatar();
            avatar.className = 'user-avatar';

            const details = document.createElement('div');
            details.className = 'user-details';

            const name = document.createElement('span');
            name.className = 'user-name';
            name.textContent = username;

            const status = document.createElement('span');
            status.className = 'user-status';

            const indicator = document.createElement('span');
            indicator.className = 'status-indicator';
            indicator.setAttribute('aria-hidden', 'true');

            status.append(indicator, ' Online');
            details.append(name, status);
            item.append(avatar, details);

            return { item, avatar, username };
        });

        // Insert the elements into the connected DOM first.
        this.activeUsersElement.replaceChildren(...userElements.map(({ item }) => item));

        // Assign usernames after the avatars are connected.
        for (const { avatar, username } of userElements) {
            avatar.username = username;
        }
    }
    private renderUsers() {
        this.usersListElement.replaceChildren(
            ...this._users.map((username) => {
                const item = document.createElement('div');
                item.className = 'user-item';

                const avatar = new UserAvatar();
                avatar.className = 'user-avatar';

                const details = document.createElement('div');
                details.className = 'user-details';

                const name = document.createElement('span');
                name.className = 'user-name';
                name.textContent = username;

                details.append(name);
                item.append(avatar, details);

                // Append first so the custom element is connected.
                avatar.username = username;

                return item;
            }),
        );
    }
}

customElements.define('user-sidebar', UserSidebar);
