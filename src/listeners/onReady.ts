import Bot from '../Bot';
import {ReactionMessage} from '../entity/ReactionMessage';
import logger from '../util/logger';
import updatePermissions from '../util/updatePermissions';

export default async function onReady(): Promise<void> {
    if (!process.env.GUILD_ID || !process.env.LOG_CHANNEL_ID) {
        console.error('Missing guild ID or log channel ID'); // Log channel hasn't been initialised yet so can't use logger
        return;
    }
    Bot.guild = await Bot.client.guilds.fetch(process.env.GUILD_ID);
    const channel = await Bot.guild.channels.fetch(process.env.LOG_CHANNEL_ID);
    if (!channel || channel.type !== 'GUILD_TEXT') {
        console.error('Log channel is not a text channel.');
        return;
    }
    Bot.logChannel = channel;

    await Bot.guild.members.fetch(); // Get and cache server members
    await updatePermissions(); // Can't be run before the guild has been fetched

    // Cache channels with reaction messages
    const channelIDs = new Set<string>(); // Using a set to only fetch each channel once
    const reactionMessages = await ReactionMessage.find();
    reactionMessages.forEach((reactionMessage) => {
        channelIDs.add(reactionMessage.channelID);
    });
    for (const channelID of channelIDs) {
        await Bot.guild.channels.fetch(channelID);
    }

    logger.info(`Ready! Member Count: ${Bot.guild.members.cache.size}.`);
}
