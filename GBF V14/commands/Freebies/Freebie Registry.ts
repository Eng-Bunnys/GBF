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

              WelcomeMessage.setColor(embedColor as ColorResolvable);

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

              WelcomeMessage.setColor(embedColor as ColorResolvable);

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
        },
        categories: {
          description: "Customize the category settings",
          args: [
            {
              name: "enable-all",
              description: "Enable all the categories [Enabled by default]",
              type: ApplicationCommandOptionType.Boolean
            },
            {
              name: "send-steam",
              description:
                "Choose whether GBF should tell you when a Steam freebie is available.",
              type: ApplicationCommandOptionType.Boolean
            },
            {
              name: "steam-mention",
              description:
                "Choose whether GBF should mention a role whenever a Steam freebe is sent.",
              type: ApplicationCommandOptionType.Boolean
            },
            {
              name: "steam-role",
              description:
                "Choose the role that GBF should ping whenever a Steam freebie is sent.",
              type: ApplicationCommandOptionType.Role
            },
            {
              name: "steam-channel",
              description:
                "Choose the channel that GBF should send Steam freebies to.",
              type: ApplicationCommandOptionType.Channel,
              channelTypes: [
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement
              ]
            },
            {
              name: "send-epic-games",
              description:
                "Choose whether GBF should tell you when an Epic Games freebie is available.",
              type: ApplicationCommandOptionType.Boolean
            },
            {
              name: "epic-games-mention",
              description:
                "Choose whether GBF should mention a role whenever an Epic Games freebe is sent.",
              type: ApplicationCommandOptionType.Boolean
            },
            {
              name: "epic-games-role",
              description:
                "Choose the role that GBF should ping whenever an Epic Games freebie is sent.",
              type: ApplicationCommandOptionType.Role
            },
            {
              name: "epic-games-channel",
              description:
                "Choose the channel that GBF should send Epic Games freebies to.",
              type: ApplicationCommandOptionType.Channel,
              channelTypes: [
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement
              ]
            },
            {
              name: "send-other",
              description:
                "Choose whether GBF should tell you when a freebie from another game store is available.",
              type: ApplicationCommandOptionType.Boolean
            },
            {
              name: "other-mention",
              description:
                "Choose whether GBF should mention a role whenever an Other game store freebe is sent.",
              type: ApplicationCommandOptionType.Boolean
            },
            {
              name: "other-role",
              description:
                "Choose the role that GBF should ping whenever an Other game store freebie is sent.",
              type: ApplicationCommandOptionType.Role
            },
            {
              name: "other-channel",
              description:
                "Choose the channel that GBF should send Other freebies to.",
              type: ApplicationCommandOptionType.Channel,
              channelTypes: [
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement
              ]
            }
          ],
          execute: async ({ client, interaction }: IExecute) => {
            const ServerData = await FreebieProfileModel.findOne({
              guildId: interaction.guild.id
            });

            const NotRegistered = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `${interaction.guild.name} is not a GBF Freebies server, you can register using ${CommandLinks.FreebieRegister}`
              )
              .setColor(colors.ERRORRED as ColorResolvable);

            if (!ServerData)
              return interaction.reply({
                embeds: [NotRegistered],
                ephemeral: true
              });

            const FreebiesDisabled = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `GBF Freebies is disabled in ${interaction.guild.name}, you can enable it using ${CommandLinks.FreebieUpdate}`
              )
              .setColor(colors.ERRORRED as ColorResolvable);

            if (!ServerData.Enabled)
              return interaction.reply({
                embeds: [FreebiesDisabled],
                ephemeral: true
              });

            const AllEnabled =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getBoolean("enable-all", false) || true;
            const SteamBoolean =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getBoolean("send-steam", false) || AllEnabled;
            const SteamMention =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getBoolean("steam-mention", false) || false;
            const SteamRole = (
              interaction.options as CommandInteractionOptionResolver
            ).getRole("steam-role", false);
            const SteamChannel = (
              interaction.options as CommandInteractionOptionResolver
            ).getChannel("steam-channel", false) as TextChannel;

            const EpicBoolean =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getBoolean("send-epic-games", false) || AllEnabled;
            const EpicMention =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getBoolean("epic-games-mention", false) || false;
            const EpicRole = (
              interaction.options as CommandInteractionOptionResolver
            ).getRole("epic-games-role", false);
            const EpicChannel = (
              interaction.options as CommandInteractionOptionResolver
            ).getChannel("epic-games-channel", false) as TextChannel;

            const OtherBoolean =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getBoolean("send-other", false) || AllEnabled;
            const OtherMention =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getBoolean("other-mention", false) || false;
            const OtherRole = (
              interaction.options as CommandInteractionOptionResolver
            ).getRole("other-role", false);
            const OtherChannel = (
              interaction.options as CommandInteractionOptionResolver
            ).getChannel("other-channel", false) as TextChannel;

            if (
              !SteamBoolean &&
              !SteamMention &&
              !SteamRole &&
              !SteamChannel &&
              !EpicBoolean &&
              !EpicMention &&
              !EpicRole &&
              !EpicChannel &&
              !OtherBoolean &&
              !OtherMention &&
              !OtherRole &&
              !OtherChannel
            ) {
              return interaction.reply({
                content:
                  "Please specify at least one service or setting to update.",
                ephemeral: true
              });
            }

            const SteamUpdatedSettings: string = `${
              emojis.STEAMLOGO
            } Steam\n• ${
              SteamBoolean ? "Enabled" : "Disabled"
            }\n• Mention: ${capitalize(SteamMention.toString())}\n• Role: ${
              SteamRole ? SteamRole : "No Role Specified"
            }\n• Channel: ${
              SteamChannel ? SteamChannel : "No Channel Specified"
            }`;

            const EpicGamesUpdatedSettings: string = `${
              emojis.EPIC
            } Epic Games\n• ${
              EpicBoolean ? "Enabled" : "Disabled"
            }\n• Mention: ${capitalize(EpicMention.toString())}\n• Role: ${
              EpicRole ? EpicRole : "No Role Specified"
            }\n• Channel: ${
              EpicChannel ? EpicChannel : "No Channel Specified"
            }`;

            const OtherUpdatedSettings: string = `${emojis.GOGLOGO} ${
              emojis.UBISOFTLOGO
            } ${emojis.ORIGINLOGO} Other\n• ${
              OtherBoolean ? "Enabled" : "Disabled"
            }\n• Mention: ${capitalize(OtherMention.toString())}\n• Role: ${
              OtherRole ? OtherRole : "No Role Specified"
            }\n• Channel: ${
              OtherChannel ? OtherChannel : "No Channel Specified"
            }`;

            if (SteamChannel) {
              await SteamChannel.permissionOverwrites.set(
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
                `GBF Freebie Setup [Steam]`
              );
            }
            if (EpicChannel) {
              await EpicChannel.permissionOverwrites.set(
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
                `GBF Freebie Setup [Epic Games]`
              );
            }

            if (OtherChannel) {
              await OtherChannel.permissionOverwrites.set(
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
                `GBF Freebie Setup [Other]`
              );
            }

            await ServerData.updateOne({
              AllEnabled: AllEnabled,
              EGSEnabled: EpicBoolean,
              EGSRole: EpicRole ? EpicRole.id : ServerData.EGSRole,
              EGSMention: EpicMention,
              EGSChannel: EpicChannel ? EpicChannel.id : ServerData.EGSChannel,
              SteamEnabled: SteamBoolean,
              SteamMention: SteamMention,
              SteamChannel: SteamChannel
                ? SteamChannel.id
                : ServerData.SteamChannel,
              SteamRole: SteamRole ? SteamRole.id : ServerData.SteamRole,
              OtherEnabled: OtherBoolean,
              OtherMention: OtherMention,
              OtherChannel: OtherChannel
                ? OtherChannel.id
                : ServerData.OtherChannel,
              OtherRole: OtherRole ? OtherRole.id : ServerData.OtherRole
            });

            const FreebieCategoryUpdated = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Success`)
              .setDescription(
                `Updated GBF Freebies Settings\n\n${EpicGamesUpdatedSettings}\n\n${SteamUpdatedSettings}\n\n${OtherUpdatedSettings}`
              )
              .setColor(ServerData.embedColor as ColorResolvable)
              .setFooter({
                text: `Confused? Run /freebie help for help with setting up GBF Freebeis`
              });

            return interaction.reply({
              embeds: [FreebieCategoryUpdated]
            });
          }
        },
        update: {
          description: "Update your server's GBF Freebies default settings",
          args: [
            {
              name: "send-freebies",
              description:
                "Set this option to false if you want to disable GBF Freebies from your server.",
              type: ApplicationCommandOptionType.Boolean
            },
            {
              name: "use-default",
              description: "Use the GBF Freebies default settings",
              type: ApplicationCommandOptionType.Boolean
            },
            {
              name: "default-channel",
              description: "The default GBF Freebies channel",
              type: ApplicationCommandOptionType.Channel,
              channelTypes: [
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement
              ]
            },
            {
              name: "default-mention",
              description:
                "Choose whether GBF should mention a role by default when a freebie is sent",
              type: ApplicationCommandOptionType.Boolean
            },
            {
              name: "default-role",
              description:
                "Choose the default role that GBF should mention when a freebie is sent",
              type: ApplicationCommandOptionType.Role
            }
          ],
          execute: async ({ client, interaction }: IExecute) => {
            const DisableFreebies =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getBoolean("send-freebies", false) || false;
            const UseDefault = (
              interaction.options as CommandInteractionOptionResolver
            ).getBoolean("use-default", false);
            const DefaultChannel = (
              interaction.options as CommandInteractionOptionResolver
            ).getChannel("default-channel", false);
            const DefaultMention = (
              interaction.options as CommandInteractionOptionResolver
            ).getBoolean("default-mention", false);
            const DefaultRole = (
              interaction.options as CommandInteractionOptionResolver
            ).getRole("default-role", false);

            const ServerData = await FreebieProfileModel.findOne({
              guildId: interaction.guild.id
            });

            const NotRegistered = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `${interaction.guild.name} is not a GBF Freebies server, you can register using ${CommandLinks.FreebieRegister}`
              )
              .setColor(colors.ERRORRED as ColorResolvable);

            if (!ServerData)
              return interaction.reply({
                embeds: [NotRegistered],
                ephemeral: true
              });

            const FreebiesDisabled = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `GBF Freebies is disabled in ${interaction.guild.name}, you can enable it using ${CommandLinks.FreebieUpdate}`
              )
              .setColor(colors.ERRORRED as ColorResolvable);

            if (!ServerData.Enabled && !DisableFreebies)
              return interaction.reply({
                embeds: [FreebiesDisabled],
                ephemeral: true
              });

            const NoChoiceMade = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(`You need to choose at least one option.`);

            if (
              !UseDefault &&
              !DefaultChannel &&
              !DefaultMention &&
              !DefaultRole
            )
              return interaction.reply({
                embeds: [NoChoiceMade],
                ephemeral: true
              });

            const GoodbyeMessage = new EmbedBuilder()
              .setTitle(`${emojis.Crying} We're sad to see you go so soon.`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `We'd like to hear your thoughts on GBF Freebies [${hyperlink(
                  "here",
                  "https://forms.gle/5n2puvQHyhJrJ8VU7"
                )}], if you'd like to re-enable GBF Freebies, you can do so using: ${
                  CommandLinks.FreebieUpdate
                }`
              );

            if (DisableFreebies)
              return interaction.reply({
                embeds: [GoodbyeMessage]
              });
          }
        }
      }
    });
  }
}
