
//  bot version  //

// 1.1.0
// MAJOR.MINOR.PATCH
// discord.js => seyfert



//  notes  //

// https://www.seyfert.dev/docs/learn/getting-started
// changed from js main to ts main
// uses .env file for token
// uses seyfert's built-in command and event handler
// commands and events are automatically loaded by seyfert



//  requirements  //

import "dotenv/config";

import { Client } from "seyfert";

// create seyfert client
const client = new Client();



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

    } catch (error) {
        console.error("[PRISM] Failed to start:", error);
        process.exitCode = 1;
    }
}



//  launch  //

void startBot();



//  export  //

export { client };
