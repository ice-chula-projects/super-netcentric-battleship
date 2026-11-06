import { appStyles } from '../styles/styles';
import ChatMessage from './ChatMessage';

type ChatAuthor = {
    username: string;
};

export default class ChatSidebar extends HTMLElement {
    private messagesElement!: HTMLUListElement;
    private messageInput!: HTMLTextAreaElement;
    private channelSelect!: HTMLSelectElement;

    private _isOpen = true;

    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [appStyles];
        shadow.innerHTML = /* html */ `
            <style>
                :host {
                    display: block;
                    overflow: visible;
                }

                aside {
                    display-style: border-box;
                    border-left: 2px solid var(--border);
                }

                :host([collapsed]) aside {
                    transform: translateX(100%);
                    pointer-events: none;
                }

                .chat-header {
                    flex: 0 0 auto;
                    padding: 1.5rem 2rem 1rem;
                    text-align: right;
                }

                h2 {
                    margin: 0;
                    color: #465f80;
                    font-size: 1.8rem;
                }

                .messages {
                    flex: 1;
                    min-height: 0;
                    min-width: 0;

                    overflow-y: scroll;
                    overflow-x: hidden;

                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;

                    list-style: none;
                    margin: 0;
                    padding-top: 1rem;
                    padding-bottom: 1rem;
                    margin-bottom: 17rem;
                }

                .composer {
                    --collapsed-transform: translateX(100%);

                    position: fixed;
                    bottom: 0;
                    right: 0;

                    width: min(calc(var(--sidebar-width) + 2rem), 100vw);
                    box-sizing: border-box;

                    padding: 1.5rem 2rem;

                    background: var(--surface-2);
                    border-top: 2px solid var(--border);
                    border-left: 2px solid var(--border);
                    border-radius: 24px 0 0 0;
                    box-shadow: 0 -4px 8px #00000015;

                    z-index: 11;
                    transition: transform 300ms ease;
                }

                :host([collapsed]) .composer {
                    transform: var(--collapsed-transform);
                }

                :host([suppress-transition]) .composer {
                    transition: none !important;
                }

                textarea {
                    display: block;
                    width: 100%;
                    min-height: 110px;
                    max-height: 220px;
                    resize: vertical;
                    box-sizing: border-box;

                    padding: 1rem;
                    border: 2px solid var(--border);
                    border-radius: 12px;

                    background: var(--surface);
                    color: var(--text);
                    font: inherit;
                    font-size: 1rem;
                }

                textarea:focus {
                    outline: 2px solid var(--focus);
                    outline-offset: 2px;
                }

                .composer-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 0.75rem;
                }

                select {
                    min-width: 0;
                    padding: 0.5rem 1rem;
                    border: 2px solid var(--border);
                    border-radius: 10px;
                    background: var(--surface);
                    color: var(--text);
                    font: inherit;
                    font-size: 14px;
                    appearance: none;
                    -webkit-appearance: none;

                    padding: 0.5rem 2.5rem 0.5rem 1rem;

                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%23465f80' stroke-width='1.5'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                    background-size: 12px;
                }

                button.send {
                    padding: 0.75rem 1rem;
                }

                span.icon {
                    width: 24px;
                    height: 24px;
                }

                @media (max-width: 639px) {
                    aside {
                        width: 100vw;
                    }

                    .chat-header {
                        padding: 1rem;
                    }

                    .messages {
                        padding: 0.75rem;
                    }

                    .composer {
                        width: 100vw;
                        border-left: none;
                        border-radius: 0;
                        padding: 1rem;
                    }

                    :host([collapsed]) .composer {
                        --collapsed-transform: translateY(100%);
                    }
                }
            </style>

            <aside id="chat-sidebar">
                <div class="chat-header">
                    <h2 class="section-title">
                        <span class="icon" aria-hidden="true">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 -960 960 960"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.7"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M240-399h313v-60H240v60Zm0-130h480v-60H240v60Zm0-130h480v-60H240v60ZM80-80v-740q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H240L80-80Zm134-220h606v-520H140v600l74-80Zm-74 0v-520 520Z"
                                    fill="currentColor"
                                ></path>
                            </svg>
                        </span>
                            Global Chat
                        
                    </h2>
                </div>
                <hr>
                <ul class="messages" id="messages" aria-label="Chat messages"></ul>
            </aside>
            <form class="composer" id="message-form">
                <textarea
                    id="message-input"
                    placeholder="Enter message..."
                    aria-label="Enter message"
                ></textarea>

                <div class="composer-controls">
                    <select id="channel-select" aria-label="Chat channel">
                        <option value="global">Global Chat</option>
                    </select>

                    <button type="submit" class="send" id="send-button">Send</button>
                </div>
            </form>
        `;

        this.messagesElement = shadow.querySelector('#messages')!;
        this.messageInput = shadow.querySelector('#message-input')!;
        this.channelSelect = shadow.querySelector('#channel-select')!;

        shadow.querySelector('#message-form')!.addEventListener('submit', (event) => {
            event.preventDefault();

            const message = this.messageInput.value;

            if (!message.trim()) {
                return;
            }

            this.dispatchEvent(
                new CustomEvent('send-chat-message', {
                    detail: {
                        message,
                        channelId: this.channelSelect.value,
                    },
                    bubbles: true,
                }),
            );

            this.messageInput.value = '';
        });

        this.messageInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();

                shadow.querySelector<HTMLFormElement>('#message-form')!.requestSubmit();
            }
        });
    }

    get isOpen(): boolean {
        return this._isOpen;
    }

    set isOpen(value: boolean) {
        this._isOpen = value;
        this.toggleAttribute('collapsed', !value);

        this.dispatchEvent(
            new CustomEvent('sidebar-state-change', {
                detail: { isOpen: value },
                bubbles: true,
            }),
        );
    }

    connectedCallback() {
        document.addEventListener('chat-toggle', this.handleToggle);
        this.layoutQuery.addEventListener('change', this.handleLayoutChange);

        if (window.matchMedia('(max-width: 800px)').matches) {
            this.isOpen = false;
        }
    }

    disconnectedCallback() {
        document.removeEventListener('chat-toggle', this.handleToggle);
        this.layoutQuery.removeEventListener('change', this.handleLayoutChange);

        if (this.layoutResetFrame) {
            cancelAnimationFrame(this.layoutResetFrame);
        }
    }

    private handleToggle = () => {
        this.isOpen = !this.isOpen;
    };

    addMessage(author: ChatAuthor, timestamp: Date, messageText: string, isOwn = false) {
        const message = document.createElement('chat-message') as ChatMessage;

        message.author = author;
        message.timestamp = timestamp;
        message.messageText = messageText;
        message.toggleAttribute('mine', isOwn);

        this.messagesElement.appendChild(message);

        this.messagesElement.scrollTop = this.messagesElement.scrollHeight;
    }

    private layoutQuery = window.matchMedia('(max-width: 639px)');
    private layoutResetFrame = 0;

    private handleLayoutChange = () => {
        this.setAttribute('suppress-transition', '');

        if (this.layoutResetFrame) {
            cancelAnimationFrame(this.layoutResetFrame);
        }

        // Keep transitions disabled across a rendered frame so the
        // responsive transform change doesn't animate.
        this.layoutResetFrame = requestAnimationFrame(() => {
            this.layoutResetFrame = requestAnimationFrame(() => {
                this.removeAttribute('suppress-transition');
                this.layoutResetFrame = 0;
            });
        });
    };
}

customElements.define('chat-sidebar', ChatSidebar);
