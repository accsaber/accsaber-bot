import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';
import {ApplicationCommandPermissionTypes as PermissionTypes} from 'discord.js/typings/enums';
import Command from './Command';

export default class PingCommand implements Command {
    public slashCommandBuilder = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!');

    public permissions = [{
        id: process.env.ROOKIE_ID!,
        type: PermissionTypes.ROLE,
        permission: false,
    }];

    public async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong!');
    }
};
