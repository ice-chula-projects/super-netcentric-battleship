import GameServer from "./GameServer.js";
import process from "node:process";
//todo: configuration
const PORT = 17040;
const gameServer = new GameServer(PORT);

//save the database when the process terminates for any reason
process.on("SIGINT", async () => {
    await gameServer.database.save();
    process.exit(0);
})
process.on("SIGTERM", async () => {
    await gameServer.database.save();
    process.exit(0);
})
process.on("uncaughtException", async () => {
    await gameServer.database.save();
    process.exit(1);
})
process.on("unhandledRejection", async () => {
    await gameServer.database.save();
    process.exit(1);
})