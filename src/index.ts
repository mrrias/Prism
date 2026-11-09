
//  bot version  //

// 1.2.0
// MAJOR.MINOR.PATCH



//  notes  //

// issues with git unresolved
/*

git log --oneline
git reset --hard 6d4e0d4

*/
// reverted back to old commit and checked the remote
// was not able to get commits working again so have switched to fresh repo

// added embeds for demo and ephemeral reply for help

// Due to issues with git and the previous repo code has been moved to a new repo.



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
