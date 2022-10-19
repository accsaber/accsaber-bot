import {CommandInteraction, SlashCommandBuilder} from 'discord.js';
import {AccSaberUser} from '../entity/AccSaberUser';
import Command from './Command';

export default class RemoveUserCommand implements Command {
    private SUCCESS_MESSAGE = 'Successfully removed user';
    private NOT_REGISTERED_USER_MESSAGE = 'That user isn\'t registered';

    public slashCommandBuilder = new SlashCommandBuilder()
        .setName('remove-user')
        .setDescription('Removes a user from the database.')
        .setDefaultMemberPermissions(0)
        .addUserOption((option) =>
            option.setName('user')
                .setDescription('User to remove')
                .setRequired(true),
        );

    public async execute(interaction: CommandInteraction) {
        const user = interaction.options.getUser('user')!; // Required options so should be safe to assert not null

        const accSaberUser = await AccSaberUser.findOne({where: {discordID: user.id}});
        if (!accSaberUser) {
            await interaction.reply(this.NOT_REGISTERED_USER_MESSAGE);
            return;
        }

        await accSaberUser.remove();
        await interaction.reply(this.SUCCESS_MESSAGE);
    }
}
