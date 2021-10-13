import {Connection, createConnection} from 'typeorm';
import 'reflect-metadata';
import {Client, Guild, GuildMember, Intents, Interaction, MessageReaction, PartialMessageReaction, PartialUser, TextChannel, User} from 'discord.js';
import commands from './commands';
import deployCommands from './DeployCommands';
import logger from './Logger';
import updatePermissions from './UpdatePermissions';
import {ReactionMessage} from './entity/ReactionMessage';

// TODO: Remove user command

// TODO: Await on interaction.reply

// TODO: Move event listeners into separate files

export default class Bot {
    public static readonly PREFIX = process.env.BOT_PREFIX || '%';

    public static client: Client;
    public static guild: Guild;
    public static logChannel: TextChannel;

    public static dbConnection: Connection;
}

async function onReady(): Promise<void> {
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
    logger.info(`Ready! Member Count: ${Bot.guild.members.cache.size}.`);

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
}


async function onMemberJoin(guildMember: GuildMember): Promise<void> {
    if (!process.env.ROOKIE_ID) {
        logger.error('Rookie role ID missing from environment variables');
        return;
    }
    guildMember.roles.add(process.env.ROOKIE_ID);
}

async function onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand()) return;

    const {commandName} = interaction;
    const command = commands.find((c) => c.slashCommandBuilder.name == commandName);

    if (!command) return;

    command.execute(interaction);
}

async function onMessageReactionAdd(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser): Promise<void> {
    const reactionMessage = await ReactionMessage.findOne(reaction.message.id);
    if (!reactionMessage) {
        // No reaction role associated with that message
        return;
    }

    const emoteID = reaction.emoji.id;
    if (!emoteID) {
        logger.warn('Emote has no id?!?');
        return;
    }
    const reactionRole = reactionMessage.reactionRoles.find((reactionRole) => reactionRole.emoteID === emoteID);
    if (!reactionRole) {
        // No reaction role associated with that emote
        return;
    }

    // Get member and toggle role
    const member = await Bot.guild.members.fetch(user.id);
    if (member.roles.cache.has(reactionRole.roleID)) {
        await member.roles.remove(reactionRole.roleID);
    } else {
        await member.roles.add(reactionRole.roleID);
    }

    await reaction.users.remove(user.id);
}

// Set up intents
const intents = new Intents();
intents.add(Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS);

logger.info('Connecting to database...');
createConnection().then(async (dbConnection) => {
    logger.info('Connected to database.');
    Bot.dbConnection = dbConnection;
    Bot.client = new Client({intents});

    Bot.client.once('ready', onReady);
    Bot.client.on('guildMemberAdd', onMemberJoin);
    Bot.client.on('interactionCreate', onInteraction);
    Bot.client.on('messageReactionAdd', onMessageReactionAdd);

    await deployCommands();
    await Bot.client.login(process.env.BOT_TOKEN || 'NO_TOKEN_PROVIDED'); // Login errors not caught, we want to crash if we can't log in

    // Prevent the bot from crashing on uncaught errors
    process.on('unhandledRejection', (error) => logger.error('Uncaught Promise Rejection:', error));
}).catch((error) => {
    logger.error('Application crashed.');
    logger.error(error);
    process.exit();
});
