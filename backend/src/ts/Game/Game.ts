import Random from "../lib/Random.js";
import User from "../User/User.js";
import GameBoard, { BoardTileTypes, GameShip } from "./GameBoard.js";

export enum GameState {
    Setup,
    Battle,
    End
}

export enum Player{
    Player1,
    Player2
}

export enum ShotResult{
    Hit,
    Miss
}

export default class Game{
    readonly players: {
        [Player.Player1]: User,
        [Player.Player2]: User
    }

    readonly boards: {
        [Player.Player1]: GameBoard | null,
        [Player.Player2]: GameBoard | null
    } = {[Player.Player1]: null, [Player.Player2]: null}
    readonly chatChannelId: string;

    currentPlayerTurn: Player | null = null;
    winningPlayer: Player | null = null;

    get currentPlayerUser(): User | null{
        if (this.currentPlayerTurn == null) return null;
        return this.players[this.currentPlayerTurn];
    }

    get currentPlayerBoard(): GameBoard | null {
        if (this.currentPlayerTurn == null) return null;
        return this.boards[this.currentPlayerTurn];
    }

    get boardIsSetUp(): boolean{
        return this.boards[Player.Player1] != null && this.boards[Player.Player2] != null;
    }

    get isInProgress(): boolean{
        return this.gameState != GameState.End;
    }

    gameState: GameState = GameState.Setup;
    

    constructor(player1: User, player2: User, chatChannelId: string){
        this.players = {
            [Player.Player1]: player1,
            [Player.Player2]: player2
        }

        this.chatChannelId = chatChannelId;
    }

    private transitionGameState(gameState: GameState){
        switch(gameState){
            case GameState.Battle:
                this.currentPlayerTurn = Random.randomBoolean() ? Player.Player1 : Player.Player2;
                this.gameState = GameState.Battle;
            break;
            case GameState.End:
                this.winningPlayer = this.currentPlayerTurn;
                this.gameState = GameState.End;
            break;
        }
    }

    private switchTurns(){
        this.currentPlayerTurn = this.currentPlayerTurn == Player.Player1 ? Player.Player2 : Player.Player1;
    }
    
    setupBoard(player: Player, ships: GameShip[]){
        if(this.gameState != GameState.Setup) throw new Error("cannot setup board in non setup state");
        if(this.boards[player] != null) throw new Error("tried to setup an existing board");
        const board = new GameBoard(ships);
        this.boards[player] = board;

        if (this.boardIsSetUp) this.transitionGameState(GameState.Battle);
    }

    takeTurn(x: number, y: number): ShotResult{
        if(this.gameState != GameState.Battle) throw new Error("cannot take turns in non battle state");
        const board = this.currentPlayerTurn == Player.Player1? this.boards[Player.Player2] : this.boards[Player.Player1];
        const result = board?.shoot(x,y);
        if(board?.allShipsSunk) {
            this.transitionGameState(GameState.End);
            return ShotResult.Hit;
        }
        
        this.switchTurns();
        return result == BoardTileTypes.Hit? ShotResult.Hit : ShotResult.Miss;
    }
}