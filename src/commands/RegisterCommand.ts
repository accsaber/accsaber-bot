import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';
import {AccSaberUser} from '../entity/AccSaberUser';
import extractScoreSaberID from '../util/extractScoreSaberID';
import Command from './Command';

export default class RegisterCommand implements Command {
    private SUCCESS_MESSAGE = 'Successfully registered';
    private INVALID_PROFILE_MESSAGE = 'Please use a valid profile';
    private ALREADY_REGISTERED_USER_MESSAGE = 'You\'re already registered';
    private ALREADY_REGISTERED_PROFILE_MESSAGE = 'That ScoreSaber profile is already registered';

    public slashCommandBuilder = new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register with the bot')
        .addStringOption((option) =>
            option.setName('scoresaber')
                .setDescription('ScoreSaber Link or ID')
                .setRequired(true),
        );

    public permissions = [];

    public async execute(interaction: CommandInteraction) {
        const user = interaction.user;
        const scoreSaber = interaction.options.getString('scoresaber')!; // Required option so should be safe to assert not null

        // Test if given an invalid ScoreSaber ID
        const scoreSaberID = extractScoreSaberID(scoreSaber);
        if (scoreSaberID === null) {
            await interaction.reply(this.INVALID_PROFILE_MESSAGE);
            return;
        }

        // Test if the ScoreSaber profile is already in the database
        const dbScoreSaber = await AccSaberUser.findOne({scoreSaberID});
        if (dbScoreSaber) {
            await interaction.reply(this.ALREADY_REGISTERED_PROFILE_MESSAGE);
            return;
        }

        // Test if the user is already in the database
        let accSaberUser = await AccSaberUser.findOne(user.id);
        if (accSaberUser) {
            await interaction.reply(this.ALREADY_REGISTERED_USER_MESSAGE);
            return;
        }

        accSaberUser = new AccSaberUser();
        accSaberUser.discordID = user.id;
        accSaberUser.scoreSaberID = scoreSaberID;
        await accSaberUser.save();
        await interaction.reply(this.SUCCESS_MESSAGE);
    }
}
