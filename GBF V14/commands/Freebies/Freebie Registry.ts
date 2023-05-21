const SlashCommand = require("../../utils/slashCommands").default;

import {
  ApplicationCommandOptionType,
  ChannelType,
  Client,
  ColorResolvable,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
  hyperlink
} from "discord.js";

import { redBright, greenBright } from "chalk";

import { FreebieProfileModel } from "../../schemas/Freebie Schemas/Server Profile Schema";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";
import { Developers, SupportServer } from "../../config/GBFconfig.json";
import CommandLinks from "../../GBF/GBFCommands.json";
import FreebieIDs from "../../GBF/Freebie Features.json";

import { capitalize } from "../../utils/Engine";

interface IExecute {
  client: Client;
  interaction: CommandInteraction;
}

const WelcomeMessage = new EmbedBuilder()
  .setTitle(`${emojis.ParrotDance} Welcome to GBF Freebies 🎉`)
  .setColor(colors.DEFAULT as ColorResolvable)
  .setDescription(
    `This will be the channel where GBF Freebie announcements and default setting freebies are sent to, happy gaming!`
  )
  .setFooter({
    text: `Need help? Run /freebie help`
  });

export default class FreebieRegistry extends SlashCommand {
  constructor(client: Client) {
    super(client, {
      name: "freebie",
      description: "GBF Freebie commands",
      userPermission: [PermissionFlagsBits.Administrator],
      botPermission: [
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageRoles
      ],
      cooldown: 5,
      devBypass: true,
      subcommands: {
        register: {
          description: "Register your server to be part of GBF Freebies",
          args: [
            {
              name: "automatic-setup",
              description:
                "Choose if you want GBF to setup the system for you automatically",
              type: ApplicationCommandOptionType.Boolean,
              required: true
            },
            {
              name: "channel",
              description: "The channel that you want to send the Freebies to",
              type: ApplicationCommandOptionType.Channel,
              channelTypes: [
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement
              ]
            },
            {
              name: "mention",
              description:
                "Choose wether GBF should mention a role / everyone when a freebie is sent",
              type: ApplicationCommandOptionType.Boolean
            },
            {
              name: "role",
              description:
                "The role that will be mentioned whenever a freebie is sent",
              type: ApplicationCommandOptionType.Role
            },
            {
              name: "embed-color",
              description:
                "The color of the embed that will store the freebie information [Format: #RRGGBB]",
              type: ApplicationCommandOptionType.String
            }
          ],
          execute: async ({ client, interaction }: IExecute) => {
            const serverData = await FreebieProfileModel.findOne({
              guildId: interaction.guild.id
            });

            const serverRegisterd = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `${interaction.guild.name} is already a registered GBF Freebies server.`
              )
              .setColor(colors.ERRORRED as ColorResolvable);

            if (serverData)
              return interaction.reply({
                embeds: [serverRegisterd],
                ephemeral: true
              });

            const autoSetup = (
              interaction.options as CommandInteractionOptionResolver
            ).getBoolean("automatic-setup", true);
            const freebieChannel = (
              interaction.options as CommandInteractionOptionResolver
            ).getChannel("channel", false) as TextChannel;
            const mentionBoolean =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getBoolean("mention", false) || false;
            const freebieRole = (
              interaction.options as CommandInteractionOptionResolver
            ).getRole("role", false);
            let embedColor =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getString("embed-color") || colors.DEFAULT;

            const channelRequired = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(`Specify a channel to send the freebies to.`)
              .setColor(colors.ERRORRED as ColorResolvable);

            if (!autoSetup && !freebieChannel)
              return interaction.reply({
                embeds: [channelRequired],
                ephemeral: true
              });

            const specifyRole = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `Specify a role to mention when a freebie is sent.`
              )
              .setColor(colors.ERRORRED as ColorResolvable);

            if (!autoSetup && mentionBoolean && !freebieRole)
              return interaction.reply({
                embeds: [specifyRole],
                ephemeral: true
              });

            const colorCodeRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

            const invalidColor = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `The color specified (${embedColor}) does not match the correct format (#RRGGBB), you can get HTML color codes from ${hyperlink(
                  "here",
                  "https://htmlcolorcodes.com/"
                )}, I've automatically set the color code to ${
                  colors.DEFAULT
                }, if you'd like to change it later use ${
                  CommandLinks.FreebieCosmetic
                }`
              );

            if (!colorCodeRegex.test(embedColor)) {
              await interaction.reply({
                embeds: [invalidColor],
                ephemeral: true
              });
              embedColor = colors.DEFAULT;
            }

            const RegistryChannel = client.channels.cache.get(
              FreebieIDs.RegistryChannel
            ) as TextChannel;

            if (!RegistryChannel)
              console.log(
                redBright(
                  `The Freebie Registry Channel: ${FreebieIDs.RegistryChannel} was not found, updates will be sent here.`
                )
              );

            const registryID =
              `#` +
              Math.random().toString(36).substring(2, 8) +
              `${Math.round(Math.random() * 5000)}`;

            const FreebieSettingsMessage = `${
              autoSetup === true
                ? capitalize(autoSetup.toString())
                : `False\n• Ping: ${capitalize(mentionBoolean.toString())}`
            }`;

            const ServerRegistered = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} New Freebie Registration`)
              .setColor(embedColor as ColorResolvable)
              .addFields(
                {
                  name: "• Registeration ID:",
                  value: `${registryID}`
                },
                {
                  name: "• Server Info:",
                  value: `• Name: ${interaction.guild.name}\n• ID: ${
                    interaction.guild.id
                  }\n• Total Human Count: ${
                    interaction.guild.members.cache.filter(
                      (member) => !member.user.bot
                    ).size
                  }`
                },
                {
                  name: "• Freebie Settings:",
                  value: `• Automatic: ${FreebieSettingsMessage}`
                }
              );

            if (!autoSetup) {
              const newServerProfile = new FreebieProfileModel({
                FreebieId: registryID,
                guildId: interaction.guild.id,
                Enabled: true,
                Channel: freebieChannel.id,
                Ping: mentionBoolean,
                rolePing: freebieRole.id,
                embedColor: embedColor
              });

              await newServerProfile.save();

              const ManualSetup = new EmbedBuilder()
                .setTitle(`${emojis.VERIFY} Success`)
                .setColor(embedColor as ColorResolvable)
                .setDescription(
                  `${
                    interaction.guild.name
                  } has officially been registered as a GBF Freebies Channel | It is recommended to check out the ${hyperlink(
                    "GBF Freebies Setup Guide",
                    FreebieIDs.GuideLink
                  )}`
                )
                .addFields(
                  {
                    name: "Freebie Channel:",
                    value: `${freebieChannel}`
                  },
                  {
                    name: "Mention",
                    value: `${capitalize(mentionBoolean.toString())}`
                  },
                  {
                    name: "Color",
                    value: `${embedColor}`
                  },
                  {
                    name: "Registry ID:",
                    value: `${registryID}`
                  },
                  {
                    name: "Automatic Setup:",
                    value: `${capitalize(autoSetup.toString())}`
                  }
                );

              await interaction.reply({
                embeds: [ManualSetup]
              });

              let DevelopersMention: string = "";
              for (let i = 0; i < Developers.length; i++) {
                if (i === Developers.length - 1) {
                  DevelopersMention += `<@${Developers[i]}>`;
                } else {
                  DevelopersMention += `<@${Developers[i]}>, `;
                }
              }

              console.log(
                greenBright(
                  `New Freebies Registration : ${interaction.guild.name} - ${
                    interaction.guild.members.cache.filter(
                      (member) => !member.user.bot
                    ).size
                  }\nID: ${registryID}`
                )
              );

              await freebieChannel.send({
                embeds: [WelcomeMessage]
              });

              return RegistryChannel.send({
                content: `${DevelopersMention}`,
                embeds: [ServerRegistered]
              });
            } else {
              const AutoFreebieChannel =
                await interaction.guild.channels.create({
                  name: "free-games",
                  type: ChannelType.GuildText,
                  reason: "GBF Freebies Automatic Setup",
                  topic:
                    "Paid games that are free for a limited time are sent here | Powered by GBF"
                });

              await AutoFreebieChannel.permissionOverwrites.set(
                [
                  {
                    id: interaction.guild.id,
                    deny: [PermissionFlagsBits.SendMessages],
                    allow: [PermissionFlagsBits.ViewChannel]
                  },
                  {
                    id: client.user.id,
                    allow: [
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.EmbedLinks,
                      PermissionFlagsBits.UseExternalEmojis
                    ]
                  }
                ],
                `GBF Freebie Automatic Setup`
              );

              const newServerProfile = new FreebieProfileModel({
                FreebieId: registryID,
                guildId: interaction.guild.id,
                Enabled: true,
                Channel: AutoFreebieChannel.id,
                Ping: false,
                rolePing: null,
                embedColor: embedColor
              });

              await newServerProfile.save();

              const AutoMaticSetup = new EmbedBuilder()
                .setTitle(`${emojis.VERIFY} Success`)
                .setColor(embedColor as ColorResolvable)
                .setDescription(
                  `${
                    interaction.guild.name
                  } has officially been registered as a GBF Freebies Channel | It is recommended to check out the ${hyperlink(
                    "GBF Freebies Setup Guide",
                    FreebieIDs.GuideLink
                  )}`
                )
                .addFields(
                  {
                    name: "Automatic Setup:",
                    value: `${capitalize(autoSetup.toString())}`
                  },
                  {
                    name: "Embed Color:",
                    value: `${embedColor}`
                  }
                );

              await interaction.reply({
                embeds: [AutoMaticSetup]
              });

              let DevelopersMention: string = "";
              for (let i = 0; i < Developers.length; i++) {
                if (i === Developers.length - 1) {
                  DevelopersMention += `<@${Developers[i]}>`;
                } else {
                  DevelopersMention += `<@${Developers[i]}>, `;
                }
              }

              console.log(
                greenBright(
                  `New Freebies Registration : ${interaction.guild.name} - ${
                    interaction.guild.members.cache.filter(
                      (member) => !member.user.bot
                    ).size
                  }\nID: ${registryID}`
                )
              );

              await AutoFreebieChannel.send({
                embeds: [WelcomeMessage]
              });

              return RegistryChannel.send({
                content: `${DevelopersMention}`,
                embeds: [ServerRegistered]
              });
            }
          }
        },
        help: {
          description: "Get help with GBF Freebies setup",
          execute: async ({ client, interaction }: IExecute) => {
            const HelpEmbed = new EmbedBuilder()
              .setTitle(`🆘 GBF Freebies Support`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `• Setup Guide: ${hyperlink(
                  "Setup Guide",
                  FreebieIDs.GuideLink,
                  "Secret Text"
                )}\n• Support Server: ${hyperlink(
                  "GBF Support Server",
                  SupportServer,
                  "Another secret text?"
                )}`
              );

            return interaction.reply({
              embeds: [HelpEmbed],
              ephemeral: true
            });
          }
        }
      }
    });
  }
}
