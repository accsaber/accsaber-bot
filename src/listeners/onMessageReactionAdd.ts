import {MessageReaction, PartialMessageReaction, User, PartialUser} from 'discord.js';
import Bot from '../Bot';
import {ReactionMessage} from '../entity/ReactionMessage';
import logger from '../util/logger';

export default async function onMessageReactionAdd(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser): Promise<void> {
    const reactionMessage = await ReactionMessage.findOne(reaction.message.id);
    if (!reactionMessage) {
        // No reaction role associated with that message
        return;
    }

    const emoteID = reaction.emoji.id;
    if (!emoteID) {
        logger.warning('Emote has no id?!?');
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
