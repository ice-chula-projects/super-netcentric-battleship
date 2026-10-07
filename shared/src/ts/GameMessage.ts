export default abstract class GameMessage{
    abstract readonly type: string;
    abstract readonly timestamp: number;
    abstract toJsonString: ()=>string;
}