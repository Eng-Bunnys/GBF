import SlashCommand from "../../utils/slashCommands";

import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChannelType,
  ColorResolvable,
  CommandInteraction,
  CommandInteractionOptionResolver,
  ComponentType,
  EmbedBuilder,
  Interaction,
  PermissionFlagsBits,
  TextChannel,
  hyperlink
} from "discord.js";

import { redBright, greenBright } from "chalk";

import { FreebieProfileModel } from "../../schemas/Freebie Schemas/Server Profile Schema";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";
import CommandLinks from "../../GBF/GBFCommands.json";
import FreebieIDs from "../../GBF/Freebie Features.json";

import { capitalize, delay } from "../../utils/Engine";
import GBFClient from "../../handler/clienthandler";
import {
  ConfirmButtons,
  ControlPanel,
  ControlPanelFirstRow,
  ControlPanelFirstRowDisabled,
  ControlPanelSecondRow,
  ControlPanelSecondRowDisabled,
  FreebieCodes,
  LauncherGamesNumbers,
  PanelEpicGamesEmbed,
  PanelEpicGamesRow,
  PanelGOGEmbed,
  PanelGOGRow,
  PanelOriginEmbed,
  PanelOriginRow,
  PanelPrimeEmbed,
  PanelPrimeRow,
  PanelSteamEmbed,
  PanelSteamRow,
  PanelUbisoftEmbed,
  PanelUbisoftRow
} from "../../GBF/Freebies/Send Embeds";
import {
  EpicGamesOneGameInfoEmbed,
  EpicGamesThreeGamesInfoEmbed,
  EpicGamesTwoGamesInfoEmbed
} from "../../GBF/Freebies/Epic Games/Epic Games UI";
import {
  SteamOneGameInfoEmbed,
  SteamThreeGamesInfoEmbed,
  SteamTwoGamesInfoEmbed
} from "../../GBF/Freebies/Steam/Steam UI";
import {
  GOGOneGameInfoEmbed,
  GOGThreeGamesInfoEmbed,
  GOGsTwoGamesInfoEmbed
} from "../../GBF/Freebies/GOG/GOG UI";
import {
  OriginOneGameInfoEmbed,
  OriginThreeGamesInfoEmbed,
  OriginTwoGamesInfoEmbed
} from "../../GBF/Freebies/Origin/Origin UI";
import {
  UbisoftOneGameInfoEmbed,
  UbisoftThreeGamesInfoEmbed,
  UbisoftTwoGamesInfoEmbed
} from "../../GBF/Freebies/Ubisoft/Ubisoft UI";

interface IExecute {
  client: GBFClient;
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
  constructor(client: GBFClient) {
    super(client, {
      name: "freebie",
      description: "GBF Freebie commands",
      userPermission: [
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageRoles
      ],
      botPermission: [
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageRoles
      ],
      category: "Freebie",
      cooldown: 5,
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
                DefaultChannel: freebieChannel ? freebieChannel.id : null,
                DefaultMention: mentionBoolean,
                DefaultRole: freebieRole ? freebieRole.id : null,
                EmbedColor: embedColor
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
              for (let i = 0; i < client.Developers.length; i++) {
                if (i === client.Developers.length - 1) {
                  DevelopersMention += `<@${client.Developers[i]}>`;
                } else {
                  DevelopersMention += `<@${client.Developers[i]}>, `;
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
                DefaultChannel: AutoFreebieChannel.id,
                DefaultMention: false,
                DefaultRole: null,
                EmbedColor: embedColor
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
              for (let i = 0; i < client.Developers.length; i++) {
                if (i === client.Developers.length - 1) {
                  DevelopersMention += `<@${client.Developers[i]}>`;
                } else {
                  DevelopersMention += `<@${client.Developers[i]}>, `;
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
                  client.SupportServer,
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
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Enable All",
                  value: "EnableAll"
                },
                {
                  name: "Use Custom Settings",
                  value: "CustomSettings"
                }
              ]
            },
            {
              name: "send-steam",
              description:
                "Choose whether GBF should tell you when a Steam freebie is available.",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Send Steam Freebies",
                  value: "SendSteam"
                },
                {
                  name: "Don't Send Steam Freebies",
                  value: "NoSteam"
                }
              ]
            },
            {
              name: "steam-mention",
              description:
                "Choose whether GBF should mention a role whenever a Steam freebe is sent.",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Mention a role when a Steam freebie is sent",
                  value: "SteamMention"
                },
                {
                  name: "Don't mention a role",
                  value: "NoSteamMention"
                }
              ]
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
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Send Epic Games Freebies",
                  value: "SendEpic"
                },
                {
                  name: "Don't Send Epic Games Freebies",
                  value: "NoEpic"
                }
              ]
            },
            {
              name: "epic-games-mention",
              description:
                "Choose whether GBF should mention a role whenever an Epic Games freebe is sent.",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Mention a role when an Epic Games freebie is sent",
                  value: "EpicMention"
                },
                {
                  name: "Don't mention a role",
                  value: "NoEpicention"
                }
              ]
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
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: 'Send "Other" Freebies',
                  value: "SendOther"
                },
                {
                  name: 'Don\'t Send "Other"  Freebies',
                  value: "NoOther"
                }
              ]
            },
            {
              name: "other-mention",
              description:
                "Choose whether GBF should mention a role whenever an Other game store freebe is sent.",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: 'Mention a role when an "Other" freebie is sent',
                  value: "OtherMention"
                },
                {
                  name: "Don't mention a role",
                  value: "NoOtherMention"
                }
              ]
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
          execute: async ({ client, interaction }) => {
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

            const AllEnabled = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("enable-all", false);

            let AllCategories: boolean;

            if (AllEnabled) {
              if (AllEnabled === "EnableAll") AllCategories = true;
              else AllCategories = false;
            }
            AllCategories = ServerData.AllEnabled;

            const SteamBoolean = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("send-steam", false);
            const SteamMention = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("steam-mention", false);
            const SteamRole = (
              interaction.options as CommandInteractionOptionResolver
            ).getRole("steam-role", false);
            const SteamChannel = (
              interaction.options as CommandInteractionOptionResolver
            ).getChannel("steam-channel", false) as TextChannel;

            let SendSteamFreebies: boolean;

            if (SteamBoolean) {
              if (SteamBoolean === "SendSteam") SendSteamFreebies = true;
              else SendSteamFreebies = false;
            } else SendSteamFreebies = Boolean(ServerData.SteamEnabled);

            let SteamPing: boolean;

            if (SteamMention) {
              if (SteamMention === "SteamMention") SteamPing = true;
              else SteamPing = false;
            } else SteamPing = ServerData.SteamMention;

            const EpicBoolean = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("send-epic-games", false);
            const EpicMention = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("epic-games-mention", false);
            const EpicRole = (
              interaction.options as CommandInteractionOptionResolver
            ).getRole("epic-games-role", false);
            const EpicChannel = (
              interaction.options as CommandInteractionOptionResolver
            ).getChannel("epic-games-channel", false) as TextChannel;

            let EpicEnabled: boolean;

            if (EpicBoolean) {
              if (EpicBoolean === "SendEpic") EpicEnabled = true;
              else EpicEnabled = false;
            } else EpicEnabled = ServerData.EGSEnabled;

            let EpicPing: boolean;

            if (EpicMention) {
              if (EpicMention === "EpicMention") EpicPing = true;
              else EpicPing = false;
            } else EpicPing = ServerData.EGSMention;

            const OtherBoolean = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("send-other", false);
            const OtherMention = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("other-mention", false);
            const OtherRole = (
              interaction.options as CommandInteractionOptionResolver
            ).getRole("other-role", false);
            const OtherChannel = (
              interaction.options as CommandInteractionOptionResolver
            ).getChannel("other-channel", false) as TextChannel;

            let OtherEnabled: boolean;

            if (OtherBoolean) {
              if (OtherBoolean === "SendOther") OtherEnabled = true;
              else OtherEnabled = false;
            } else OtherEnabled = ServerData.OtherEnabled;

            let OtherPing: boolean;

            if (OtherMention) {
              if (OtherMention === "OtherMention") OtherPing = true;
              else OtherPing = false;
            } else OtherPing = ServerData.OtherMention;

            if (
              !AllEnabled &&
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

            let DefaultSettings: boolean = ServerData.UseDefault;

            if (
              SendSteamFreebies === false ||
              EpicEnabled === false ||
              OtherEnabled
            )
              (AllCategories = false), (DefaultSettings = false);

            const SteamUpdates: string = `${
              emojis.STEAMLOGO
            } Steam\n• Enabled: ${capitalize(
              SendSteamFreebies.toString()
            )}\n• Mention: ${capitalize(SteamPing.toString())}\n• Role: ${
              SteamRole ? SteamRole : "No changes made"
            }\n• Channel: ${SteamChannel ? SteamChannel : "No changes made"}`;

            const EpicUpdates: string = `${
              emojis.EPIC
            } Epic Games\n• Enabled: ${capitalize(
              EpicEnabled.toString()
            )}\n• Mention: ${capitalize(EpicPing.toString())}\n• Role: ${
              EpicRole ? EpicRole : "No changes made"
            }\n• Channel: ${EpicChannel ? EpicChannel : "No changes made"}`;

            const OtherUpdates: string = `${emojis.UBISOFTLOGO}${
              emojis.GOGLOGO
            }${emojis.ORIGINLOGO} Other\n• Enabled: ${capitalize(
              OtherEnabled.toString()
            )}\n• Mention: ${capitalize(OtherPing.toString())}\n• Role: ${
              OtherRole ? OtherRole : "No changes made"
            }\n• Channel: ${OtherChannel ? OtherChannel : "No changes made"}`;

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
              UseDefault: DefaultSettings,
              AllEnabled: AllCategories,
              EGSEnabled: EpicEnabled,
              EGSRole: EpicRole ? EpicRole.id : ServerData.EGSRole,
              EGSMention: EpicPing,
              EGSChannel: EpicChannel ? EpicChannel.id : ServerData.EGSChannel,
              SteamEnabled: Boolean(SendSteamFreebies),
              SteamMention: SteamPing,
              SteamChannel: SteamChannel
                ? SteamChannel.id
                : ServerData.SteamChannel,
              SteamRole: SteamRole ? SteamRole.id : ServerData.SteamRole,
              OtherEnabled: OtherEnabled,
              OtherMention: OtherPing,
              OtherChannel: OtherChannel
                ? OtherChannel.id
                : ServerData.OtherChannel,
              OtherRole: OtherRole ? OtherRole.id : ServerData.OtherRole
            });

            const FreebieCategoryUpdated = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Success`)
              .setDescription(
                `Updated GBF Freebies Settings\n\n${EpicUpdates}\n\n${SteamUpdates}\n\n${OtherUpdates}`
              )
              .setColor(ServerData.EmbedColor as ColorResolvable)
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
            const SendFreebies: boolean =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getBoolean("send-freebies") ?? true;

            const UseDefault = (
              interaction.options as CommandInteractionOptionResolver
            ).getBoolean("use-default");

            const DefaultChannel = (
              interaction.options as CommandInteractionOptionResolver
            ).getChannel("default-channel");

            const DefaultMention: boolean = (
              interaction.options as CommandInteractionOptionResolver
            ).getBoolean("default-mention");

            const DefaultRole = (
              interaction.options as CommandInteractionOptionResolver
            ).getRole("default-role");

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

            if (!ServerData.Enabled && SendFreebies !== true)
              return interaction.reply({
                embeds: [FreebiesDisabled],
                ephemeral: true
              });

            const GoodbyeMessage = new EmbedBuilder()
              .setTitle(`${emojis.Crying} We're sad to see you go so soon.`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `We'd like to hear your thoughts on GBF Freebies ${hyperlink(
                  "here",
                  "https://forms.gle/5n2puvQHyhJrJ8VU7"
                )}, if you'd like to re-enable GBF Freebies, you can do so using: ${
                  CommandLinks.FreebieUpdate
                }`
              );

            if (SendFreebies === false) {
              await ServerData.updateOne({
                Enabled: false
              });
              return interaction.reply({
                embeds: [GoodbyeMessage]
              });
            }

            const NoChoiceMade = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(`You need to choose at least one option.`);

            if (
              UseDefault === null &&
              !DefaultChannel &&
              DefaultMention === null &&
              !DefaultRole
            )
              return interaction.reply({
                embeds: [NoChoiceMade],
                ephemeral: true
              });

            const ChangesMade: string = `• System Active: ${capitalize(
              SendFreebies.toString()
            )}\n• Use Default Settings: ${
              UseDefault === null ? "No Changes Made" : UseDefault
            }\n• Default Channel: ${
              DefaultChannel ? DefaultChannel : "No Changes Made"
            }\n• Default Mention: ${
              DefaultMention === null
                ? "No Changes Made"
                : capitalize(DefaultMention.toString())
            }\n• Default Role: ${
              DefaultRole ? DefaultRole : "No Changes Made"
            }`;

            const SettingsSaved = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Settings Saved`)
              .setColor(ServerData.EmbedColor as ColorResolvable)
              .setDescription(`${ChangesMade}`);

            await ServerData.updateOne({
              Enabled: SendFreebies,
              UseDefault:
                UseDefault === null ? ServerData.UseDefault : UseDefault,
              DefaultChannel: DefaultChannel
                ? DefaultChannel.id
                : ServerData.DefaultChannel,
              DefaultMention:
                DefaultMention === null
                  ? ServerData.DefaultMention
                  : DefaultMention,
              DefaultRole: DefaultRole ? DefaultRole.id : ServerData.DefaultRole
            });

            return interaction.reply({
              embeds: [SettingsSaved]
            });
          }
        },
        settings: {
          description: "View this server's GBF Freebies settings",
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

            const DefaultChannelLink = interaction.guild.channels.cache.get(
              ServerData.DefaultChannel
            );
            const DefaultRoleMention = interaction.guild.roles.cache.get(
              ServerData.DefaultRole
            );

            const EpicGamesChannel = interaction.guild.channels.cache.get(
              ServerData.EGSChannel
            );
            const EpicGamesRole = interaction.guild.roles.cache.get(
              ServerData.EGSRole
            );

            const SteamChannel = interaction.guild.channels.cache.get(
              ServerData.SteamChannel
            );
            const SteamRole = interaction.guild.roles.cache.get(
              ServerData.SteamRole
            );

            const OtherChannel = interaction.guild.channels.cache.get(
              ServerData.OtherChannel
            );
            const OtherRole = interaction.guild.roles.cache.get(
              ServerData.OtherRole
            );

            const ServerSettings: string = `• System Enabled: ${capitalize(
              ServerData.Enabled.toString()
            )}\n• Freebie ID: ${ServerData.FreebieId}\n• Embed Color: ${
              ServerData.EmbedColor
            }\n\n**Default Settings:**\n• Use Default Settings: ${capitalize(
              ServerData.UseDefault.toString()
            )}\n• Channel: ${
              DefaultChannelLink ? DefaultChannelLink : "Deleted Channel"
            }\n• Mention: ${capitalize(
              ServerData.DefaultMention.toString()
            )}\n• Role: ${
              DefaultRoleMention ? DefaultRoleMention : "Role Not Found"
            }\n\n**Category Settings:**\n**${
              emojis.EPIC
            } Epic Games**\n• Enabled: ${
              ServerData.EGSEnabled === true || ServerData.AllEnabled
                ? "True"
                : "False"
            }\n• Channel: ${
              EpicGamesChannel ? EpicGamesChannel : "Default Channel"
            }\n• Role: ${
              EpicGamesRole ? EpicGamesRole : "Default Role"
            }\n• Mention: ${capitalize(
              ServerData.EGSMention.toString()
            )}\n\n**${emojis.STEAMLOGO} Steam**\n• Enabled: ${
              ServerData.SteamEnabled === true || ServerData.AllEnabled
                ? "True"
                : "False"
            }\n• Channel: ${
              SteamChannel ? SteamChannel : "Default Channel"
            }\n• Role: ${
              SteamRole ? SteamRole : "Default Role"
            }\n• Mention: ${capitalize(
              ServerData.SteamMention.toString()
            )}\n\n**${emojis.UBISOFTLOGO} ${emojis.GOGLOGO} ${
              emojis.ORIGINLOGO
            } Other**\n• Enabled: ${
              ServerData.OtherEnabled === true || ServerData.AllEnabled
                ? "True"
                : "False"
            }\n• Channel: ${
              OtherChannel ? OtherChannel : "Default Channel"
            }\n• Role: ${
              OtherRole ? OtherRole : "Default Role"
            }\n• Mention: ${capitalize(ServerData.OtherMention.toString())}`;

            const ServerSettingsEmbed = new EmbedBuilder()
              .setTitle(`${interaction.guild.name} GBF Freebies Settings`)
              .setColor(ServerData.EmbedColor as ColorResolvable)
              .setDescription(`${ServerSettings}`)
              .setFooter({
                text: `Need help? Run /freebie help`
              });

            return interaction.reply({
              embeds: [ServerSettingsEmbed]
            });
          }
        },
        cosmetic: {
          description: "Update your GBF Freebies message looks",
          args: [
            {
              name: "embed-color",
              description: "Change the color of the embed that gets sent",
              type: ApplicationCommandOptionType.String
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

            const EmbedColor = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("embed-color");

            const NoChoiceMade = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(`Choose at least one option`);

            if (!EmbedColor)
              return interaction.reply({
                embeds: [NoChoiceMade],
                ephemeral: true
              });

            const colorCodeRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

            const invalidColor = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `The color specified (${EmbedColor}) does not match the correct format (#RRGGBB), you can get HTML color codes from ${hyperlink(
                  "here",
                  "https://htmlcolorcodes.com/"
                )}`
              );

            if (!colorCodeRegex.test(EmbedColor)) {
              return interaction.reply({
                embeds: [invalidColor],
                ephemeral: true
              });
            }
          }
        },
        send: {
          description: "[Developer] Send the Freebies",
          execute: async ({ client, interaction }) => {
            if (!FreebieIDs.AdminIDs.includes(interaction.user.id))
              return interaction.reply({
                content: `You cannot use this command`,
                ephemeral: true
              });

            if (!FreebieIDs.AdminChannels.includes(interaction.channel.id))
              return interaction.reply({
                content: `This command is disabled in this channel`,
                ephemeral: true
              });

            await interaction.reply({
              embeds: [ControlPanel],
              components: [ControlPanelFirstRow, ControlPanelSecondRow]
            });

            const filter = (i: ButtonInteraction) => {
              return i.user.id === interaction.user.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                idle: 30000,
                componentType: ComponentType.Button
              });
            /**
             * Launcher: Launcher Name
             * Number Of Freebies: Number
             */

            let FreebieOptions = new Map();

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              if (i.customId === "empty")
                await interaction.followUp({
                  content: `Why would you click an empty button, what did you expect would happen?`,
                  ephemeral: true
                });

              if (i.customId === FreebieCodes.Exit) {
                await interaction.editReply({
                  content: `Menu Forcefully Closed`
                });
                collector.stop();
              }

              if (i.customId === FreebieCodes["Go Back"]) {
                await interaction.editReply({
                  embeds: [ControlPanel],
                  components: [ControlPanelFirstRow, ControlPanelSecondRow]
                });
              }

              if (i.customId === FreebieCodes["Epic Games"]) {
                await interaction.editReply({
                  embeds: [PanelEpicGamesEmbed],
                  components: [PanelEpicGamesRow]
                });
                FreebieOptions.set("Launcher", "Epic Games");
              }

              if (i.customId === FreebieCodes.Steam) {
                await interaction.editReply({
                  embeds: [PanelSteamEmbed],
                  components: [PanelSteamRow]
                });
                FreebieOptions.set("Launcher", "Steam");
              }

              if (i.customId === FreebieCodes.GOG) {
                await interaction.editReply({
                  embeds: [PanelGOGEmbed],
                  components: [PanelGOGRow]
                });
                FreebieOptions.set("Launcher", "GOG");
              }

              if (i.customId === FreebieCodes["Prime Gaming"]) {
                await interaction.followUp({
                  content: `This launcher is incomplete`
                });
                // await interaction.editReply({
                //   embeds: [PanelPrimeEmbed],
                //   components: [PanelPrimeRow]
                // });
                // FreebieOptions.set("Launcher", "Prime Gaming");
              }

              if (i.customId === FreebieCodes.Ubisoft) {
                await interaction.editReply({
                  embeds: [PanelUbisoftEmbed],
                  components: [PanelUbisoftRow]
                });
                FreebieOptions.set("Launcher", "Ubisoft");
              }

              if (i.customId === FreebieCodes.EA) {
                await interaction.editReply({
                  embeds: [PanelOriginEmbed],
                  components: [PanelOriginRow]
                });
                FreebieOptions.set("Launcher", "EA");
              }

              if (i.customId === LauncherGamesNumbers["Epic Games One"]) {
                await interaction.editReply({
                  embeds: [EpicGamesOneGameInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 1);
              }

              if (i.customId === LauncherGamesNumbers["Epic Games Two"]) {
                await interaction.editReply({
                  embeds: [EpicGamesTwoGamesInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 2);
              }

              if (i.customId === LauncherGamesNumbers["Epic Games Three"]) {
                await interaction.editReply({
                  embeds: [EpicGamesThreeGamesInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 3);
              }

              if (i.customId === LauncherGamesNumbers["Steam One"]) {
                await interaction.editReply({
                  embeds: [SteamOneGameInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 1);
              }

              if (i.customId === LauncherGamesNumbers["Steam Two"]) {
                await interaction.editReply({
                  embeds: [SteamTwoGamesInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 2);
              }

              if (i.customId === LauncherGamesNumbers["Steam Three"]) {
                await interaction.editReply({
                  embeds: [SteamThreeGamesInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 3);
              }

              if (i.customId === LauncherGamesNumbers["GOG One"]) {
                await interaction.editReply({
                  embeds: [GOGOneGameInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 1);
              }

              if (i.customId === LauncherGamesNumbers["GOG Two"]) {
                await interaction.editReply({
                  embeds: [GOGsTwoGamesInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 2);
              }

              if (i.customId === LauncherGamesNumbers["GOG Three"]) {
                await interaction.editReply({
                  embeds: [GOGThreeGamesInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 3);
              }

              if (i.customId === LauncherGamesNumbers["Origin One"]) {
                await interaction.editReply({
                  embeds: [OriginOneGameInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 1);
              }

              if (i.customId === LauncherGamesNumbers["Origin Two"]) {
                await interaction.editReply({
                  embeds: [OriginTwoGamesInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 2);
              }

              if (i.customId === LauncherGamesNumbers["Origin Three"]) {
                await interaction.editReply({
                  embeds: [OriginThreeGamesInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 3);
              }

              //

              if (i.customId === LauncherGamesNumbers["Ubisoft One"]) {
                await interaction.editReply({
                  embeds: [UbisoftOneGameInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 1);
              }

              if (i.customId === LauncherGamesNumbers["Ubisoft Two"]) {
                await interaction.editReply({
                  embeds: [UbisoftTwoGamesInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 2);
              }

              if (i.customId === LauncherGamesNumbers["Ubisoft Three"]) {
                await interaction.editReply({
                  embeds: [UbisoftThreeGamesInfoEmbed],
                  components: [ConfirmButtons]
                });
                FreebieOptions.set("Games", 3);
              }

              if (i.customId === "ConfirmFreebieSend") {
                await interaction.editReply({
                  content: `Sent Freebies with the following settings 👇🏽`,
                  components: []
                });

                client.emit(
                  "FreebieSend",
                  FreebieOptions.get("Launcher"),
                  FreebieOptions.get("Games")
                );
                collector.stop();
              }

              if (i.customId === "DenyFreebieSend") {
                await interaction.editReply({
                  content: `Stopped the Freebie Send Control Panel, no Freebie will be sent.`,
                  components: []
                });
                collector.stop();
              }
            });

            collector.on("end", async (collected, reason) => {
              await interaction.editReply({
                components: [
                  ControlPanelFirstRowDisabled,
                  ControlPanelSecondRowDisabled
                ]
              });
            });
          }
        },
        announce: {
          description: "[Developer] Announce a GBF Freebies message",
          args: [
            {
              name: "message",
              description: "The message that you want to send",
              type: ApplicationCommandOptionType.String,
              required: true,
              maxLength: 1024
            },
            {
              name: "mention",
              description:
                "Mention the free games role in the server [Default]",
              type: ApplicationCommandOptionType.Boolean,
              required: false
            }
          ],
          execute: async ({ client, interaction }: IExecute) => {
            if (!FreebieIDs.AdminIDs.includes(interaction.user.id))
              return interaction.reply({
                content: `You cannot use this command`,
                ephemeral: true
              });

            if (!FreebieIDs.AdminChannels.includes(interaction.channel.id))
              return interaction.reply({
                content: `This command is disabled in this channel`,
                ephemeral: true
              });

            const announcementText = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("message");
            const mentionBoolean =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getBoolean("mention") || false;

            const ConfirmMessage = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Please verify the information below`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `**Message:** ${announcementText}\n**Mention:** ${
                  mentionBoolean ? "Yes" : "No"
                }`
              )
              .setTimestamp();

            const ConfirmRow: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setCustomId(`confirmAnnouncement`)
                  .setEmoji(emojis.VERIFY)
                  .setLabel(`Confirm`)
                  .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                  .setCustomId(`denyAnnouncement`)
                  .setLabel(`Deny`)
                  .setEmoji(emojis.ERROR)
                  .setStyle(ButtonStyle.Danger)
              ]);

            await interaction.reply({
              embeds: [ConfirmMessage],
              components: [ConfirmRow]
            });

            const filter = (i: Interaction) => {
              return i.user.id === interaction.user.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                componentType: ComponentType.Button
              });

            collector.on("collect", async (i) => {
              if (i.customId === "confirmAnnouncement") {
                ConfirmMessage.setTitle(`${emojis.VERIFY} Announcement Sent`);
                collector.stop();
                await interaction.editReply({
                  embeds: [ConfirmMessage],
                  components: []
                });
                client.emit(
                  "freebieAnnouncement",
                  announcementText,
                  mentionBoolean,
                  interaction.user
                );
              } else if (i.customId === "denyAnnouncement") {
                ConfirmMessage.setTitle(`${emojis.ERROR} Announcement Denied`);
                collector.stop();
                interaction.editReply({
                  embeds: [ConfirmMessage],
                  components: []
                });
              }
            });
          }
        }
      }
    });
  }
}
