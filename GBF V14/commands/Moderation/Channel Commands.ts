import SlashCommand from "../../utils/slashCommands";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  GuildTextBasedChannel,
  VoiceBasedChannel,
  ColorResolvable,
  Role,
  CommandInteraction,
  CommandInteractionOptionResolver,
  APIRole
} from "discord.js";

import { basicMsToTime } from "../../utils/Engine";
import GBFClient from "../../handler/clienthandler";

interface IExecute {
  client: GBFClient;
  interaction: CommandInteraction;
}

export default class ChannelCommands extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "channel",
      description: "Channel moderation related commands",
      userPermission: [PermissionFlagsBits.ManageChannels],
      botPermission: [PermissionFlagsBits.ManageChannels],
      cooldown: 5,
      category: "Moderation",
      development: true,
      subcommands: {
        lock: {
          description: "Lock a channel",
          args: [
            {
              name: "channel",
              description: "The channel that you want to lock",
              type: ApplicationCommandOptionType.Channel,
              channelTypes: [ChannelType.GuildText, ChannelType.GuildVoice]
            },
            {
              name: "role",
              description: "The role that you want to lock the channel to",
              type: ApplicationCommandOptionType.Role
            },
            {
              name: "reason",
              description: "The reason for locking the channel",
              type: ApplicationCommandOptionType.String
            }
          ],
          execute: async ({ client, interaction }) => {
            const targetChannel: GuildTextBasedChannel | VoiceBasedChannel =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getChannel("channel") || interaction.channel;
            const targetRole: string | NonNullable<Role | APIRole> =
              (interaction.options as CommandInteractionOptionResolver).getRole(
                "role"
              ) || interaction.guild.id;
            const lockReason: string =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getString("reason") || "No Reason Specified";

            let displayRole: string;
            if (targetRole === interaction.guild.id) displayRole = `@everyone`;
            else displayRole = `<@&${(targetRole as Role).id}>`;

            const ChannelAlreadyLocked = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(
                `The channel is already locked for ${displayRole}`
              )
              .setFooter({
                text: `If the @everyone role is denied, even if the specified permission is not denied it will still return that the channel is locked`
              });

            if (
              !targetChannel
                .permissionsFor(targetRole as Role)
                .has(PermissionFlagsBits.SendMessages)
            )
              return interaction.reply({
                embeds: [ChannelAlreadyLocked],
                ephemeral: true
              });

            const channelLocked = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Channel Locked`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `Successfully locked ${targetChannel} for ${displayRole}`
              )
              .setTimestamp()
              .setFooter({
                text: `Reason: ${lockReason}`
              });

            if (targetChannel.type === ChannelType.GuildVoice) {
              await targetChannel.permissionOverwrites.set(
                [
                  {
                    id:
                      targetRole !== interaction.guild.id
                        ? (targetRole as Role).id
                        : interaction.guild.id,
                    deny: [PermissionFlagsBits.Connect]
                  }
                ],
                lockReason
              );
            } else if (
              targetChannel.type === ChannelType.GuildText ||
              targetChannel.type === ChannelType.GuildAnnouncement
            ) {
              await targetChannel.permissionOverwrites.set(
                [
                  {
                    id:
                      targetRole !== interaction.guild.id
                        ? (targetRole as Role).id
                        : interaction.guild.id,
                    deny: [PermissionFlagsBits.SendMessages]
                  }
                ],
                lockReason
              );
            }

            return interaction.reply({
              embeds: [channelLocked]
            });
          }
        },
        unlock: {
          description: "Unlock a locked channel",
          args: [
            {
              name: "channel",
              description: "The channel that you want to unlock",
              type: ApplicationCommandOptionType.Channel,
              channelTypes: [
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement,
                ChannelType.GuildVoice
              ]
            },
            {
              name: "role",
              description: "The role that you want to unlock the channel to",
              type: ApplicationCommandOptionType.Role
            },
            {
              name: "reason",
              description: "The reason for unlocking the channel",
              type: ApplicationCommandOptionType.String,
              required: false
            }
          ],
          execute: async ({ client, interaction }) => {
            const targetChannel: GuildTextBasedChannel | VoiceBasedChannel =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getChannel("channel") || interaction.channel;
            const targetRole: string | NonNullable<Role | APIRole> =
              (interaction.options as CommandInteractionOptionResolver).getRole(
                "role"
              ) || interaction.guild.id;
            const unlockReason: string =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getString("reason") || "No Reason Specified";

            let displayRole: string;
            if (targetRole !== interaction.guild.id)
              displayRole = `<@&${(targetRole as Role).id}>`;
            else displayRole = `@everyone`;

            const ChannelAlreadyUnlocked = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(
                `The channel is already unlocked for ${displayRole}`
              )
              .setFooter({
                text: `If the @everyone role is allowed, even if the specified permission is not allowed it will still return that the channel is unlocked`
              });

            if (
              targetChannel
                .permissionsFor(targetRole as Role)
                .has(PermissionFlagsBits.SendMessages)
            )
              return interaction.reply({
                embeds: [ChannelAlreadyUnlocked],
                ephemeral: true
              });

            const channelUnlocked = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Channel Unlocked`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `Successfully unlocked ${targetChannel} for ${displayRole}`
              )
              .setTimestamp()
              .setFooter({
                text: `Reason: ${unlockReason}`
              });

            if (targetChannel.type === ChannelType.GuildVoice) {
              await targetChannel.permissionOverwrites.set(
                [
                  {
                    id:
                      targetRole !== interaction.guild.id
                        ? (targetRole as Role).id
                        : interaction.guild.id,
                    allow: [PermissionFlagsBits.Connect]
                  }
                ],
                unlockReason
              );
            } else if (
              targetChannel.type === ChannelType.GuildText ||
              targetChannel.type === ChannelType.GuildAnnouncement
            ) {
              await targetChannel.permissionOverwrites.set(
                [
                  {
                    id:
                      targetRole !== interaction.guild.id
                        ? (targetRole as Role).id
                        : interaction.guild.id,
                    allow: [PermissionFlagsBits.SendMessages]
                  }
                ],
                unlockReason
              );
            }

            return interaction.reply({
              embeds: [channelUnlocked]
            });
          }
        },
        slowmode: {
          description: "Set a slowmode for a channel",
          args: [
            {
              name: "slowmode",
              description: "Slow mode setting",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "off",
                  value: "0"
                },
                {
                  name: "5s",
                  value: "5"
                },
                {
                  name: "10s",
                  value: "10"
                },
                {
                  name: "15s",
                  value: "15"
                },
                {
                  name: "30s",
                  value: "30"
                },
                {
                  name: "1m",
                  value: "60"
                },
                {
                  name: "2m",
                  value: "120"
                },
                {
                  name: "5m",
                  value: "300"
                },
                {
                  name: "10m",
                  value: "600"
                },
                {
                  name: "15m",
                  value: "900"
                },
                {
                  name: "30m",
                  value: "1800"
                },
                {
                  name: "1h",
                  value: "3600"
                },
                {
                  name: "2h",
                  value: "7200"
                },
                {
                  name: "6h",
                  value: "21600"
                }
              ],
              required: true
            },
            {
              name: "channel",
              description: "The channel that you want to enable slowmode on",
              type: ApplicationCommandOptionType.Channel,
              channelTypes: [
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement
              ]
            }
          ],
          execute: async ({ client, interaction }) => {
            const slowmodeDuration: number = Number(
              (
                interaction.options as CommandInteractionOptionResolver
              ).getString("slowmode")
            );
            const targetChannel: GuildTextBasedChannel =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getChannel("channel") || interaction.channel;

            const SuccessEmbed = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Success!`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (!slowmodeDuration) {
              SuccessEmbed.setDescription(
                `Disabled slowmode in ${targetChannel}`
              );
              await targetChannel.setRateLimitPerUser(0);
              return interaction.reply({
                embeds: [SuccessEmbed]
              });
            }

            SuccessEmbed.setDescription(
              `Slowmode in ${targetChannel} has been set to ${basicMsToTime(
                slowmodeDuration * 1000,
                0
              )}`
            );
            await targetChannel.setRateLimitPerUser(slowmodeDuration);

            return interaction.reply({
              embeds: [SuccessEmbed]
            });
          }
        }
      }
    });
  }
}
