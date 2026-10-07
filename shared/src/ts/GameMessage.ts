export default abstract class GameMessage{
    abstract type: any;
    abstract toJsonString: ()=>string;
}