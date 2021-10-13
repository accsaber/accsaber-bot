import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';
import {AccSaberUser} from '../entity/AccSaberUser';
import Command from './Command';

export default class UnregisterCommand implements Command {
    private SUCCESS_MESSAGE = 'Successfully unregistered';
    private NOT_REGISTERED_MESSAGE = 'You\'re not registered';

    public slashCommandBuilder = new SlashCommandBuilder()
        .setName('unregister')
        .setDescription('Unregister from the bot');

    public permissions = [];

    public async execute(interaction: CommandInteraction) {
        const user = interaction.user;

        // Test if the user is already in the database
        const accSaberUser = await AccSaberUser.findOne(user.id);
        if (accSaberUser) {
            await accSaberUser.remove();
            interaction.reply(this.SUCCESS_MESSAGE);
            return;
        } else {
            interaction.reply(this.NOT_REGISTERED_MESSAGE);
            return;
        }
    }
};
