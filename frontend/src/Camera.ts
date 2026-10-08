import GameBoard, { BoardTileTypes } from "./Board";

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

    strokeColor: string = "black";
    backgroundColor: string = "#5093d4";
    textColor: string = "white";
    textSize: number = 12;
    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;

        this.render();
    }

    render(){
        this.clear();
        this.drawBackground();
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

    clear(){
        const context = this.canvas.getContext("2d");
        context.clearRect(0,0,this.canvas.width, this.canvas.height);
    }
}