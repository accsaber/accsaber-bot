import {Connection, createConnection} from 'typeorm';
import 'reflect-metadata';
import {Client, Guild, GuildMember, Intents, Interaction} from 'discord.js';
import commands from './commands';
import deployCommands from './DeployCommands';

export default class Bot {
    public static readonly PREFIX = process.env.BOT_PREFIX || '%';

    public static client: Client;
    public static guild: Guild;

    public static dbConnection: Connection;
}

async function onReady(): Promise<void> {
    console.log(`Ready! Server count: ${Bot.client.guilds.cache.size}. User Count: ${Bot.client.users.cache.size}.`);
}


async function onMemberJoin(guildMember: GuildMember): Promise<void> {
    if (!process.env.ROOKIE_ID) {
        console.error('Rookie role ID missing from environment variables');
        return;
    }
    guildMember.roles.add(process.env.ROOKIE_ID);
}

async function onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand()) return;

    const {commandName} = interaction;
    const command = commands.find((c) => c.slashCommandBuilder.name == commandName);

    if (!command) return;

    // TODO: Staff only commands, etc.

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

// TODO: Swap to logger lib
console.log('Connecting to database...');
createConnection().then(async (dbConnection) => {
    console.log('Connected to database.');
    Bot.dbConnection = dbConnection;
    Bot.client = new Client({intents});

    Bot.client.once('ready', onReady);
    Bot.client.on('guildMemberAdd', onMemberJoin);
    Bot.client.on('interactionCreate', onInteraction);

    await deployCommands();
    await Bot.client.login(process.env.BOT_TOKEN || 'NO_TOKEN_PROVIDED'); // Login errors not caught, we want to crash if we can't log in

    // Prevent the bot from crashing on uncaught errors
    process.on('unhandledRejection', (error) => console.error('Uncaught Promise Rejection: ', error));
}).catch((error) => {
    console.error('Connection to database failed.');
    console.error(error);
    process.exit();
});
