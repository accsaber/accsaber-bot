import {CommandInteraction, SlashCommandBuilder} from 'discord.js';
import Command from './Command';

export default class LongPingCommand implements Command {
    public slashCommandBuilder = new SlashCommandBuilder()
        .setName('long-ping')
        .setDescription('Replies with Pong after a delay!');

    public async execute(interaction: CommandInteraction) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await interaction.reply('Long pong!');
    }
}
