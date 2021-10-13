import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction, TextChannel} from 'discord.js';
import {ApplicationCommandPermissionTypes as PermissionTypes} from 'discord.js/typings/enums';
import Bot from '../Bot';
import {ReactionMessage} from '../entity/ReactionMessage';
import {ReactionRole} from '../entity/ReactionRole';
import Command from './Command';

export default class CreateRRCommand implements Command {
    private INVALID_CHANNEL_MESSAGE = 'Given channel must be a text channel';
    private INVALID_MESSAGEID_MESSAGE = 'Could not find a message with that ID';
    private INVALID_EMOTEID_MESSAGE = 'Could not find an emote with that ID';

    public slashCommandBuilder = new SlashCommandBuilder()
        .setName('create-rr')
        .setDescription('Create a reaction role')
        .setDefaultPermission(false)
        .addChannelOption((option) =>
            option.setName('channel')
                .setDescription('The channel to add the reaction role in')
                .setRequired(true),
        ).addStringOption((option) =>
            option.setName('message-id')
                .setDescription('The ID of the message to add the reaction role to')
                .setRequired(true),
        ).addStringOption((option) =>
            option.setName('emote-id')
                .setDescription('The ID of the emote to add the reaction role with')
                .setRequired(true),
        ).addRoleOption((option) =>
            option.setName('role')
                .setDescription('The role to add the reaction role for')
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
        const role = interaction.options.getRole('role')!;

        // Confirm the arguments provided are valid

        if (channel.type !== 'GUILD_TEXT') {
            await interaction.reply(this.INVALID_CHANNEL_MESSAGE);
            return;
        }

        // TODO: Confirm this works with invalid message IDs
        const message = await (channel as TextChannel).messages.fetch(messageID);
        if (!message) {
            await interaction.reply(this.INVALID_MESSAGEID_MESSAGE);
            return;
        }

        // TODO: Also confirm this works with invalid emote IDs
        const emote = await Bot.guild.emojis.fetch(emoteID);
        if (!emote) {
            await interaction.reply(this.INVALID_EMOTEID_MESSAGE);
            return;
        }

        // Find existing
        const reactionMessage = await ReactionMessage.findOne({messageID});
        if (reactionMessage) {
            const existingRoleID = reactionMessage.reactionRoles.find((reactionRole) => reactionRole.emoteID === emoteID);
            if (existingRoleID) {
                await interaction.reply('A reaction role already exists for that emote');
                return;
            } else {
                // Add to the existing
                const reactionRole = new ReactionRole();
                reactionRole.emoteID = emoteID;
                reactionRole.roleID = role.id;
                reactionMessage.reactionRoles.push(reactionRole);
                await message.react(emoteID);
                await reactionMessage.save();
                await interaction.reply('Successfully registered new reaction role.');
                return;
            }
        } else {
            // Create new
            const newReactionMessage = new ReactionMessage();
            newReactionMessage.messageID = messageID;
            newReactionMessage.channelID = channel.id;
            const reactionRole = new ReactionRole();
            reactionRole.emoteID = emoteID;
            reactionRole.roleID = role.id;
            newReactionMessage.reactionRoles = [reactionRole];
            await message.react(emoteID);
            await newReactionMessage.save();
            await interaction.reply('Successfully registered new reaction role.');
            return;
        }
    }
};