const SlashCommand = require("../../utils/slashCommands");

const colors = require("../../GBF/GBFColor.json");
const emojis = require("../../GBF/GBFEmojis.json");

const WarnSchema = require("../../schemas/Moderation Schemas/Warn Schema");

const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { MessageSplit, delay } = require("../../utils/Engine");

module.exports = class WarnCommands extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "warn",
      description: "Warn commands",
      category: "Moderation",
      userPermission: [PermissionFlagsBits.ModerateMembers],
      botPermission: [],
      cooldown: 0,
      development: true,
      subcommands: {
        add: {
          description: "Give a user a warning",
          args: [
            {
              name: "user",
              description: "The user that you want to warn",
              type: ApplicationCommandOptionType.User,
              required: true
            },
            {
              name: "reason",
              description: "The reason behind the warning",
              type: ApplicationCommandOptionType.String
            }
          ],
          execute: async ({ client, interaction }) => {
            const targetMember = interaction.options.getMember("user");
            const warnReason =
              interaction.options.getString("reason") || "No Reason Specified";
            await client.emit("userWarn", targetMember, interaction.user);
            //ID format : # + 6 digits 1-5,000 + random integer
            const warnId =
              `#` +
              Math.random().toString(36).substring(2, 8) +
              `${Math.round(Math.random() * 5000)}`;

            const notInGuild = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED)
              .setDescription(
                `The specified user is not in ${interaction.guild.name}`
              );

            if (!targetMember)
              return interaction.reply({
                embeds: [notInGuild],
                ephemeral: true
              });

            if (targetMember.id === interaction.user.id)
              return interaction.reply({
                content: `You can't warn yourself! ⚠`,
                ephemeral: true
              });
            if (targetMember.bot)
              return interaction.reply({
                content: `You can't warn a bot! ⚠`,
                ephemeral: true
              });

            const warnDocs = await WarnSchema.findOne({
              userId: targetMember.id,
              guildId: interaction.guild.id
            });

            if (!warnDocs) {
              const newWarnDoc = new WarnSchema({
                guildId: interaction.guild.id,
                userId: targetMember.id,
                warns: 1,
                warnID: [warnId],
                warnReason: [warnReason]
              });

              await newWarnDoc.save().catch((e) => {
                console.error("Error:", e);
              });

              const systemSuccess = new EmbedBuilder()
                .setTitle(`${emojis.VERIFY} User warned`)
                .setColor(colors.DEFAULT)
                .addFields(
                  {
                    name: "Target:",
                    value: `${targetMember}`,
                    inline: true
                  },
                  {
                    name: "Moderator:",
                    value: `${interaction.user}`,
                    inline: true
                  },
                  {
                    name: "Reason:",
                    value: `${warnReason}`,
                    inline: true
                  },
                  {
                    name: "User Warns:",
                    value: `1`,
                    inline: true
                  },
                  {
                    name: "Warn ID:",
                    value: `${warnId}`,
                    inline: true
                  },
                  {
                    name: "\u200b",
                    value: `\u200b`,
                    inline: true
                  }
                )
                .setFooter({
                  text: `${interaction.guild.name} moderation powered by GBF™`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [systemSuccess]
              });
            } else {
              warnDocs.warns += 1;
              warnDocs.warnID.push(warnId);
              warnDocs.warnReason.push(warnReason);
              await warnDocs.save().catch((e) => {
                console.error("Error:", e);
              });

              const userAccountEmbed = new EmbedBuilder()
                .setTitle(`${emojis.VERIFY} User warned`)
                .setColor(colors.DEFAULT)
                .addFields(
                  {
                    name: "Target:",
                    value: `${targetMember}`,
                    inline: true
                  },
                  {
                    name: "Moderator:",
                    value: `${interaction.user}`,
                    inline: true
                  },
                  {
                    name: "Reason:",
                    value: `${warnReason}`,
                    inline: true
                  },
                  {
                    name: "User Warns:",
                    value: `${(warnDocs.warns + 1).toLocaleString()}`,
                    inline: true
                  },
                  {
                    name: "Warn ID:",
                    value: `${warnId}`,
                    inline: true
                  },
                  {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true
                  }
                )
                .setFooter({
                  text: `${interaction.guild.name} moderation powered by GBF™`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [userAccountEmbed]
              });
            }
          }
        },
        remove: {
          description: "Remove a warning from a user",
          args: [
            {
              name: "id",
              description:
                "The ID of the warning that you want to remove || Type all to remove all warnings",
              type: ApplicationCommandOptionType.String,
              required: true
            },
            {
              name: "user-id",
              description:
                "Required if you want to remove all warnings from a user, skip if you want to remove just one warning",
              type: ApplicationCommandOptionType.User
            }
          ],
          execute: async ({ client, interaction }) => {
            const warnDocs = await WarnSchema.findOne({
              guildId: interaction.guild.id
            });

            const NoData = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} No Data Found`)
              .setDescription(`I couldn't find that ID/User in my database.`)
              .setColor(colors.ERRORRED)
              .setFooter({
                text: `${interaction.guild.name} moderation powered by GBF™`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (!warnDocs)
              return interaction.reply({
                embeds: [NoData],
                ephemeral: true
              });

            if (
              warnDocs.warnID.length === 0 ||
              warnDocs.warnReason.length === 0 ||
              warnDocs.warns === 0
            )
              return interaction.reply({
                embeds: [NoData],
                ephemeral: true
              });

            if (interaction.options.getString("id").toLowerCase() === "all") {
              if (interaction.options.getUser("user-id")) {
                const targetMemberData = await WarnSchema.findOne({
                  userId: interaction.options.getUser("user-id").id,
                  guildId: interaction.guild.id
                });

                if (!targetMemberData)
                  return interaction.reply({
                    embeds: [NoData],
                    ephemeral: true
                  });

                const deletedAllWarns = new EmbedBuilder()
                  .setTitle(`${emojis.VERIFY} All Warnings Removed`)
                  .setColor(colors.DEFAULT)
                  .addFields(
                    {
                      name: "User:",
                      value: `${interaction.options.getUser("user-id").tag}`
                    },
                    {
                      name: "Moderator:",
                      value: `${interaction.user.tag}`
                    },
                    {
                      name: "Warns Removed:",
                      value: `${targetMemberData.warns}`
                    }
                  )
                  .setFooter({
                    text: `${interaction.guild.name} moderation powered by GBF™`,
                    iconURL: interaction.user.displayAvatarURL()
                  })
                  .setTimestamp();

                await targetMemberData.deleteOne();

                return interaction.reply({
                  embeds: [deletedAllWarns]
                });
              } else
                return interaction.reply({
                  content: `You are required to specify a user if you want to remove all warning.`,
                  ephemeral: true
                });
            } else {
              let providedId;
              if (interaction.options.getString("id").includes("#"))
                providedId = interaction.options.getString("id");
              else providedId = `#` + interaction.options.getString("id");

              if (!warnDocs.warnID.includes(providedId)) {
                const IDNotFound = new EmbedBuilder()
                  .setTitle(`${emojis.ERROR} You can't do that`)
                  .setDescription(
                    `That ID doesn't exist, check the IDs by using /warn total`
                  )
                  .setColor(colors.ERRORRED)
                  .setFooter({
                    text: `${interaction.guild.name} moderation powered by GBF™`,
                    iconURL: interaction.user.displayAvatarURL()
                  });
                return interaction.reply({
                  embeds: [IDNotFound],
                  ephemeral: true
                });
              }

              const targetDetails = await WarnSchema.findOne({
                warnID: providedId
              });

              const notInGuild = new EmbedBuilder()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(
                  `That user is no longer in ${interaction.guild.name}\nUser ID: ${targetDetails.userId}`
                )
                .setColor(colors.ERRORRED)
                .setFooter({
                  text: `${interaction.guild.name} moderation powered by GBF™`,
                  iconURL: interaction.user.displayAvatarURL()
                });
              const targetMember = await interaction.guild.members.cache.get(
                targetDetails.userId
              );

              if (!targetMember)
                return interaction.reply({
                  embeds: [notInGuild],
                  ephemeral: true
                });

              const warnReasonDisplay =
                targetDetails.warnReason[
                  targetDetails.warnID.indexOf(providedId)
                ];

              let index = warnDocs.warnID.indexOf(providedId);
              warnDocs.warnID.splice(index, 1);
              warnDocs.warnReason.splice(index, 1);
              warnDocs.warns--;
              await warnDocs.save().catch((e) => {
                console.error("Error:", e);
              });

              const systemSuccess = new EmbedBuilder()
                .setTitle(`${emojis.VERIFY} Warning removed`)
                .setColor(colors.DEFAULT)
                .setDescription(
                  `Removed a warning from ${targetMember.user.tag} : ${
                    targetMember.user.username
                  } now has ${warnDocs.warns.toLocaleString()} warnings`
                )
                .addFields(
                  {
                    name: "User:",
                    value: `${targetMember}`,
                    inline: true
                  },
                  {
                    name: "Moderator:",
                    value: `${interaction.user}`,
                    inline: true
                  },
                  {
                    name: "Warn ID:",
                    value: `${providedId}`,
                    inline: true
                  },
                  {
                    name: "User Warns:",
                    value: `${warnDocs.warns.toLocaleString()}`,
                    inline: true
                  },
                  {
                    name: "Reason For Warn:",
                    value: `${warnReasonDisplay}`,
                    inline: true
                  },
                  {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true
                  }
                )
                .setFooter({
                  text: `${interaction.guild.name} moderation powered by GBF™`,
                  iconURL: interaction.user.displayAvatarURL()
                });
              return interaction.reply({
                embeds: [systemSuccess]
              });
            }
          }
        },
        total: {
          description:
            "Get all of the warnings in this server or for a specific user",
          args: [
            {
              name: "user",
              description: "The user that you want to get the warnings for",
              type: ApplicationCommandOptionType.User,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const user = interaction.options.getUser("user");

            const userWarnDocs = await WarnSchema.findOne({
              userId: user.id,
              guildId: interaction.guild.id
            });

            const NoData = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} No Data Found`)
              .setDescription(
                `I couldn't find any warn data on ${user.tag} in ${interaction.guild.name}`
              )
              .setColor(colors.ERRORRED)
              .setFooter({
                text: `${interaction.guild.name} moderation powered by GBF™`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (!userWarnDocs)
              return interaction.reply({
                embeds: [NoData],
                ephemeral: true
              });

            if (
              userWarnDocs.warnID.length === 0 ||
              userWarnDocs.warnReason.length === 0 ||
              userWarnDocs.warns === 0
            )
              return interaction.reply({
                embeds: [NoData],
                ephemeral: true
              });

            let userDataArray = [];
            for (let i = 0; i < userWarnDocs.warnID.length; i++) {
              userDataArray.push(
                `**${i + 1}:** ${userWarnDocs.warnID[i]} - ${
                  userWarnDocs.warnReason[i]
                }`
              );
            }
            userDataArray = MessageSplit(userDataArray, 450);

            const embeds = [];
            const pages = {}; // {userId: pageNumber}

            for (let a = 0; a < userDataArray.length; a++) {
              let pageNumber = a + 1;
              embeds.push(
                new EmbedBuilder()
                  .setDescription(`${userDataArray[pageNumber - 1]}`)
                  .setColor(colors.DEFAULT)
                  .setTitle(`${user.username}'s warning data`)
                  .setFooter({
                    text: `${
                      interaction.guild.name
                    } moderation powered by GBF™ || Page ${a + 1} / ${
                      userDataArray.length
                    }`,
                    iconURL: interaction.user.displayAvatarURL()
                  })
              );
            }

            const getRow = (id) => {
              const MainButtonsRow = new ActionRowBuilder();
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
              components: [getRow(id)]
            });

            const filter = (i) => {
              return i.user.id === interaction.user.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                idle: 15000,
                time: 300000
              });

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay();

              if (i.customId === "prevEmbed") {
                pages[id]--;
                if (pages[id] < 0) pages[id] = 0;
                await interaction.editReply({
                  embeds: [embeds[pages[id]]],
                  components: [getRow(id)]
                });
              } else if (i.customId === "nextEmbed") {
                pages[id]++;
                if (pages[id] > embeds.length - 1)
                  pages[id] = embeds.length - 1;
                await interaction.editReply({
                  embeds: [embeds[pages[id]]],
                  components: [getRow(id)]
                });
              } else if (i.customId === "end") {
                await collector.stop();
              } else if (i.customId === "firstPage") {
                pages[id] = 0;
                await interaction.editReply({
                  embeds: [embeds[pages[id]]],
                  components: [getRow(id)]
                });
              } else if (i.customId === "finalPage") {
                pages[id] = embeds.length - 1;
                await interaction.editReply({
                  embeds: [embeds[pages[id]]],
                  components: [getRow(id)]
                });
              }
            });

            collector.on("end", async (i) => {
              const MainButtonsRowDisabled = new ActionRowBuilder();
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
                components: [MainButtonsRowDisabled]
              });
            });
          }
        }
      }
    });
  }
};
