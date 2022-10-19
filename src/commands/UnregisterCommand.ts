import {CommandInteraction, SlashCommandBuilder} from 'discord.js';
import {AccSaberUser} from '../entity/AccSaberUser';
import Command from './Command';

export default class UnregisterCommand implements Command {
    private SUCCESS_MESSAGE = 'Successfully unregistered';
    private NOT_REGISTERED_MESSAGE = 'You\'re not registered';

    public slashCommandBuilder = new SlashCommandBuilder()
        .setName('unregister')
        .setDescription('Unregister from the bot');

    public async execute(interaction: CommandInteraction) {
        const user = interaction.user;

        // Test if the user is already in the database
        const accSaberUser = await AccSaberUser.findOne({where: {discordID: user.id}});
        if (accSaberUser) {
            await accSaberUser.remove();
            await interaction.reply(this.SUCCESS_MESSAGE);
            return;
        } else {
            await interaction.reply(this.NOT_REGISTERED_MESSAGE);
            return;
        }
    }
}
