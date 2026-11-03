export enum Player{
    Player1 = "Player1",
    Player2 = "Player2"
}

export function getOppositePlayer(player: Player): Player{
    if(player == Player.Player1) return Player.Player2;
    else return Player.Player1;
}