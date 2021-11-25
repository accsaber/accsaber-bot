import {GuildMember} from 'discord.js';
import logger from '../util/logger';

export default async function onGuildMemberAdd(guildMember: GuildMember): Promise<void> {
    if (!process.env.ROOKIE_ID) {
        logger.error('Rookie role ID missing from environment variables');
        return;
    }
    await guildMember.roles.add(process.env.ROOKIE_ID);
}
