"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
require("dotenv/config");
const seyfert_1 = require("seyfert");
//  bot version  //
// 1.1.0
// MAJOR.MINOR.PATCH
// changed from discord.js to seyfert
//  notes  //
// setup mainly based on setup from https://www.seyfert.dev/docs/learn/getting-started
// changed from js main to ts main
// uses .env file for token
// uses seyfert's built-in command and event handler
// commands and events are automatically loaded by seyfert
//  requirements  //
// create seyfert client
const client = new seyfert_1.Client();
exports.client = client;
//  logs  //
// logs are handled through seyfert's built-in logger
// botReady event handles the successful login message
// command errors are handled through seyfert's command error handling
//  commands  //
// commands are automatically loaded from dist/commands
// commands are registered with discord using uploadCommands()
// no manual Collection or command loading required
//  events  //
// events are automatically loaded from dist/events
// event handlers are defined in separate files
// botReady.ts handles the bot startup message
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
        // register application commands with discord
        await client.uploadCommands();
    }
    catch (error) {
        console.error("[PRISM] Failed to start:", error);
        process.exitCode = 1;
    }
}
//  launch  //
void startBot();
