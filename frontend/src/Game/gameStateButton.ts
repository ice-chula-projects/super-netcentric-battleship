import { GameState } from '@super-netcentric-battleship/shared/Game/GameState.js';
import { GameManager } from './GameManager';

const gameStateButton = document.getElementById('game-manager-state') as HTMLButtonElement;

export function updateGameStateButton(gameManager: GameManager) {
    const state = gameManager.currentGameState;

    switch (state) {
        case GameState.ShipPlacement:
            if (gameStateButton.textContent !== 'Fleet Submitted') {
                gameStateButton.ariaDisabled = 'false';
                gameStateButton.toggleAttribute('disabled', false);
                gameStateButton.textContent = 'Submit Fleet';
            }
            gameStateButton.hidden = false;
            gameStateButton.onclick = () => {
                gameManager.submitFleet();
                gameStateButton.ariaDisabled = 'true';
                gameStateButton.toggleAttribute('disabled', true);
                gameStateButton.textContent = 'Fleet Submitted';
            };
            break;

        case GameState.End:
            if (gameStateButton.textContent !== 'Rematch Requested') {
                gameStateButton.ariaDisabled = 'false';
                gameStateButton.toggleAttribute('disabled', false);
                gameStateButton.textContent = 'Rematch';
            }
            gameStateButton.hidden = false;
            gameStateButton.onclick = () => {
                gameManager.requestRematch();
                gameStateButton.ariaDisabled = 'true';
                gameStateButton.toggleAttribute('disabled', true);
                gameStateButton.textContent = 'Rematch Requested';
            };
            break;

        default:
            gameStateButton.hidden = true;
            gameStateButton.onclick = null;
            break;
    }
}
