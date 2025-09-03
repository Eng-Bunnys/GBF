import SlashCommand from "../../utils/slashCommands";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
  ColorResolvable,
  CommandInteractionOptionResolver,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
  ComponentType,
  User,
} from "discord.js";

import { MessageSplit, delay } from "../../utils/Engine";
import GBFClient from "../../handler/clienthandler";
import { UserWarnModel } from "../../schemas/Moderation Schemas/Warn Schema";

export default class WarnCommands extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "warn",
      description: "Warn commands",
      category: "Moderation",
      userPermission: [PermissionFlagsBits.Administrator],
      subcommands: {
        add: {
          description: "Warn a user",
          args: [
            {
              name: "user",
              description: "The user that you want to warn",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
            {
              name: "reason",
              description: "The reason behind the warning",
              type: ApplicationCommandOptionType.String,
            },
          ],
          execute: async ({ client, interaction }) => {
            const targetUser: User = interaction.options.getUser("user");
            const warnReason: string =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getString("reason") || "No reason provided";

            //ID format : # + 6 digits 1-5,000 + random integer
            const warnId: string =
              `#` +
              Math.random().toString(36).substring(2, 8) +
              `${Math.round(Math.random() * 5000)}`;

            if (targetUser.id === interaction.user.id)
              return interaction.reply({
                content: `You can't warn yourself.`,
                ephemeral: true,
              });

            if (targetUser.bot)
              return interaction.reply({
                content: `You can't warn a bot.`,
                ephemeral: true,
              });

            const WarnDocs = await UserWarnModel.findOne({
              userId: targetUser.id,
              guildId: interaction.guild.id,
            });

            if (!WarnDocs) {
              const NewWarnDoc = new UserWarnModel({
                guildId: interaction.guild.id,
                userId: targetUser.id,
                warns: 1,
                warnID: [warnId],
                warnReason: [warnReason],
              });
              await NewWarnDoc.save().catch((e) => {
                console.error("Error:", e);
              });

              const UserWarned = new EmbedBuilder()
                .setTitle(`${emojis.VERIFY} User warned`)
                .setColor(colors.DEFAULT as ColorResolvable)
                .addFields(
                  {
                    name: "Target:",
                    value: `${targetUser} (${targetUser.id})`,
                    inline: true,
                  },
                  {
                    name: "Moderator:",
                    value: `${interaction.user} (${interaction.user.id})`,
                    inline: true,
                  },
                  {
                    name: "Reason:",
                    value: `${warnReason}`,
                    inline: true,
                  },
                  {
                    name: "User Warns:",
                    value: `1`,
                    inline: true,
                  },
                  {
                    name: "Warn ID:",
                    value: `${warnId}`,
                    inline: true,
                  },
                  {
                    name: "\u200b",
                    value: `\u200b`,
                    inline: true,
                  }
                );

              return interaction.reply({
                embeds: [UserWarned],
              });
            } else {
              await WarnDocs.updateOne({
                warns: WarnDocs.warns + 1,
              });
              WarnDocs.warnID.push(warnId);
              WarnDocs.warnReason.push(warnReason);
              await WarnDocs.save().catch((e) => {
                console.error("Error:", e);
              });
              const UserWarned = new EmbedBuilder()
                .setTitle(`${emojis.VERIFY} User warned`)
                .setColor(colors.DEFAULT as ColorResolvable)
                .addFields(
                  {
                    name: "Target:",
                    value: `${targetUser} (${targetUser.id})`,
                    inline: true,
                  },
                  {
                    name: "Moderator:",
                    value: `${interaction.user} (${interaction.user.id})`,
                    inline: true,
                  },
                  {
                    name: "Reason:",
                    value: `${warnReason}`,
                    inline: true,
                  },
                  {
                    name: "User Warns:",
                    value: `${(WarnDocs.warns + 1).toLocaleString()}`,
                    inline: true,
                  },
                  {
                    name: "Warn ID:",
                    value: `${warnId}`,
                    inline: true,
                  },
                  {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true,
                  }
                );

              return interaction.reply({
                embeds: [UserWarned],
              });
            }
          },
        },
        remove: {
          description: "Remove a warning from a user",
          args: [
            {
              name: "id",
              description:
                "The ID of the warning that you want to remove || Type all to remove all warnings",
              type: ApplicationCommandOptionType.String,
            },
            {
              name: "user-id",
              description:
                "Required if you want to remove all warnings from a user, skip if you want to remove just one warning",
              type: ApplicationCommandOptionType.User,
            },
          ],
          execute: async ({ client, interaction }) => {
            const WarnDocs = await UserWarnModel.findOne({
              guildId: interaction.guild.id,
            });

            const NoData = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} No Data Found`)
              .setDescription(`I couldn't find that ID/User in my database.`)
              .setColor(colors.ERRORRED as ColorResolvable);

            if (!WarnDocs)
              return interaction.reply({
                embeds: [NoData],
                ephemeral: true,
              });

            if (
              WarnDocs.warnID.length === 0 ||
              WarnDocs.warnReason.length === 0 ||
              WarnDocs.warns === 0
            )
              return interaction.reply({
                embeds: [NoData],
                ephemeral: true,
              });

            const TargetUser: User = interaction.options.getUser("user-id");

            if (
              (interaction.options as CommandInteractionOptionResolver)
                .getString("id")
                .toLowerCase() === "all"
            ) {
              if (TargetUser) {
                const TargetUserData = await UserWarnModel.findOne({
                  userId: interaction.options.getUser("user-id").id,
                  guildId: interaction.guild.id,
                });

                if (!TargetUserData)
                  return interaction.reply({
                    embeds: [NoData],
                    ephemeral: true,
                  });

                const RemovedAllWarns = new EmbedBuilder()
                  .setTitle(`${emojis.VERIFY} All Warnings Removed`)
                  .setColor(colors.DEFAULT as ColorResolvable)
                  .addFields(
                    {
                      name: "User:",
                      value: `${TargetUser.username} (${TargetUser.id})`,
                    },
                    {
                      name: "Moderator:",
                      value: `${interaction.user.username} (${interaction.user.id})`,
                    },
                    {
                      name: "Warns Removed:",
                      value: `${TargetUserData.warns.toLocaleString()}`,
                    }
                  )
                  .setTimestamp();

                await TargetUserData.deleteOne();

                return interaction.reply({
                  embeds: [RemovedAllWarns],
                });
              } else
                return interaction.reply({
                  content: `You are required to specify a user if you want to remove all warning.`,
                  ephemeral: true,
                });
            } else if (!TargetUser) {
              let ProvidedID: string = (
                interaction.options as CommandInteractionOptionResolver
              ).getString("id");

              if (!ProvidedID.includes("#")) ProvidedID = `#` + ProvidedID;

              if (!WarnDocs.warnID.includes(ProvidedID)) {
                const IDNotFound = new EmbedBuilder()
                  .setTitle(`${emojis.ERROR} You can't do that`)
                  .setDescription(
                    `That ID doesn't exist, check the IDs by using /warn total`
                  )
                  .setColor(colors.ERRORRED as ColorResolvable);

                return interaction.reply({
                  embeds: [IDNotFound],
                  ephemeral: true,
                });
              }

              const TargetDetials = await UserWarnModel.findOne({
                warnID: ProvidedID,
              });

              const notInGuild = new EmbedBuilder()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(
                  `That user is no longer in ${interaction.guild.name}\nUser ID: ${TargetDetials.userId}`
                )
                .setColor(colors.ERRORRED as ColorResolvable);

              const TargetMember = interaction.guild.members.cache.get(
                TargetDetials.userId
              );

              if (!TargetMember)
                return interaction.reply({
                  embeds: [notInGuild],
                  ephemeral: true,
                });

              const warnReasonDisplay =
                TargetDetials.warnReason[
                  TargetDetials.warnID.indexOf(ProvidedID)
                ];

              let index = WarnDocs.warnID.indexOf(ProvidedID);
              WarnDocs.warnID.splice(index, 1);
              WarnDocs.warnReason.splice(index, 1);
              WarnDocs.warns--;
              await WarnDocs.save().catch((e) => {
                console.error("Error:", e);
              });

              const UserWarned = new EmbedBuilder()
                .setTitle(`${emojis.VERIFY} Warning removed`)
                .setColor(colors.DEFAULT as ColorResolvable)
                .setDescription(
                  `Removed a warning from ${TargetMember.user.tag} : ${
                    TargetMember.user.username
                  } now has ${WarnDocs.warns.toLocaleString()} warnings`
                )
                .addFields(
                  {
                    name: "User:",
                    value: `${TargetMember}`,
                    inline: true,
                  },
                  {
                    name: "Moderator:",
                    value: `${interaction.user}`,
                    inline: true,
                  },
                  {
                    name: "Warn ID:",
                    value: `${ProvidedID}`,
                    inline: true,
                  },
                  {
                    name: "User Warns:",
                    value: `${WarnDocs.warns.toLocaleString()}`,
                    inline: true,
                  },
                  {
                    name: "Reason For Warn:",
                    value: `${warnReasonDisplay}`,
                    inline: true,
                  },
                  {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true,
                  }
                );

              return interaction.reply({
                embeds: [UserWarned],
              });
            }
          },
        },
        total: {
          description:
            "Get all of the warnings in this server or for a specific user",
          args: [
            {
              name: "user",
              description: "The user that you want to get the warnings for",
              type: ApplicationCommandOptionType.User,
              required: true,
            },
          ],
          execute: async ({ client, interaction }) => {
            const user = interaction.options.getUser("user");

            const UserWarnDocs = await UserWarnModel.findOne({
              userId: user.id,
              guildId: interaction.guild.id,
            });

            const NoData = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} No Data Found`)
              .setDescription(
                `I couldn't find any warn data on ${user.tag} in ${interaction.guild.name}`
              )
              .setColor(colors.ERRORRED as ColorResolvable)
              .setFooter({
                text: `${interaction.guild.name} moderation powered by GBF™`,
                iconURL: interaction.user.displayAvatarURL(),
              });

            if (!UserWarnDocs)
              return interaction.reply({
                embeds: [NoData],
                ephemeral: true,
              });

            if (
              UserWarnDocs.warnID.length === 0 ||
              UserWarnDocs.warnReason.length === 0 ||
              UserWarnDocs.warns === 0
            )
              return interaction.reply({
                embeds: [NoData],
                ephemeral: true,
              });

            let userDataArray: string[] = [];
            for (let i = 0; i < UserWarnDocs.warnID.length; i++) {
              userDataArray.push(
                `**${i + 1}:** ${UserWarnDocs.warnID[i]} - ${
                  UserWarnDocs.warnReason[i]
                }`
              );
            }
            userDataArray = MessageSplit(userDataArray, 450);

            const embeds = [];
            const pages = {};

            for (let a = 0; a < userDataArray.length; a++) {
              let pageNumber = a + 1;
              embeds.push(
                new EmbedBuilder()
                  .setDescription(`${userDataArray[pageNumber - 1]}`)
                  .setColor(colors.DEFAULT as ColorResolvable)
                  .setTitle(`${user.username}'s warning data`)
                  .setFooter({
                    text: `${
                      interaction.guild.name
                    } moderation powered by GBF™ || Page ${a + 1} / ${
                      userDataArray.length
                    }`,
                    iconURL: interaction.user.displayAvatarURL(),
                  })
              );
            }

            const getRow = (id) => {
              const MainButtonsRow: ActionRowBuilder<any> =
                new ActionRowBuilder();
              MainButtonsRow.addComponents(
                new ButtonBuilder()
                  .setCustomId("firstPage")
                  .setStyle(ButtonStyle.Secondary)
                  .setEmoji("⏮")
                  .setDisabled(pages[id] === 0)
              );
              MainButtonsRow.addComponents(
                new ButtonBuilder()
                  .setCustomId("prevEmbed")
                  .setStyle(ButtonStyle.Secondary)
                  .setEmoji("◀")
                  .setDisabled(pages[id] === 0)
              );
              MainButtonsRow.addComponents(
                new ButtonBuilder()
                  .setCustomId("nextEmbed")
                  .setStyle(ButtonStyle.Secondary)
                  .setEmoji("▶")
                  .setDisabled(pages[id] === embeds.length - 1)
              );
              MainButtonsRow.addComponents(
                new ButtonBuilder()
                  .setCustomId("finalPage")
                  .setStyle(ButtonStyle.Secondary)
                  .setEmoji("⏭")
                  .setDisabled(pages[id] === embeds.length - 1)
              );
              MainButtonsRow.addComponents(
                new ButtonBuilder()
                  .setCustomId("end")
                  .setStyle(ButtonStyle.Danger)
                  .setLabel("Close")
                  .setEmoji(emojis.ERROR)
                  .setDisabled(false)
              );
              return MainButtonsRow;
            };

            let id = interaction.user.id;

            pages[id] = pages[id] || 0;

            const embed = embeds[pages[id]];

            await interaction.reply({
              embeds: [embed],
              components: [getRow(id)],
            });

            const filter = (i: Interaction) => {
              return i.user.id === interaction.user.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                componentType: ComponentType.Button,
                idle: 15000,
              });

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              if (i.customId === "prevEmbed") {
                pages[id]--;
                if (pages[id] < 0) pages[id] = 0;
                await interaction.editReply({
                  embeds: [embeds[pages[id]]],
                  components: [getRow(id)],
                });
              } else if (i.customId === "nextEmbed") {
                pages[id]++;
                if (pages[id] > embeds.length - 1)
                  pages[id] = embeds.length - 1;
                await interaction.editReply({
                  embeds: [embeds[pages[id]]],
                  components: [getRow(id)],
                });
              } else if (i.customId === "end") {
                collector.stop();
              } else if (i.customId === "firstPage") {
                pages[id] = 0;
                await interaction.editReply({
                  embeds: [embeds[pages[id]]],
                  components: [getRow(id)],
                });
              } else if (i.customId === "finalPage") {
                pages[id] = embeds.length - 1;
                await interaction.editReply({
                  embeds: [embeds[pages[id]]],
                  components: [getRow(id)],
                });
              }
            });

            collector.on("end", async (i) => {
              const MainButtonsRowDisabled: ActionRowBuilder<any> =
                new ActionRowBuilder();
              MainButtonsRowDisabled.addComponents(
                new ButtonBuilder()
                  .setCustomId("prev_embedD")
                  .setStyle(ButtonStyle.Secondary)
                  .setEmoji("⏮")
                  .setDisabled(true)
              );
              MainButtonsRowDisabled.addComponents(
                new ButtonBuilder()
                  .setCustomId("next_embedD")
                  .setStyle(ButtonStyle.Secondary)
                  .setEmoji("⏭")
                  .setDisabled(true)
              );

              await interaction.editReply({
                components: [MainButtonsRowDisabled],
              });
            });
          },
        },
      },
    });
  }
}
