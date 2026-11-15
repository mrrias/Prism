
//  bot version  //

// 1.5.4
// MAJOR.MINOR.PATCH


//  notes  //

        // const embed = new Embed()
        //     .setTitle("Prism Tickets")
        //     .setDescription(
        //         "Open a ticket by clicking below."
        //     )
        //     .setColor("#ff99e9");

        // // create button //

        // const button = new Button()
        //     .setCustomId("ticket:create")
        //     .setLabel("Open Ticket")
        //     .setStyle(ButtonStyle.Primary);

        // // create action row //

        // const row = new ActionRow<Button>()
        //     .setComponents([button]);

        // // send panel //

        // await ctx.write({
        //     embeds: [embed],
        //     components: [row]
        // });

// panel.ts formatted according to code in help.ts


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
