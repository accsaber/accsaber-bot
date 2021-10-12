import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';
import {AccSaberUser} from '../entity/AccSaberUser';
import Util from '../Util';
import Command from './Command';

export default class GetCommand implements Command {
    private INVALID_PROFILE_MESSAGE = 'Please use a valid profile';
    private NO_PROFILE_MESSAGE = 'Could not find profile';
    private NO_USER_MESSAGE = 'Could not find user';

    public slashCommandBuilder = new SlashCommandBuilder()
        .setName('get')
        .setDescription('Get a user or profile')
        .addSubcommand((subcommand) =>
            subcommand.setName('user')
                .setDescription('Get the user associated with a given profile')
                .addStringOption((option) =>
                    option.setName('scoresaber')
                        .setDescription('ScoreSaber Link or ID')
                        .setRequired(true),
                ),
        ).addSubcommand((subcommand) =>
            subcommand.setName('profile')
                .setDescription('Get the profile associated with a given user')
                .addUserOption((option) =>
                    option.setName('user')
                        .setDescription('User to get the profile of')
                        .setRequired(true),
                ),
        );

    public async execute(interaction: CommandInteraction) {
        if (interaction.options.getSubcommand() === 'user') {
            const scoreSaber = interaction.options.getString('scoresaber')!; // Required options so should be safe to assert not null

            // Test if given an invalid ScoreSaber ID
            const scoreSaberID = Util.extractScoresaberID(scoreSaber);
            if (scoreSaberID === null) {
                interaction.reply(this.INVALID_PROFILE_MESSAGE);
                return;
            }

            // Find user
            const accSaberUser = await AccSaberUser.findOne({scoreSaberID});
            if (accSaberUser) {
                interaction.reply(accSaberUser.discordID);
                return;
            } else {
                interaction.reply(this.NO_USER_MESSAGE);
                return;
            }
        } else {
            const user = interaction.options.getUser('user')!;

            // Find user
            const accSaberUser = await AccSaberUser.findOne(user.id);
            if (accSaberUser) {
                interaction.reply(`https://scoresaber.com/u/${accSaberUser.scoreSaberID}`);
                return;
            } else {
                interaction.reply(this.NO_PROFILE_MESSAGE);
                return;
            }
        }
    }
};
