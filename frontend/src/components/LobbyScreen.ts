
import { LobbyManager } from "../Game/LobbyManager";
import { Player } from "@super-netcentric-battleship/shared/Game/Player.js";
import { appStyles } from "../styles";

export default class LobbyScreen extends HTMLElement {
  private lobbyManager!: LobbyManager;

  private nameInput!: HTMLInputElement;
  private descriptionInput!: HTMLInputElement;
  private publicCheckbox!: HTMLInputElement;
  private joinCodeInput!: HTMLInputElement;
  private lobbyList!: HTMLDivElement;
  private lobbyDetails!: HTMLDivElement;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [appStyles];

    // HTML
    shadow.innerHTML = /* html */`
      <style>
        :host {
          color: var(--color-satellite-accent);
        }

        :host([popover]) {
          box-sizing: border-box;
          max-height: calc(100dvh - 2rem);
          overflow-y: auto;
          overscroll-behavior: contain;
        }

        .screen {
          max-width: 1100px;
          margin: 2rem auto;
          padding: 1.5rem;
          margin-top: 1rem;
          padding-top: 0;
        }

        h1 {
          margin-top: 0;
          text-align: center;
          padding-bottom: 1rem;
        }
        h2, h3 {
          margin-top: 0;
        }

        .panels {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.5rem;
        }

        .panel {
          padding: 1.5rem;
          border-radius: 16px;
          background: var(--color-satellite-foreground-focus);
          box-shadow: 0 4px 12px #00000020;
        }

        input, textarea, button {
          box-sizing: border-box;
          font: inherit;
        }

        input, textarea {
          width: 100%;
          padding: 0.75rem;
          margin: 0.4rem 0 1rem;
          border: 2px solid var(--color-satellite-foreground-border);
          border-radius: 8px;
          background: var(--color-satellite-foreground);
          color: #263a3a;
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        button {
          padding: 0.65rem 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .lobby-entry {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid var(--color-satellite-foreground-border);
        }

        .lobby-entry p {
          margin: 0.25rem 0;
        }

        .muted {
          opacity: 0.7;
          font-size: 0.9rem;
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
        }

        .player {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          margin: 0.5rem 0;
          border-radius: 8px;
          background: var(--color-satellite-foreground);
          color: #263a3a;
        }

        .status {
          font-size: 0.85rem;
          font-weight: bold;
        }

        .ready {
          color: green;
        }

        .not-ready {
          color: #a66b22;
        }

        .hidden {
          display: none;
        }
        
        form .checkbox-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        form button {
          width: auto;
          padding: 0.75rem 1rem
        }

        @media (max-width: 700px) {
          .panels {
            grid-template-columns: 1fr;
          }

          .screen {
            padding: 1rem;
          }
        }
      </style>

      <main class="screen">
        <h1 class="space-mono-bold">Game Lobby</h1>

        <section id="lobby-browser">
          <div class="panels">
            <div class="panel">
              <h2 class="space-grotesk-medium">Create a Lobby</h2>

              <form id="create-lobby-form">
                <label for="lobby-name">Lobby Name</label>
                <input id="lobby-name" required maxlength="40" placeholder="My Lobby">

                <label for="lobby-description">Description</label>
                <textarea id="lobby-description" maxlength="200" placeholder="Description..."></textarea>

                <div style="display:flex; justify-content: space-between; margin-top: 0.5rem">
                  <div class="checkbox-wrapper">
                    <label for="public-checkbox">Public</label>
                    <input id="public-checkbox" type="checkbox" checked>
                  </div>
                  <br>
                  <button type="submit">Create Lobby</button>
                </div>
              </form>
            </div>

            <div class="panel">
              <h2 class="space-grotesk-medium">Join by Code</h2>

              <form id="join-lobby-form">
                <label for="join-code">Lobby Code</label>
                <input id="join-code" required placeholder="Enter lobby code">
                <button type="submit" style="margin-top:0.5rem">Join Lobby</button>
              </form>
            </div>
          </div>

          <section class="panel" style="margin-top: 1.5rem">
            <h2 class="space-grotesk-medium">Public Lobbies</h2>

            <div id="lobby-list">
              <p class="muted">No lobbies loaded.</p>
            </div>

            <div class="pagination">
              <button id="previous-page" disabled>Previous</button>
              <span id="page-label">Page 0 of 0</span>
              <button id="next-page" disabled>Next</button>
            </div>
          </section>
        </section>

        <section id="lobby-details" class="panel hidden">
          <h2 id="current-lobby-name"></h2>
          <p id="current-lobby-description" class="muted"></p>
          <p>Lobby code: <strong id="current-lobby-code"></strong></p>

          <h3>Players</h3>
          <div id="player-list"></div>

          <button id="ready-button">Ready</button>
          <button id="start-button" class="hidden">Start Game</button>
          <button id="leave-button">Leave Lobby</button>
        </section>
      </main>
    `;

    // Element references
    this.nameInput = shadow.querySelector("#lobby-name")!;
    this.descriptionInput = shadow.querySelector("#lobby-description")!;
    this.publicCheckbox = shadow.querySelector("#public-checkbox")!;
    this.joinCodeInput = shadow.querySelector("#join-code")!;
    this.lobbyList = shadow.querySelector("#lobby-list")!;
    this.lobbyDetails = shadow.querySelector("#lobby-details")!;

    // Event handlers
    shadow.querySelector("#create-lobby-form")!
      .addEventListener("submit", (event) => {
        event.preventDefault();

        this.lobbyManager.createLobby(
          this.nameInput.value.trim(),
          this.descriptionInput.value.trim(),
          this.publicCheckbox.checked
        );
      });

    shadow.querySelector("#join-lobby-form")!
      .addEventListener("submit", (event) => {
        event.preventDefault();
        this.lobbyManager.joinLobby(this.joinCodeInput.value.trim());
      });

    shadow.querySelector("#previous-page")!
      .addEventListener("click", () => {
        const page = this.lobbyManager.currentPublicLobbyPage;
        if (page > 0) {
          this.lobbyManager.requestPublicLobbies(page - 1);
        }
      });

    shadow.querySelector("#next-page")!
      .addEventListener("click", () => {
        const page = this.lobbyManager.currentPublicLobbyPage;
        if (page + 1 < this.lobbyManager.totalPages) {
          this.lobbyManager.requestPublicLobbies(page + 1);
        }
      });

    shadow.querySelector("#ready-button")!
      .addEventListener("click", () => {
        this.lobbyManager.updateReadyState(true);
      });

    shadow.querySelector("#start-button")!
      .addEventListener("click", () => {
        this.lobbyManager.startGame();
      });

    shadow.querySelector("#leave-button")!
      .addEventListener("click", () => {
        this.lobbyManager.exitLobby();
      });
  }

  set manager(manager: LobbyManager) {
    this.lobbyManager = manager;

    this.lobbyManager.addEventListener("state-change", this.render);
    this.lobbyManager.requestPublicLobbies(0);
    this.render();
  }

  private render = () => {
    const lobby = this.lobbyManager.currentLobbyInfo;
    const browser = this.shadowRoot!.querySelector("#lobby-browser")!;

    browser.classList.toggle("hidden", lobby !== null);
    this.lobbyDetails.classList.toggle("hidden", lobby === null);

    if (lobby === null) {
      this.renderPublicLobbies();
      return;
    }

    this.shadowRoot!.querySelector("#current-lobby-name")!.textContent = lobby.name;
    this.shadowRoot!.querySelector("#current-lobby-description")!.textContent = lobby.description;
    this.shadowRoot!.querySelector("#current-lobby-code")!.textContent = lobby.lobbyCode;

    this.renderPlayers(lobby.connectedUsers);
  };

  private renderPublicLobbies() {
    const manager = this.lobbyManager;

    this.lobbyList.replaceChildren();

    for (const lobby of manager.publicLobbies ?? []) {
      const entry = document.createElement("div");
      entry.className = "lobby-entry";

      const information = document.createElement("div");

      const name = document.createElement("strong");
      name.textContent = lobby.name;

      const description = document.createElement("p");
      description.textContent = lobby.description;

      const members = document.createElement("p");
      members.className = "muted";
      members.textContent = `${lobby.memberCount} player(s)`;

      information.append(name, description, members);

      const joinButton = document.createElement("button");
      joinButton.textContent = "Join";
      joinButton.addEventListener("click", () => {
        manager.joinLobby(lobby.lobbyCode);
      });

      entry.append(information, joinButton);
      this.lobbyList.appendChild(entry);
    }

    const previousButton = this.shadowRoot!.querySelector<HTMLButtonElement>("#previous-page")!;
    const nextButton = this.shadowRoot!.querySelector<HTMLButtonElement>("#next-page")!;

    previousButton.disabled = manager.currentPublicLobbyPage <= 0;
    nextButton.disabled = manager.currentPublicLobbyPage + 1 >= manager.totalPages;

    this.shadowRoot!.querySelector("#page-label")!.textContent =
      `Page ${manager.totalPages === 0 ? 0 : manager.currentPublicLobbyPage + 1} of ${manager.totalPages}`;
  }

  private renderPlayers(players: {
    userId: string;
    username: string;
    isHost: boolean;
    playerId: Player;
    ready: boolean;
  }[]) {
    const playerList = this.shadowRoot!.querySelector("#player-list")!;
    playerList.replaceChildren();

    for (const player of players) {
      const element = document.createElement("div");
      element.className = "player";

      const name = document.createElement("span");
      name.textContent = `${player.username}${player.isHost ? " (Host)" : ""}`;

      const status = document.createElement("span");
      status.className = `status ${player.ready ? "ready" : "not-ready"}`;
      status.textContent = player.ready ? "Ready" : "Not Ready";

      element.append(name, status);
      playerList.appendChild(element);
    }

    const currentPlayer = players.find(player => player.isHost);
    const readyButton = this.shadowRoot!.querySelector<HTMLButtonElement>("#ready-button")!;
    const startButton = this.shadowRoot!.querySelector<HTMLButtonElement>("#start-button")!;

    readyButton.textContent = "Toggle Ready";
    startButton.classList.toggle("hidden", !currentPlayer);
  }

  disconnectedCallback() {
    this.lobbyManager?.removeEventListener("state-change", this.render);
  }
}

customElements.define("lobby-screen", LobbyScreen);
