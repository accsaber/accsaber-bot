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
    const logChannel = await Bot.guild.channels.fetch(process.env.LOG_CHANNEL_ID);
    if (!logChannel || logChannel.type !== 'GUILD_TEXT') {
        console.error('Log channel is not a text channel.');
        return;
    }
    Bot.logChannel = logChannel;

    await Bot.guild.members.fetch(); // Get and cache server members
    await updatePermissions(); // Can't be run before the guild has been fetched

    // Cache reaction messages
    const reactionMessages = await ReactionMessage.find();
    for (const reactionMessage of reactionMessages) {
        const channel = await Bot.guild.channels.fetch(reactionMessage.channelID);
        if (!channel) return;
        if (channel.type !== 'GUILD_TEXT') return;
        void channel.messages.fetch(reactionMessage.messageID);
    }
    logger.notice(`Ready! Member Count: ${Bot.guild.members.cache.size}.`);
}
