import { GameState } from '@super-netcentric-battleship/shared/Game/GameState.js';
import { GameManager } from './GameManager';

const gameStateButton = document.getElementById('game-manager-state') as HTMLButtonElement;

export function updateGameStateButton(gameManager: GameManager) {
    const state = gameManager.currentGameState;

    switch (state) {
        case GameState.ShipPlacement:
            gameStateButton.textContent = 'Submit Fleet';
            gameStateButton.hidden = false;
            gameStateButton.onclick = () => {
                gameManager.submitFleet();
            };
            break;

        case GameState.End:
            gameStateButton.textContent = 'Rematch';
            gameStateButton.hidden = false;
            gameStateButton.onclick = () => {
                gameManager.requestRematch()
            };
            break;

        default:
            gameStateButton.hidden = true;
            gameStateButton.onclick = null;
            break;
    }
}
