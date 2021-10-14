import {GuildMember} from 'discord.js';
import logger from '../util/logger';

export default async function onMemberJoin(guildMember: GuildMember): Promise<void> {
    if (!process.env.ROOKIE_ID) {
        logger.error('Rookie role ID missing from environment variables');
        return;
    }
    guildMember.roles.add(process.env.ROOKIE_ID);
}
