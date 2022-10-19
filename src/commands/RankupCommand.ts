import {CommandInteraction, GuildMemberRoleManager, SlashCommandBuilder} from 'discord.js';
import {AccSaberUser} from '../entity/AccSaberUser';
import Command from './Command';
import axios from 'axios';

export default class RankupCommand implements Command {
    // ACC Discord
    public static rankRoleIDs = [
        '913220799824015430', // Mercenary
        '943949792814436413', // Acc Champ
        '913221534447992832', // Elder
        '913221671517835314', // God
        '913221614051680256', // Celesial
    ];

    // AccSaber Staff Discord
    // public static rankRoleIDs = [
    //     '913262302038483005', // Mercenary
    //     '913262266554667089', // Acc Champ
    //     '913262253883654255', // Elder
    //     '913262231045685268', // God
    //     '913262179707392042', // Celesial
    // ];

    public slashCommandBuilder = new SlashCommandBuilder()
        .setName('rankup')
        .setDescription('Get the role for the highest level you\'ve reached in the campaign');

    public async execute(interaction: CommandInteraction) {
        // Check command is being used in guild
        if (!interaction.member) {
            await interaction.reply('This command can only be executed from within the server.');
            return;
        }

        // Get SS ID
        const accSaberUser = await AccSaberUser.findOne({where: {discordID: interaction.user.id}});
        if (!accSaberUser) {
            await interaction.reply('You\'re not registered, please register first.');
            return;
        }

        // Make request for milestones
        let milestones: Milestone[];
        try {
            const response = await axios.get(`https://campaigns.accsaber.com/0/player-campaign-infos/${accSaberUser.scoreSaberID}`);
            milestones = response.data as Milestone[];
        } catch (err) {
            await interaction.reply('Unable to get milestones from AccSaber.');
            return;
        }

        if (milestones.length === 0) {
            await interaction.reply(`You haven't passed any milestones.`);
            return;
        }

        // Get current milestone
        let currentMilestone = -1;
        const memberRoleManager = interaction.member.roles as GuildMemberRoleManager;
        for (let i = 0; i < RankupCommand.rankRoleIDs.length; i++) {
            const rankRoleID = RankupCommand.rankRoleIDs[i];
            if (memberRoleManager.cache.has(rankRoleID)) {
                currentMilestone = i;
            }
        }

        let reply = '';
        // Iterate through milestones assigning new roles when necessary
        for (const milestone of milestones) {
            if (milestone.milestoneId > currentMilestone) {
                if (!milestone.pathCleared) {
                    reply += `You passed the <@&${RankupCommand.rankRoleIDs[milestone.milestoneId]}> milestone but you're missing at least one challenge on the way.\n`;
                    break;
                }
                await memberRoleManager.add(RankupCommand.rankRoleIDs[milestone.milestoneId]);
                if (currentMilestone !== -1) {
                    // Don't remove the champ role on rankup (1 = champ)
                    if (currentMilestone !== 1) await memberRoleManager.remove(RankupCommand.rankRoleIDs[currentMilestone]);
                } else {
                    await memberRoleManager.remove(process.env.ROOKIE_ID!);
                }
                currentMilestone = milestone.milestoneId;
                reply += `Congratulations on reaching <@&${RankupCommand.rankRoleIDs[milestone.milestoneId]}>!\n`;
            }
        }

        if (reply.length > 0) {
            await interaction.reply(reply);
        } else {
            await interaction.reply(`You haven't passed any new milestones.`);
        }
    }
}
