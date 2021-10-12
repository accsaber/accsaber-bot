import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import commands from './commands';

if (!process.env.BOT_TOKEN || !process.env.GUILD_ID || !process.env.CLIENT_ID) {
    console.error('Deploy failed, missing environment variable(s).');
    process.exit();
}

const slashCommands = commands.map((command) => command.slashCommandBuilder.toJSON());

const rest = new REST({version: '9'}).setToken(process.env.BOT_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: slashCommands})
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
