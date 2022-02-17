import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';
import {ApplicationCommandPermissionTypes as PermissionTypes} from 'discord.js/typings/enums';
import Bot from '../Bot';
import {ReactionMessage} from '../entity/ReactionMessage';
import Command from './Command';

export default class RemoveRRCommand implements Command {
    private INVALID_CHANNEL_MESSAGE = 'Given channel must be a text channel';
    private INVALID_MESSAGEID_MESSAGE = 'Could not find a message with that ID';

    public slashCommandBuilder = new SlashCommandBuilder()
        .setName('remove-rr')
        .setDescription('Removes a reaction role')
        .setDefaultPermission(false)
        .addChannelOption((option) =>
            option.setName('channel')
                .setDescription('The channel to add the reaction role in')
                .setRequired(true),
        ).addStringOption((option) =>
            option.setName('message-id')
                .setDescription('The ID of the message the reaction role is on')
                .setRequired(true),
        ).addStringOption((option) =>
            option.setName('emote-id')
                .setDescription('The ID of the emote of the reaction role')
                .setRequired(true),
        );

    public permissions = [{
        id: process.env.STAFF_ID!,
        type: PermissionTypes.ROLE,
        permission: true,
    }];

    public async execute(interaction: CommandInteraction) {
        // Required options so should be safe to assert not null
        const channel = interaction.options.getChannel('channel')!;
        const messageID = interaction.options.getString('message-id')!;
        const emoteID = interaction.options.getString('emote-id')!;

        const reactionMessage = await ReactionMessage.findOne({messageID});
        if (!reactionMessage) {
            await interaction.reply('Couldn\'t find a reaction role on that message');
            return;
        }

        const reactionRole = reactionMessage.reactionRoles.find((reactionRole) => reactionRole.emoteID === emoteID);
        if (!reactionRole) {
            await interaction.reply('Couldn\'t find a reaction role with that emote on the message');
            return;
        }

        if (channel.type !== 'GUILD_TEXT') {
            await interaction.reply(this.INVALID_CHANNEL_MESSAGE);
            return;
        }

        // TODO: Confirm this works with invalid message IDs
        const message = await channel.messages.fetch(messageID);
        if (!message) {
            await interaction.reply(this.INVALID_MESSAGEID_MESSAGE);
            return;
        }

        await reactionRole.remove();

        const reaction = message.reactions.cache.find((reaction) => reaction.me && reaction.emoji.id === emoteID);
        if (!reaction) {
            await interaction.reply('Couldn\'t find the reaction on that message, removed reaction role anyway');
        } else {
            await reaction.users.remove(Bot.client.user!.id); // Assert that the client is currently logged in, therefore user exists
            await interaction.reply('Successfully removed reaction role');
        }
    }
}
