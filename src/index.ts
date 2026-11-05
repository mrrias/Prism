
//  bot version  //

// 1.1.1
// MAJOR.MINOR.PATCH



//  notes  //

// fixed and issue with slash commands not being registered properly



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

        console.log("[PRISM] Bot started successfully!");

        // register application commands with discord
        await client.uploadCommands();

        console.log("[PRISM] Application commands uploaded successfully!");
    } catch (error) {
        console.error("[PRISM] Failed to start:", error);
        process.exitCode = 1;
    }
}



//  launch  //

void startBot();



//  export  //

export { client };
