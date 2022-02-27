import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';
import {AccSaberUser} from '../entity/AccSaberUser';
import Command from './Command';
import RewardDistributor from '../superSecretRewardStuff';
import axios from 'axios';

export default class GetRewardsCommand implements Command {
    public slashCommandBuilder = new SlashCommandBuilder()
        .setName('get-rewards')
        .setDescription('Get all unlocked campaign rewards DM\'d to you');

    public permissions = [];

    public async execute(interaction: CommandInteraction) {
        const user = interaction.user;

        // Test if the user is already in the database
        const accSaberUser = await AccSaberUser.findOne(user.id);
        if (!accSaberUser) {
            await interaction.reply('You\'re not registered.');
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

        if (milestones.length === 1) {
            await interaction.reply(`There are no rewards yet for mercenary.`);
            return;
        }

        await interaction.reply('Sending rewards...');
        for (const milestone of milestones) {
            if (milestone.pathCleared) await RewardDistributor.sendReward(accSaberUser, milestone.milestoneId);
        }
        await interaction.followUp('Sent.');
    }
}
