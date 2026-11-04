const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('test').setDescription('Placeholder command for testing purposes.'),
	async execute(interaction) {
		await interaction.reply('Hey, I am the first command! More to come soon! :D');
	},
};