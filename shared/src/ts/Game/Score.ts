import { Player } from "./Player.js";

export default interface Score {
    [Player.Player1]: number,
    [Player.Player2]: number
}