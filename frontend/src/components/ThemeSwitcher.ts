import { appStyles } from '../styles/styles';

class ThemeSwitcher extends HTMLElement {
    private _button: HTMLButtonElement;
    static observedAttributes = ['theme'];

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [appStyles];
        this.shadowRoot.innerHTML = /* html */ `
            <style>
                :host {
                    display: inline-block;
                }

                .icon-moon {
                    fill: currentColor;
                    stroke: none;
                }

                .icon-sun {
                    display: none;
                }

                :host([theme="dark"]) .icon-moon {
                    display: none;
                }

                :host([theme="dark"]) .icon-sun {
                    display: block;
                }
            </style>

            <button
                class="icon"
                type="button"
                aria-label="Switch to dark mode"
                aria-pressed="false"
              >
                  <svg
                      class="icon-moon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                  >
                    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
                </svg>

                <svg
                    class="icon-sun"
                    viewBox="0 0 24 24"
                    aria-hidden="true">
                        <circle cx="12" cy="12" r="4"/>
                        <path d="M12 2v2M12 20v2
                           M4.9 4.9l1.4 1.4
                           M17.7 17.7l1.4 1.4
                           M2 12h2M20 12h2
                           M4.9 19.1l1.4-1.4
                           M17.7 6.3l1.4-1.4"
                        />
                    </svg>
            </button>
        `;

        this._button = this.shadowRoot.querySelector('button');

        this._button.addEventListener('click', () => {
            this.toggle();
        });
    }

    connectedCallback() {
        if (!this.hasAttribute('theme')) {
            const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';

            this.setAttribute('theme', preferredTheme);
        } else {
            this._applyTheme(this.theme);
        }
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'theme' && oldValue !== newValue) {
            if (newValue !== 'light' && newValue !== 'dark') {
                return;
            }

            this._applyTheme(newValue);
        }
    }

    get theme() {
        return this.getAttribute('theme') || 'light';
    }

    set theme(value) {
        if (!['light', 'dark'].includes(value)) {
            throw new Error('Theme must be "light" or "dark"');
        }

        this.setAttribute('theme', value);
    }

    get isDark() {
        return this.theme === 'dark';
    }

    toggle() {
        this.theme = this.isDark ? 'light' : 'dark';
    }

    setTheme(theme: string) {
        this.theme = theme;
    }

    _applyTheme(theme: string) {
        const isDark = theme === 'dark';

        // Update the document theme.
        document.documentElement.setAttribute('data-theme', theme);

        // Update button accessibility.
        this._button.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);

        this._button.setAttribute('aria-pressed', String(isDark));

        // Notify external listeners.
        this.dispatchEvent(
            new CustomEvent('theme-change', {
                detail: {
                    theme,
                    isDark,
                },
                bubbles: true,
                composed: true,
            }),
        );
    }
}

customElements.define('theme-switcher', ThemeSwitcher);
