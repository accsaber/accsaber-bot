import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';
import {ApplicationCommandPermissionTypes as PermissionTypes} from 'discord.js/typings/enums';
import {AccSaberUser} from '../entity/AccSaberUser';
import extractScoreSaberID from '../util/extractScoreSaberID';
import Command from './Command';

export default class AddUserCommand implements Command {
    private SUCCESS_MESSAGE = 'Successfully registered user';
    private INVALID_PROFILE_MESSAGE = 'Please use a valid profile';
    private ALREADY_REGISTERED_USER_MESSAGE = 'That user is already registered';
    private ALREADY_REGISTERED_PROFILE_MESSAGE = 'That ScoreSaber profile is already registered';

    public slashCommandBuilder = new SlashCommandBuilder()
        .setName('add-user')
        .setDescription('Adds a user to the database.')
        .setDefaultPermission(false)
        .addUserOption((option) =>
            option.setName('user')
                .setDescription('User to add')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option.setName('scoresaber')
                .setDescription('ScoreSaber Link or ID')
                .setRequired(true),
        );

    public permissions = [{
        id: process.env.STAFF_ID!,
        type: PermissionTypes.ROLE,
        permission: true,
    }];

    public async execute(interaction: CommandInteraction) {
        const user = interaction.options.getUser('user')!; // Required options so should be safe to assert not null
        const scoreSaber = interaction.options.getString('scoresaber')!;

        // Test if given an invalid ScoreSaber ID
        const scoreSaberID = extractScoreSaberID(scoreSaber);
        if (scoreSaberID === null) {
            await interaction.reply(this.INVALID_PROFILE_MESSAGE);
            return;
        }

        // Test if the user is already in the database
        const dUser = await AccSaberUser.findOne(user.id);
        if (dUser) {
            await interaction.reply(this.ALREADY_REGISTERED_USER_MESSAGE);
            return;
        }

        // Test if the ScoreSaber profile is already in the database
        const dbScoreSaber = await AccSaberUser.findOne({scoreSaberID});
        if (dbScoreSaber) {
            await interaction.reply(this.ALREADY_REGISTERED_PROFILE_MESSAGE);
            return;
        }

        const accSaberUser = new AccSaberUser();
        accSaberUser.discordID = user.id;
        accSaberUser.scoreSaberID = scoreSaberID;
        await accSaberUser.save();
        await interaction.reply(this.SUCCESS_MESSAGE);
    }
}
