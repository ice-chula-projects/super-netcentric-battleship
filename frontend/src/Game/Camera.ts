import GameBoard, { BoardTile } from "./Board";
import { BoardTileState } from "@super-netcentric-battleship/shared/Game/BoardTileState.js";
import { GameManager } from "./GameManager";
import { Player } from "@super-netcentric-battleship/shared/Game/Player.js";
import { Orientation } from "@super-netcentric-battleship/shared/Game/Orientation.js";
import { GameState } from "@super-netcentric-battleship/shared/Game/GameState.js";
import ShipDefinitions, { ShipType } from "@super-netcentric-battleship/shared/Game/ShipDefinitions.js";
import Coordinate, { relativeCoordinateToAbsoluteCoordinate } from "@super-netcentric-battleship/shared/Game/Coordinate.js";

//determines if the camera highlights this board as the opponent's board or the player's board
enum BoardHighlightMode {
    Player,
    Opponent
}

interface AttackingShip {
    shipId: number,
    shipType: ShipType
}

export default class Camera {
    canvas: HTMLCanvasElement;
    gameManager: GameManager;

    tileColors: Record<BoardTileState, string> = {
            [BoardTileState.Hidden]: "#5093d4",
            [BoardTileState.DamagedTile]: "red",
            [BoardTileState.DestoyedTile]: "darkred",
            [BoardTileState.DestroyedShip]: "darkblue",
            [BoardTileState.Empty]: "lightgrey",
            [BoardTileState.Ship]: "darkgrey"
        }
    highlightColor: string = "#ffffff55"
    attackingShipHighlightColor: string = "#ff111155"

    strokeColor: string = "black";
    backgroundColor: string = "#5093d4";
    textColor: string = "white";
    textSize: number = 12;
    victoryTextSize: number = 60;
    boardSize: number = 235;
    boardMargin: number = 10;

    selectedBoard: Player | null = null;
    selectedBoardCoordinates: Coordinate = {
        x: null,
        y: null
    }

    timerTextRoundingDecimalPlaces: number = 2;

    currentInputOrientation: Orientation = Orientation.Right;
    // for ship placement
    currentlySelectedShipPlaceType: ShipType = ShipType.Standard;

    // for volley firing
    attackingShip: AttackingShip | null = null;

    intervalId: number;

    #targetFps: number = 60;

    get isRunning() {
        return this.intervalId != null;
    }

    get targetFps(): number {
        return this.#targetFps;
    }

    set targetFps(target: number) {
        this.changeTargetFps(target);
    }

    constructor(canvas: HTMLCanvasElement, gameManager: GameManager) {
        this.canvas = canvas;
        this.gameManager = gameManager;

        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("mousedown", this.handleMouseClick.bind(this));
        document.addEventListener("keydown", this.handleKeyPress.bind(this));
        this.start();
    }

    start() {
        if (this.isRunning) throw new Error("Tried to start a camera that is already running");
        this.intervalId = setInterval(this.render.bind(this), 1000 / this.#targetFps);
    }

    stop() {
        if (!this.isRunning) throw new Error("Tried to stop a camera that isn't running");
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    changeTargetFps(target: number) {
        const wasRunning = this.isRunning;
        if (wasRunning) this.stop();
        this.#targetFps = target;
        if (wasRunning) this.start();
    }

    render() {
        this.clear();
        this.drawBackground();

        if (!this.gameManager.initialized) return;
        this.drawBoards();
        this.drawScoreText();

        if(this.gameManager.currentGameState == GameState.Battle){
            this.drawTimerText();
            this.drawTurnText();
        };

        if(this.gameManager.currentGameState == GameState.End){
            this.drawVictoryText();
        }
        
    }

    handleMouseClick() {
        if (!this.gameManager.matchInProgress) return;
        switch (this.gameManager.currentGameState) {
            case GameState.ShipPlacement:
                if (this.selectedBoard != this.gameManager.playerId) return;
                this.gameManager.addShipToFleet(this.currentlySelectedShipPlaceType, this.selectedBoardCoordinates, this.currentInputOrientation);
                break;
            case GameState.Battle:
                if (this.selectedBoard == this.gameManager.playerId) {
                    const playerBoard = this.gameManager.getPlayerBoard();
                    const selectedTile = playerBoard.getTile(this.selectedBoardCoordinates.x, this.selectedBoardCoordinates.y);

                    if (selectedTile.shipId == null || selectedTile.health <= 0) {
                        this.attackingShip = null;
                    } else {
                        this.attackingShip = {
                            shipId: selectedTile.shipId,
                            shipType: selectedTile.shipType
                        }
                    }

                } else if (this.selectedBoard == this.gameManager.opponentId && this.attackingShip != null && this.gameManager.isPlayersTurn) {
                    this.gameManager.fireVolley(this.attackingShip.shipId, this.selectedBoardCoordinates, this.currentInputOrientation);
                }
        }
    }

    handleMouseMove(mouseEvent: MouseEvent) {
        if (!this.gameManager.matchInProgress) return;

        const mouseX = mouseEvent.offsetX;
        const mouseY = mouseEvent.offsetY;
        const boardStartY = (this.canvas.height-this.boardSize)/2;

        if (mouseY < boardStartY || mouseY > boardStartY + this.boardSize) {
            this.selectedBoard = null;
            this.selectedBoardCoordinates.x = null;
            this.selectedBoardCoordinates.y = null;
            return;
        }

        const boardSize = this.gameManager.currentGameSettings.boardSize;
        const playerBoardStartX = this.boardMargin;
        const playerBoardEndX = this.boardMargin + this.boardSize;
        const enemyBoardStartX = this.canvas.width - this.boardMargin - this.boardSize;
        const enemyBoardEndX = enemyBoardStartX + this.boardSize;

        if (mouseX > playerBoardStartX && mouseX < playerBoardEndX) {
            this.selectedBoard = this.gameManager.playerId;
            const relativeX = mouseX - playerBoardStartX;
            const relativeY = mouseY - boardStartY;
            this.selectedBoardCoordinates.x = Math.floor(boardSize * relativeX / (this.boardSize));
            this.selectedBoardCoordinates.y = Math.floor(boardSize * relativeY / (this.boardSize));
        } else if (mouseX > enemyBoardStartX && mouseX < enemyBoardEndX) {
            this.selectedBoard = this.gameManager.opponentId;
            const relativeX = mouseX - enemyBoardStartX;
            const relativeY = mouseY - boardStartY;
            this.selectedBoardCoordinates.x = Math.floor(boardSize * relativeX / (this.boardSize));
            this.selectedBoardCoordinates.y = Math.floor(boardSize * relativeY / (this.boardSize));
        }
        else {
            this.selectedBoard = null;
            this.selectedBoardCoordinates.x = null;
            this.selectedBoardCoordinates.y = null;
        }
    }

    handleKeyPress(keyboardEvent: KeyboardEvent) {
        if (!this.gameManager.matchInProgress) return;

        switch (keyboardEvent.key) {
            case "Tab":
                keyboardEvent.preventDefault();
                const orientations = [Orientation.Right, Orientation.Down, Orientation.Left, Orientation.Up];
                const currentOrientationIndex = orientations.indexOf(this.currentInputOrientation);

                const nextOrientationIndex = keyboardEvent.shiftKey ? currentOrientationIndex - 1 : currentOrientationIndex + 1;
                this.currentInputOrientation = orientations.at(nextOrientationIndex % 4);
                break;
        }
    }

    drawBackground() {
        const context = this.canvas.getContext("2d");
        context.fillStyle = this.backgroundColor;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBoards() {
        this.drawBoard(this.gameManager.getPlayerBoard(), this.boardMargin, (this.canvas.height-this.boardSize)/2, this.boardSize, "Player's Board", BoardHighlightMode.Player);
        this.drawBoard(this.gameManager.getOpponentBoard(), this.canvas.width - this.boardMargin - this.boardSize, (this.canvas.height-this.boardSize)/2, this.boardSize, "Opponent's Board", BoardHighlightMode.Opponent);
    }

    drawBoard(board: GameBoard, x: number, y: number, size: number, label: string, highlightMode: BoardHighlightMode) {
        let currentX = x;
        let currentY = y;
        const boardSize = board.size;
        const deltaX = size / boardSize;
        const deltaY = size / boardSize;

        const context = this.canvas.getContext("2d");
        context.strokeStyle = this.strokeColor
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                const tile = board.getTile(i, j);
                const color = this.tileColors[tile.state]

                context.fillStyle = color;
                context.fillRect(currentX, currentY, deltaX, deltaY);
                context.strokeRect(currentX, currentY, deltaX, deltaY);

                if(tile.health != null){        
                    context.fillStyle = this.textColor;
                    context.font = `${deltaX / 2}px Arial`;
                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    context.fillText(tile.health.toString(), currentX + deltaX/2, currentY + deltaY/2);
                    context.textBaseline = "bottom";
                }

                if(this.attackingShip != null && tile.shipId == this.attackingShip.shipId && highlightMode == BoardHighlightMode.Player){
                    if(tile.state == BoardTileState.DestroyedShip){
                        //kinda a bad place to put this logic but time is running low
                        this.attackingShip = null;
                    } else {
                        context.fillStyle = this.attackingShipHighlightColor;
                        context.fillRect(currentX, currentY, deltaX, deltaY);
                    }
                }

                if (this.determineIfTileIsHighlighted(i, j, highlightMode)) {
                    context.fillStyle = this.highlightColor;
                    context.fillRect(currentX, currentY, deltaX, deltaY);
                }

                currentY += deltaY;
            }
            currentY = y;
            currentX += deltaX;
        }
        context.fillStyle = this.textColor;
        context.font = `${this.textSize}px Arial`
        context.textAlign = "left";
        context.fillText(label, x, y + size + this.textSize);
        context.strokeText(label, x, y + size + this.textSize);
    }

    determineIfTileIsHighlighted(x: number, y: number, highlightMode: BoardHighlightMode): boolean {
        let highlight: boolean;
        switch (highlightMode) {
            case BoardHighlightMode.Player:
                highlight = this.determineIfPlayerTileIsHighlighted(x, y);
                break;
            case BoardHighlightMode.Opponent:
                highlight = this.determineIfOpponentTileIsHighlighted(x, y);
                break;
        }

        return highlight;
    }

    determineIfPlayerTileIsHighlighted(x: number, y: number): boolean {
        let highlight = false;

        const playerId = this.gameManager.playerId
        const playerBoard = this.gameManager.getPlayerBoard();
        

        switch (this.gameManager.currentGameState) {
            case GameState.ShipPlacement:
                if (this.selectedBoard != playerId) return false;
                const shipDefinition = ShipDefinitions[this.currentlySelectedShipPlaceType];

                // this is very inefficient, but it should work, since we're redoing the absolute coordinate conversion
                // for every tile, of every frame
                // but a smarter solution will be messy
                for (const hullTile of shipDefinition.hull) {
                    const absoluteCoordinate = relativeCoordinateToAbsoluteCoordinate(hullTile.relativeCoordinate, this.selectedBoardCoordinates, this.currentInputOrientation);
                    if (absoluteCoordinate.x == x && absoluteCoordinate.y == y) return true;
                }
                break;

            //highlight the selected ship in battle mode
            case GameState.Battle:
                const currentTile = playerBoard.getTile(x, y);
                if (this.selectedBoard != playerId) return false;

                const selectedTile = playerBoard.getTile(this.selectedBoardCoordinates.x, this.selectedBoardCoordinates.y);
                if (selectedTile.shipId == null) return false;

                return selectedTile.shipId == currentTile.shipId;

        }

        return highlight
    }

    determineIfOpponentTileIsHighlighted(x: number, y: number): boolean {
        let highlight = false;

        const opponentId = this.gameManager.opponentId
        const opponentBoard = this.gameManager.getOpponentBoard();

        switch (this.gameManager.currentGameState) {
            case GameState.ShipPlacement:
                return false;
                break;
            //highlight attacked squares in battle mode if it's the player's turn
            case GameState.Battle:
                if (this.attackingShip == null || !this.gameManager.isPlayersTurn || this.selectedBoard != opponentId) return false;
                const shipDefinition = ShipDefinitions[this.attackingShip.shipType];

                for (const firingPattern of shipDefinition.firingPattern) {
                    const absoluteCoordinate = relativeCoordinateToAbsoluteCoordinate(firingPattern.relativeCoordinate, this.selectedBoardCoordinates, this.currentInputOrientation);
                    if (absoluteCoordinate.x == x && absoluteCoordinate.y == y) return true;
                }
                break;
        }


        return highlight;
    }

    drawTimerText() {
        const timeSinceLastUpdate = (Date.now() - this.gameManager.lastTurnUpdateTimeStamp) / 1000;
        const remainingTime = Math.max(0, this.gameManager.currentGameSettings.timeLimitPerTurn - timeSinceLastUpdate);

        const context = this.canvas.getContext("2d");
        context.fillStyle = this.textColor;
        context.font = `${this.textSize}px Arial`;
        context.textAlign = "center";
        context.fillText(`${remainingTime.toFixed(this.timerTextRoundingDecimalPlaces)}s`, this.canvas.width / 2, this.textSize * 2);
    }

    drawTurnText() {
        const turnText = this.gameManager.isPlayersTurn? "Your Turn" : "Opponent's Turn"

        const context = this.canvas.getContext("2d");
        context.fillStyle = this.textColor;
        context.font = `${this.textSize}px Arial`
        context.textAlign = "center";
        context.fillText(turnText, this.canvas.width / 2, this.canvas.height - this.textSize);
    }

    drawVictoryText() {
        const victoryText = this.gameManager.matchWinner == this.gameManager.playerId ? "You Win" : "You Lose";
        
        const context = this.canvas.getContext("2d");
        context.fillStyle = this.textColor;
        context.font = `${this.victoryTextSize}px Arial`
        context.textAlign = "center";
        context.fillText(victoryText, this.canvas.width / 2, (this.canvas.height / 2));
        context.strokeText(victoryText, this.canvas.width / 2,(this.canvas.height / 2));

        if(!this.gameManager.rematchReqeuested) return;
        const rematchText = this.gameManager.rematchStatus[this.gameManager.opponentId] ? "Opponent is requesting a rematch" : "Requesting a rematch";
        context.font = `${this.textSize}px Arial`
        context.fillText(rematchText, this.canvas.width / 2, (this.canvas.height / 2) + this.textSize);
    }

    drawScoreText(){
        const scoreText = `${this.gameManager.playerScore} - ${this.gameManager.opponentScore}`;

        const context = this.canvas.getContext("2d");
        context.fillStyle = this.textColor;
        context.font = `${this.textSize}px Arial`
        context.textAlign = "center";
        context.fillText(scoreText, this.canvas.width / 2, this.textSize);
    }

    clear() {
        const context = this.canvas.getContext("2d");
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}