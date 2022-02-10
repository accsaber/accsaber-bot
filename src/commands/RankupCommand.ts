import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction, GuildMemberRoleManager} from 'discord.js';
import {AccSaberUser} from '../entity/AccSaberUser';
import Command from './Command';
import axios from 'axios';

export default class RankupCommand implements Command {
    // ACC Discord
    // public static rankRoleIDs = [
    //     '913220799824015430', // Mercenary
    //     '762916277462499349', // Acc Champ
    //     '913221534447992832', // Elder
    //     '913221671517835314', // God
    //     '913221614051680256', // Celesial
    // ];

    // AccSaber Staff Discord
    public static rankRoleIDs = [
        '913262302038483005', // Mercenary
        '913262266554667089', // Acc Champ
        '913262253883654255', // Elder
        '913262231045685268', // God
        '913262179707392042', // Celesial
    ];

    public slashCommandBuilder = new SlashCommandBuilder()
        .setName('rankup')
        .setDescription('Get the role for the highest level you\'ve reached in the campaign');

    public permissions = [];

    public async execute(interaction: CommandInteraction) {
        // Check command is being used in guild
        if (!interaction.member) {
            await interaction.reply('This command can only be executed from within the server.');
            return;
        }

        // Get SS ID
        const accSaberUser = await AccSaberUser.findOne(interaction.user.id);
        if (!accSaberUser) {
            await interaction.reply('You\'re not registered, please register first.');
            return;
        }

        // Make request for milestones
        const response = await axios.get(`https://accsaber.com/api/0/player-campaign-infos/${accSaberUser.scoreSaberID}`);
        const milestones = response.data as Milestone[];


        // Get current milestone
        let currentMilestone = -1;
        const memberRoleManager = interaction.member.roles as GuildMemberRoleManager;
        for (let i = 0; i < RankupCommand.rankRoleIDs.length; i++) {
            const rankRoleID = RankupCommand.rankRoleIDs[i];
            if (memberRoleManager.cache.has(rankRoleID)) {
                currentMilestone = i;
            }
        }

        // Iterate through milestones assigning new roles when necessary
        for (let i = 0; i < milestones.length; i++) {
            const milestone = milestones[i];
            if (milestone.id > currentMilestone) {
                if (!milestone.pathCleared) {
                    if (interaction.replied) {
                        await interaction.followUp(`You passed the <@&${RankupCommand.rankRoleIDs[milestone.id]}> milestone but you're missing at least one challenge on the way.`);
                    } else {
                        await interaction.reply(`You passed the <@&${RankupCommand.rankRoleIDs[milestone.id]}> milestone but you're missing at least one challenge on the way.`);
                    }
                    break;
                }
                await memberRoleManager.add(RankupCommand.rankRoleIDs[milestone.id]);
                if (currentMilestone !== -1 && currentMilestone !== 1) await memberRoleManager.remove(RankupCommand.rankRoleIDs[currentMilestone]);
                currentMilestone = milestone.id;
                if (interaction.replied) {
                    await interaction.followUp(`Congratulations on reaching <@&${RankupCommand.rankRoleIDs[milestone.id]}>!`);
                } else {
                    await interaction.reply(`Congratulations on reaching <@&${RankupCommand.rankRoleIDs[milestone.id]}>!`);
                }
            }
        }
    }
}
