console.log('ShipModes module loaded');

import ShipDefinitions, {
    ShipDefinition,
    ShipType,
} from '@super-netcentric-battleship/shared/Game/ShipDefinitions.js';

const ships: ShipDefinition[] = Object.values(ShipType)
    .filter((x) => typeof x === 'number')
    .map((x) => ShipDefinitions[x]);

export default class ShipModes extends HTMLElement {
    private outsideClickHandler?: (event: MouseEvent) => void;
    private menu: HTMLElement;

    connectedCallback() {
        this.addEventListener('send-allowed-ship-types', this.handleAllowedShips);
    }

    disconnectedCallback() {
        this.removeEventListener('send-allowed-ship-types', this.handleAllowedShips);

        if (this.outsideClickHandler) {
            document.removeEventListener('click', this.outsideClickHandler);
        }
    }

    constructor() {
        super();
        this.innerHTML = /*html*/ `
            <div class="ship-modes-wrapper">
                <div class="ship-modes-dropdown">
                    <button
                        type="button"
                        class="ship-modes-trigger"
                        aria-label="Select Ship Mode"
                        aria-expanded="false"
                        aria-haspopup="true"
                    >
                        <span class="ship-modes-selected">
                            Select Ship Mode
                        </span>
                        <span class="ship-modes-arrow">▾</span>
                    </button>

                    <div class="ship-modes-menu">
                        ${ships
                            .map(
                                (mode) => `
                                    <button
                                        type="button"
                                        class="ship-modes-option"
                                        data-mode="${mode.type}"
                                        aria-selected="false"
                                    >
                                        ${mode.name} (${mode.value})
                                    </button>
                                `,
                            )
                            .join('')}
                    </div>

                    <div
                        class="ship-modes-tooltip"
                        role="status"
                    >
                        <strong
                            class="ship-modes-tooltip-title"
                        ></strong>

                        <p
                            class="ship-modes-tooltip-description"
                        ></p>
                    </div>
                </div>
            </div>
        `;

        this.setupEvents();
    }

    private setupEvents() {
        const trigger = this.querySelector<HTMLButtonElement>('.ship-modes-trigger')!;

        this.menu = this.querySelector<HTMLElement>('.ship-modes-menu')!;

        const tooltip = this.querySelector<HTMLElement>('.ship-modes-tooltip')!;

        const selectedLabel = this.querySelector<HTMLElement>('.ship-modes-selected')!;

        const title = this.querySelector<HTMLElement>('.ship-modes-tooltip-title')!;

        const description = this.querySelector<HTMLElement>('.ship-modes-tooltip-description')!;

        // Close dropdown
        const closeMenu = () => {
            this.menu.classList.remove('open');
            tooltip.classList.remove('visible');
            trigger.setAttribute('aria-expanded', 'false');
        };

        // Open or close dropdown
        trigger.addEventListener('click', (event) => {
            event.stopPropagation();

            const isOpen = this.menu.classList.toggle('open');

            trigger.setAttribute('aria-expanded', String(isOpen));

            if (!isOpen) {
                tooltip.classList.remove('visible');
            }
        });

        // Individual ship modes
        this.querySelectorAll<HTMLButtonElement>('.ship-modes-option').forEach((option) => {
            const id = Number(option.dataset.mode);
            const mode: ShipDefinition = ShipDefinitions[id];

            if (!mode) return;

            const showDescription = () => {
                title.textContent = `${mode.name} (${mode.value})`;
                description.textContent = mode.description + '\n';
                tooltip.classList.add('visible');
            };

            // Show description on hover
            option.addEventListener('mouseenter', showDescription);

            // Also support keyboard focus
            option.addEventListener('focus', showDescription);

            option.addEventListener('mouseleave', () => {
                tooltip.classList.remove('visible');
            });

            option.addEventListener('blur', () => {
                tooltip.classList.remove('visible');
            });

            // Select a mode
            option.addEventListener('click', (event) => {
                event.stopPropagation();

                selectedLabel.textContent = `${mode.name} (${mode.value})`;

                this.querySelectorAll('.ship-modes-option').forEach((item) => {
                    item.setAttribute('aria-selected', String(item === option));
                });

                // Notify the application
                this.dispatchEvent(
                    new CustomEvent('ship-mode-change', {
                        detail: {
                            modeId: mode.type,
                            name: mode.name,
                            description: mode.description,
                        },
                        bubbles: true,
                        composed: true,
                    }),
                );

                closeMenu();
            });
        });

        // Shadow DOM-safe outside click handling
        this.outsideClickHandler = (event: MouseEvent) => {
            const path = event.composedPath();

            if (!path.includes(this)) {
                closeMenu();
            }
        };

        document.addEventListener('click', this.outsideClickHandler);

        // Close dropdown with Escape
        this.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMenu();
                trigger.focus();
            }
        });
    }

    private handleAllowedShips = (event: Event) => {
        const customEvent = event as CustomEvent<ShipType[]>;
        const allowedTypes = new Set(customEvent.detail);

        this.menu.querySelectorAll<HTMLButtonElement>('.ship-modes-option').forEach((option) => {
            const modeId = Number(option.dataset.mode);

            option.hidden = !allowedTypes.has(modeId);
        });
    };
}

if (!customElements.get('ship-modes')) {
    customElements.define('ship-modes', ShipModes);
}
