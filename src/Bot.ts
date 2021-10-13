import {Connection, createConnection} from 'typeorm';
import 'reflect-metadata';
import {Client, Guild, GuildMember, Intents, Interaction, TextChannel} from 'discord.js';
import commands from './commands';
import deployCommands from './DeployCommands';
import logger from './Logger';
import updatePermissions from './UpdatePermissions';

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

    await deployCommands();
    await Bot.client.login(process.env.BOT_TOKEN || 'NO_TOKEN_PROVIDED'); // Login errors not caught, we want to crash if we can't log in
    await updatePermissions();

    // Prevent the bot from crashing on uncaught errors
    process.on('unhandledRejection', (error) => logger.error('Uncaught Promise Rejection:', error));
}).catch((error) => {
    logger.error('Connection to database failed.');
    logger.error(error);
    process.exit();
});
