import { appStyles } from '../styles/styles';

export default class UserAvatar extends HTMLElement {
    private avatarElement: HTMLDivElement;

    static get observedAttributes() {
        return ['username', 'size'];
    }

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [appStyles];

        shadow.innerHTML = /* html */ `
            <style>
                :host {
                    display: inline-flex;
                    vertical-align: middle;
                    flex: 0 0 auto;
                }

                .avatar {
                    display: grid;
                    place-items: center;
                    width: var(--avatar-size, 34px);
                    height: var(--avatar-size, 34px);
                    border-radius: 50%;
                    background: var(--accent);
                    color: var(--accent-text);
                    font-size: calc(var(--avatar-size, 34px) * 0.45);
                    font-weight: bold;
                    text-transform: uppercase;
                    user-select: none;
                }
            </style>

            <div class="avatar" aria-hidden="true"></div>
        `;

        this.avatarElement = shadow.querySelector('.avatar')!;
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    get username(): string {
        return this.getAttribute('username') || 'Unknown';
    }

    set username(value: string) {
        this.setAttribute('username', value);
    }

    get size(): number {
        return Number(this.getAttribute('size')) || 34;
    }

    set size(value: number) {
        this.setAttribute('size', String(value));
    }

    private render() {
        const username = this.username;

        this.avatarElement.textContent = username.charAt(0) || '?';
        this.style.setProperty('--avatar-size', `${this.size}px`);
        this.setAttribute('aria-label', `${username}'s avatar`);
    }
}

customElements.define('user-avatar', UserAvatar);
