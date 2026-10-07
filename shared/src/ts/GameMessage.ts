export default abstract class GameMessage{
    abstract readonly type: string;
    abstract toJsonString: ()=>string;
}