import 'reflect-metadata';
import {ConnectionOptionsReader, DataSource, DataSourceOptions} from 'typeorm';
import {Client, Guild, IntentsBitField, TextChannel} from 'discord.js';
import deployCommands from './util/deployCommands';
import logger from './util/logger';
import onReady from './listeners/onReady';
import onGuildMemberAdd from './listeners/onGuildMemberAdd';
import onInteractionCreate from './listeners/onInteractionCreate';
import onMessageReactionAdd from './listeners/onMessageReactionAdd';

type Mutable<Type> = {
    -readonly [Key in keyof Type]: Type[Key];
};

export default class Bot {
    public static client: Client;
    public static guild: Guild;
    public static logChannel: TextChannel;
    public static dataSource: DataSource;
}

async function main() {
    logger.info('Connecting to database...');
    // Manually grab database connection options so they can be changed dynamically depending on the environment
    const allDataSourceOptions = await new ConnectionOptionsReader().all();
    if (allDataSourceOptions.length === 0) {
        logger.error('Could not find database settings.');
        process.exit();
    }
    // Options are automatically ordered by priority (see docs for priority), so use first element
    const dataSourceOptions = allDataSourceOptions[0] as Mutable<DataSourceOptions>;
    // The socket path depends on whether the bot is running locally or deployed to prod
    if (process.env.NODE_ENV === 'production') {
        dataSourceOptions.extra = {socketPath: '/run/mysqld/mysqld.sock'};
    }
    Bot.dataSource = new DataSource(dataSourceOptions);
    await Bot.dataSource.initialize().catch((error) => {
        logger.error('Failed to connect to database');
        logger.error(error);
        process.exit();
    });
    logger.info('Connected to database.');

    const intents = new IntentsBitField();
    intents.add(
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
    );

    Bot.client = new Client({intents});
    Bot.client.once('ready', onReady);
    Bot.client.on('guildMemberAdd', onGuildMemberAdd);
    Bot.client.on('interactionCreate', onInteractionCreate);
    Bot.client.on('messageReactionAdd', onMessageReactionAdd);

    await deployCommands();
    await Bot.client.login(process.env.BOT_TOKEN); // Login errors not caught, we want to crash if we can't log in

    // Prevent the bot from crashing on uncaught errors
    process.on('unhandledRejection', (error) => logger.error('Uncaught Promise Rejection:', error));
}

void main();
