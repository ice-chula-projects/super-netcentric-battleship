import { appStyles } from '../styles';

type ChatAuthor = {
    username: string;
};

export default class ChatMessage extends HTMLElement {
    private authorElement: HTMLElement;
    private avatarElement: HTMLElement;
    private timestampElement: HTMLTimeElement;
    private messageElement: HTMLElement;

    private _author: ChatAuthor = { username: 'Unknown' };
    private _timestamp: Date = new Date();
    private _messageText = '';

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [appStyles];

        shadow.innerHTML = /* html */ `
            <style>
                :host {
                    display: block;
                    margin: 0.5rem 0;
                    font-family: inherit;
                }
            
                article {
                    display: flex;
                    gap: 0.75rem;
                    padding: 0.85rem 1rem;
                    border-radius: 10px;
                    background: var(--color-satellite-foreground, #f3fffb);
                    border: 1px solid var(--color-satellite-foreground-border, #89a4a4);
                    transition:
                        background 150ms ease,
                        border-color 150ms ease;
                }
            
                .avatar {
                    flex: 0 0 34px;
                    width: 34px;
                    height: 34px;
                    display: grid;
                    place-items: center;
                    border-radius: 50%;
                    background: var(--color-satellite-base, #baccd0);
                    color: var(--color-satellite-foreground, #f3fffb);
                    font-size: 0.9rem;
                    font-weight: bold;
                    text-transform: uppercase;
                }
            
                .content {
                    flex: 1;
                    min-width: 0;
                }
            
                .metadata {
                    display: flex;
                    align-items: baseline;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 0.35rem;
                }
            
                .author {
                    font-weight: bold;
                    font-size: 0.9rem;
                    color: var(--color-satellite-foreground-border, #526b6b);
                }
            
                time {
                    color: #849393;
                    font-size: 0.7rem;
                }
            
                .message {
                    margin: 0;
                    color: #263a3a;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    white-space: pre-wrap;
                    overflow-wrap: anywhere;
                }
            </style>
            <article>
                <div class="avatar" aria-hidden="true"></div>
            
                <div class="content">
                    <div class="metadata">
                        <span class="author"></span>
                        <time></time>
                    </div>
                    <p class="message"></p>
                </div>
            </article>
        `;

        this.authorElement = shadow.querySelector('.author')!;
        this.avatarElement = shadow.querySelector('.avatar')!;
        this.timestampElement = shadow.querySelector('time')!;
        this.messageElement = shadow.querySelector('.message')!;
        this.render();
    }

    get author(): ChatAuthor {
        return this._author;
    }

    set author(value: ChatAuthor) {
        this._author = value;
        this.render();
    }

    get timestamp(): Date {
        return this._timestamp;
    }

    set timestamp(value: Date) {
        this._timestamp = value;
        this.render();
    }

    get messageText(): string {
        return this._messageText;
    }

    set messageText(value: string) {
        this._messageText = value;
        this.render();
    }

    connectedCallback() {
        this.setAttribute('role', 'listitem');
    }

    private render() {
        const username = this._author.username || 'Unknown';

        this.authorElement.textContent = username;
        this.avatarElement.textContent = username.charAt(0);
        this.messageElement.textContent = this._messageText;

        if (this._timestamp instanceof Date && !isNaN(this._timestamp.getTime())) {
            this.timestampElement.dateTime = this._timestamp.toISOString();
            this.timestampElement.textContent = this._timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });
            this.timestampElement.title = this._timestamp.toLocaleString();
        } else {
            this.timestampElement.textContent = '';
            this.timestampElement.removeAttribute('datetime');
        }
    }
}

customElements.define('chat-message', ChatMessage);
