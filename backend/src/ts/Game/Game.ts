import Random from "../lib/Random.js";
import User from "../User/User.js";
import GameBoard, { BoardTileTypes, GameShip } from "./GameBoard.js";

export enum GameState {
    Forming,
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
        [Player.Player1]: User | null,
        [Player.Player2]: User | null
    } = {[Player.Player1]: null, [Player.Player2]: null}

    readonly boards: {
        [Player.Player1]: GameBoard | null,
        [Player.Player2]: GameBoard | null
    } = {[Player.Player1]: null, [Player.Player2]: null}
    readonly chatChannelId: string;
    readonly gameId: string;

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
        return this.gameState != GameState.Forming && this.gameState != GameState.End;
    }

    get isFull(): boolean{
        return this.gameState != GameState.Forming;
    }

    gameState: GameState = GameState.Forming;
    

    constructor(gameId: string, chatChannelId: string){
        this.gameId = gameId;
        this.chatChannelId = chatChannelId;
    }

    private transitionGameState(gameState: GameState){
        switch(gameState){
            case GameState.Setup:
                this.gameState = GameState.Setup;
            break;
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

    addPlayerUser(user: User): Player{
        if(this.players[Player.Player1] == null){
            this.players[Player.Player1] = user;
            return Player.Player1;
        }
        this.players[Player.Player2] = user;
        this.transitionGameState(GameState.Setup);
        return Player.Player2;
    }

    getPlayerFromUser(user: User): Player{
        if (this.players[Player.Player1] == user) return Player.Player1;
        else if (this.players[Player.Player2] == user) return Player.Player2;

        throw new Error("given user is not part of game");
    }

    isUserInGame(user: User){
        return this.players[Player.Player1] == user || this.players[Player.Player2] == user;
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