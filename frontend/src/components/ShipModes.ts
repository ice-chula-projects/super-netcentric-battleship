
type ShipMode = {
    id: number;
    name: string;
    description: string;
};

// Temporary data until your friend's ShipDefinition is ready.
const shipModes: ShipMode[] = Array.from(
    { length: 36 },
    (_, id) => ({
        id,
        name: `Mode ${id}`,
        description: `Description for Ship Mode ${id}.`,
    }),
);

export default class ShipModes extends HTMLElement {
    private outsideClickHandler?: (event: MouseEvent) => void;

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {
        if (this.outsideClickHandler) {
            document.removeEventListener(
                'click',
                this.outsideClickHandler,
            );
        }
    }

    private render() {
        this.innerHTML = `
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
                        ${shipModes
                            .map(
                                (mode) => `
                                    <button
                                        type="button"
                                        class="ship-modes-option"
                                        data-mode="${mode.id}"
                                        aria-selected="false"
                                    >
                                        ${mode.name}
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
        const trigger = this.querySelector<HTMLButtonElement>(
            '.ship-modes-trigger',
        )!;

        const menu = this.querySelector<HTMLElement>(
            '.ship-modes-menu',
        )!;

        const tooltip = this.querySelector<HTMLElement>(
            '.ship-modes-tooltip',
        )!;

        const selectedLabel = this.querySelector<HTMLElement>(
            '.ship-modes-selected',
        )!;

        const title = this.querySelector<HTMLElement>(
            '.ship-modes-tooltip-title',
        )!;

        const description = this.querySelector<HTMLElement>(
            '.ship-modes-tooltip-description',
        )!;

        // Close dropdown
        const closeMenu = () => {
            menu.classList.remove('open');
            tooltip.classList.remove('visible');
            trigger.setAttribute('aria-expanded', 'false');
        };

        // Open or close dropdown
        trigger.addEventListener('click', (event) => {
            event.stopPropagation();

            const isOpen = menu.classList.toggle('open');

            trigger.setAttribute(
                'aria-expanded',
                String(isOpen),
            );

            if (!isOpen) {
                tooltip.classList.remove('visible');
            }
        });

        // Individual ship modes
        this.querySelectorAll<HTMLButtonElement>(
            '.ship-modes-option',
        ).forEach((option) => {
            const id = Number(option.dataset.mode);
            const mode = shipModes[id];

            if (!mode) return;

            const showDescription = () => {
                title.textContent = mode.name;
                description.textContent = mode.description;
                tooltip.classList.add('visible');
            };

            // Show description on hover
            option.addEventListener(
                'mouseenter',
                showDescription,
            );

            // Also support keyboard focus
            option.addEventListener(
                'focus',
                showDescription,
            );

            option.addEventListener('mouseleave', () => {
                tooltip.classList.remove('visible');
            });

            option.addEventListener('blur', () => {
                tooltip.classList.remove('visible');
            });

            // Select a mode
            option.addEventListener('click', (event) => {
                event.stopPropagation();

                selectedLabel.textContent = mode.name;

                this.querySelectorAll(
                    '.ship-modes-option',
                ).forEach((item) => {
                    item.setAttribute(
                        'aria-selected',
                        String(item === option),
                    );
                });

                // Notify the application
                this.dispatchEvent(
                    new CustomEvent('ship-mode-change', {
                        detail: {
                            modeId: mode.id,
                            name: mode.name,
                            description: mode.description,
                        },
                        bubbles: true,
                        composed: true,
                    }),
                );

                console.log(
                    'Selected Ship Mode:',
                    mode.id,
                    mode.name,
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

        document.addEventListener(
            'click',
            this.outsideClickHandler,
        );

        // Close dropdown with Escape
        this.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMenu();
                trigger.focus();
            }
        });
    }
}

if (!customElements.get('ship-modes')) {
    customElements.define('ship-modes', ShipModes);
}
