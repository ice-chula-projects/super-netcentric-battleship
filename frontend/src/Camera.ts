import GameBoard, { BoardTileTypes } from "./Board";
import { Player } from "./Game";

export default class Camera{
    canvas: HTMLCanvasElement;
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

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;

        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.canvas.addEventListener("mousedown", this.handleMouseClick.bind(this));
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
        this.drawBoards();
        this.drawBoardHighlight();
    }

    handleMouseClick(mouseEvent: MouseEvent){
        console.log(this.selectedBoard);
        console.log(this.selectedBoardCoordinates);
    }

    handleMouseMove(mouseEvent: MouseEvent){
        const mouseX = mouseEvent.offsetX;
        const mouseY = mouseEvent.offsetY;

        if(mouseY < this.boardMargin || mouseY > this.boardMargin + this.boardSize){
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
            const relativeY = mouseY - this.boardMargin;
            this.selectedBoardCoordinates.x = Math.floor(8*relativeX/(this.boardSize));
            this.selectedBoardCoordinates.y = Math.floor(8*relativeY/(this.boardSize));
        } else if(mouseX > enemyBoardStartX && mouseX < enemyBoardEndX){
            this.selectedBoard = Player.enemy;
            const relativeX = mouseX - enemyBoardStartX;
            const relativeY = mouseY - this.boardMargin;
            this.selectedBoardCoordinates.x = Math.floor(8*relativeX/(this.boardSize));
            this.selectedBoardCoordinates.y = Math.floor(8*relativeY/(this.boardSize));
        }
        else {
            this.selectedBoard = null;
            this.selectedBoardCoordinates.x = null;
            this.selectedBoardCoordinates.y = null;
        }
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
        const board = new GameBoard();
        this.drawBoard(board, this.boardMargin, this.boardMargin, this.boardSize, "Player's Board");
        this.drawBoard(board, this.canvas.width - this.boardMargin - this.boardSize, this.boardMargin, this.boardSize, "Opponent's Board");
    }

    drawBoardHighlight(){
        if(this.selectedBoard == null) return;
        const yStart = this.boardMargin;
        const xStart = this.selectedBoard == Player.player?
        this.boardMargin :
        this.canvas.width - this.boardMargin - this.boardSize;

        const squareSize = this.boardSize/8;

        const context = this.canvas.getContext("2d");
        context.fillStyle = this.highlightColor;
        context.fillRect(xStart + squareSize * this.selectedBoardCoordinates.x, yStart + squareSize * this.selectedBoardCoordinates.y,squareSize,squareSize)
    }

    clear(){
        const context = this.canvas.getContext("2d");
        context.clearRect(0,0,this.canvas.width, this.canvas.height);
    }
}