import {REST, Routes} from 'discord.js';
import commands from '../commands';
import logger from './logger';

export default async function deployCommands(): Promise<void> {
    if (!process.env.BOT_TOKEN || !process.env.GUILD_ID || !process.env.CLIENT_ID) {
        logger.error('Deploy failed, missing environment variable(s).');
        return;
    }

    const slashCommands = commands.map((command) => command.slashCommandBuilder.toJSON());

    const rest = new REST({version: '10'}).setToken(process.env.BOT_TOKEN);

    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: slashCommands})
        .then(() => logger.info('Successfully registered application commands.'))
        .catch(logger.error);
}

// Excute if run separately
if (require.main === module) {
    void deployCommands();
}
