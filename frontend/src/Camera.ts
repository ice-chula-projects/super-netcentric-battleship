import { GameStates } from "@super-netcentric-battleship/shared/ServerMessage.js";
import GameBoard, { BoardTileTypes } from "./Board";
import { Game, Player } from "./Game";

export default class Camera{
    canvas: HTMLCanvasElement;
    game: Game;
    colors: {
        [T in BoardTileTypes]: string
    } = {
        [BoardTileTypes.Empty]: "#5093d4",
        [BoardTileTypes.Hit]: "red",
        [BoardTileTypes.Miss]: "lightgrey",
        [BoardTileTypes.Ship]: "darkgrey",
    }
    highlightColor:string = "#ffffff55"

    strokeColor: string = "black";
    backgroundColor: string = "#5093d4";
    textColor: string = "white";
    textSize: number = 12;

    boardSize: number = 235;
    boardMargin: number = 10;

    selectedBoard: Player | null = null;
    selectedBoardCoordinates: {
        x: number | null,
        y: number | null
    } = {
        x: null,
        y: null
    }

    shipPlaceModeOrientation: "down" | "right" = "down";

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

    constructor(canvas: HTMLCanvasElement, game: Game){
        this.canvas = canvas;
        this.game = game;

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

    render(){
        this.clear();
        this.drawBackground();

        if(this.game.state == GameStates.Forming) return;
        this.drawBoards();
        this.drawBoardHighlight();
        this.drawTurnText();
        this.drawGameId();
    }

    handleMouseClick(){
        switch(this.game.state){
            case GameStates.Deploying:
                if (this.selectedBoard == Player.enemy) return;
                this.game.addShip(this.selectedBoardCoordinates.x, this.selectedBoardCoordinates.y, this.shipPlaceModeOrientation)
            break;
            case GameStates.Fighting:
                if (this.selectedBoard == Player.player || !this.game.playersTurn) return;
                this.game.shoot(this.selectedBoardCoordinates.x, this.selectedBoardCoordinates.y);
                
        }
    }

    handleMouseMove(mouseEvent: MouseEvent){
        const mouseX = mouseEvent.offsetX;
        const mouseY = mouseEvent.offsetY;
        const boardStartY = (this.canvas.height-this.boardSize)/2;
        if(mouseY < boardStartY || mouseY > boardStartY + this.boardSize){
            this.selectedBoard = null;
            this.selectedBoardCoordinates.x = null;
            this.selectedBoardCoordinates.y = null;
            return;
        }
        
        const playerBoardStartX = this.boardMargin;
        const playerBoardEndX = this.boardMargin + this.boardSize;
        const enemyBoardStartX = this.canvas.width - this.boardMargin - this.boardSize;
        const enemyBoardEndX = enemyBoardStartX + this.boardSize;  
        if(mouseX > playerBoardStartX && mouseX < playerBoardEndX){
            this.selectedBoard = Player.player;
            const relativeX = mouseX - playerBoardStartX;
            const relativeY = mouseY - boardStartY;
            this.selectedBoardCoordinates.x = Math.floor(8*relativeX/(this.boardSize));
            this.selectedBoardCoordinates.y = Math.floor(8*relativeY/(this.boardSize));
        } else if(mouseX > enemyBoardStartX && mouseX < enemyBoardEndX){
            this.selectedBoard = Player.enemy;
            const relativeX = mouseX - enemyBoardStartX;
            const relativeY = mouseY - boardStartY;
            this.selectedBoardCoordinates.x = Math.floor(8*relativeX/(this.boardSize));
            this.selectedBoardCoordinates.y = Math.floor(8*relativeY/(this.boardSize));
        }
        else {
            this.selectedBoard = null;
            this.selectedBoardCoordinates.x = null;
            this.selectedBoardCoordinates.y = null;
        }
    }

    handleKeyPress(keyboardEvent: KeyboardEvent){
        switch(keyboardEvent.key){
            case "Tab":
                keyboardEvent.preventDefault();
                this.togglePlaceModeOrientation();
                break;
        }
    }

    togglePlaceModeOrientation(){
        if (this.shipPlaceModeOrientation == "right"){
            this.shipPlaceModeOrientation = "down";
        } else this.shipPlaceModeOrientation = "right";
    }

    drawBackground(){
        const context = this.canvas.getContext("2d");
        context.fillStyle = this.backgroundColor;
        context.fillRect(0,0,this.canvas.width, this.canvas.height);
    }

    drawBoard(board: GameBoard, x: number, y: number, size: number, label: string){
        let currentX = x;
        let currentY = y;
        const deltaX = size / 8;
        const deltaY = size /8;

        const context = this.canvas.getContext("2d");
        context.strokeStyle = this.strokeColor
        for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
                const color = this.colors[board.board[i][j]]
                context.fillStyle = color;
                context.fillRect(currentX, currentY, deltaX, deltaY);
                context.strokeRect(currentX, currentY, deltaX, deltaY)
                currentY += deltaY;
            }
            currentY = y;
            currentX += deltaX;
        }
        context.fillStyle = this.textColor;
        context.font = `${this.textSize}px Arial`
        context.fillText(label, x, y + size + this.textSize);
        context.strokeText(label, x, y + size + this.textSize);
    }

    drawBoards(){
        this.drawBoard(this.game.boards[Player.player], this.boardMargin, (this.canvas.height-this.boardSize)/2, this.boardSize, "Player's Board");
        this.drawBoard(this.game.boards[Player.enemy], this.canvas.width - this.boardMargin - this.boardSize, (this.canvas.height-this.boardSize)/2, this.boardSize, "Opponent's Board");
    }

    drawBoardHighlight(){
        if(this.selectedBoard == null) return;
        const yStart = (this.canvas.height-this.boardSize)/2;
        const xStart = this.selectedBoard == Player.player?
        this.boardMargin :
        this.canvas.width - this.boardMargin - this.boardSize;

        const squareSize = this.boardSize/8;

        const highlightedSquareX = xStart + squareSize * this.selectedBoardCoordinates.x;
        const highlightedSquareY = yStart + squareSize * this.selectedBoardCoordinates.y;
        const context = this.canvas.getContext("2d");
        context.fillStyle = this.highlightColor;
        context.fillRect(highlightedSquareX, highlightedSquareY ,squareSize,squareSize)
        if(this.game.state == GameStates.Deploying && this.selectedBoard == Player.player){
            if(this.shipPlaceModeOrientation == "down"){
                for(let i = 1; i <= 3; i++){
                    context.fillRect(highlightedSquareX, highlightedSquareY + i *squareSize ,squareSize,squareSize)
                }
            } else {
                for(let i = 1; i <= 3; i++){
                    context.fillRect(highlightedSquareX + i * squareSize, highlightedSquareY,squareSize,squareSize)
                }
            }
        }
    }

    drawTurnText(){
        if(this.game.playersTurn == null || this.game.state != GameStates.Fighting) return;
        const turnText = this.game.playersTurn? "Your Turn" : "Opponent's Turn"
        
        const context = this.canvas.getContext("2d");
        context.fillStyle = this.textColor;
        context.font = `${this.textSize}px Arial`
        context.fillText(turnText, 0, this.canvas.height - this.textSize);
    }

    drawGameId(){
        if(this.game.gameId == null) return;
        
        const context = this.canvas.getContext("2d");
        context.fillStyle = this.textColor;
        context.font = `${this.textSize}px Arial`
        context.fillText("game id: " + this.game.gameId, 0, this.textSize);
        if(this.game.opponentName != null) context.fillText("opponent name: " + this.game.opponentName, 0, 2 *this.textSize);
    }

    

    clear(){
        const context = this.canvas.getContext("2d");
        context.clearRect(0,0,this.canvas.width, this.canvas.height);
    }
}