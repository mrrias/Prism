"use strict";
//  bot version  //
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
// 1.4.0
// MAJOR.MINOR.PATCH
//  notes  //
// help command content updates
//  requirements  //
require("dotenv/config");
const seyfert_1 = require("seyfert");
// create seyfert client
const client = new seyfert_1.Client();
exports.client = client;
//  errors  //
// handles unhandled promise rejections
process.on("unhandledRejection", (reason) => {
    console.error("[PRISM] Unhandled promise rejection:", reason);
});
// handles uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("[PRISM] Uncaught exception:", error);
    process.exit(1);
});
//  start  //
async function startBot() {
    try {
        // connect to discord and load commands and events
        await client.start();
        console.log("[PRISM] Bot started successfully!");
        // register application commands with discord
        await client.uploadCommands();
        console.log("[PRISM] Application commands uploaded successfully!");
    }
    catch (error) {
        console.error("[PRISM] Failed to start:", error);
        process.exitCode = 1;
    }
}
//  launch  //
void startBot();
