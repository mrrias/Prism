//  notes  //

// script to clear/wipe existing slash commands from the guild or globally
// passing an empty array to the body deletes all registered commands



//  requirements  //

require('dotenv').config();
const { REST, Routes } = require('discord.js');

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;

const rest = new REST().setToken(token);



//  wipe  //

(async () => {
    try {
        console.log('Started refreshing (wiping) application commands.');

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: [] },
        );

        console.log(`Successfully deleted all application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();