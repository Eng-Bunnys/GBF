const SlashCommand = require("../../utils/slashCommands");

const colors = require("../../GBF/GBFColor.json");
const emojis = require("../../GBF/GBFEmojis.json");
const BanSchema = require("../../schemas/Moderation Schemas/Ban Schema");

const ServerSettings = require("../../schemas/Moderation Schemas/Server Settings");
const CommandLinks = require("../../GBF/GBFCommands.json");

const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { getLastDigits, msToTime } = require("../../utils/Engine");

module.exports = class BanCommands extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "ban",
      description: "Ban or unban a user from this server",
      userPermission: [PermissionFlagsBits.BanMembers],
      botPermission: [PermissionFlagsBits.BanMembers],
      cooldown: 0,
      development: true,
      subcommands: {
        create: {
          description: "Ban a user from this server",
          args: [
            {
              name: "member",
              description: "The member that you want to ban from this server",
              type: ApplicationCommandOptionType.User,
              required: true
            },
            {
              name: "reason",
              description: "The reason for the ban",
              type: ApplicationCommandOptionType.String
            },
            {
              name: "delete-days",
              description:
                "Delete messages sent by the member in the past N days",
              type: ApplicationCommandOptionType.Number,
              minValue: 0,
              maxValue: 7
            }
          ],
          execute: async ({ client, interaction }) => {
            const targetUser = interaction.options.getUser("member");
            const banReason =
              interaction.options.getString("reason") || "No Reason Specified";
            const deleteDays =
              (interaction.options.getNumber("delete-days") || 0) * 86400;

            const UserAlreadyBanned = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED)
              .setDescription(
                `The specified user is already banned from ${interaction.guild.name}`
              );

            const guildBans = await interaction.guild.bans.fetch();
            if (guildBans) {
              const userBannedBoolean = guildBans.get(targetUser.id);
              if (userBannedBoolean)
                return interaction.reply({
                  embeds: [UserAlreadyBanned],
                  ephemeral: true
                });
            }

            const targetMember = await interaction.guild.members.cache.get(
              targetUser.id
            );

            if (targetMember) {
              const ownerBan = new EmbedBuilder()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setColor(colors.ERRORRED)
                .setDescription(`You can't ban the owner of this server!`);

              if (targetMember.id === interaction.guild.ownerId)
                return interaction.reply({
                  embeds: [ownerBan],
                  ephemeral: true
                });

              const selfBan = new EmbedBuilder()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setColor(colors.ERRORRED)
                .setDescription(`You cannot ban yourself.`);

              if (targetMember.id === interaction.user.id)
                return interaction.reply({
                  embeds: [selfBan],
                  ephemeral: true
                });

              const botBan = new EmbedBuilder()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setColor(colors.ERRORRED)
                .setDescription(`I can't ban myself from this server!`);

              if (targetMember.id === client.user.id)
                return interaction.reply({
                  embeds: [botBan],
                  ephemeral: true
                });
            }

            const serverSettingsDocs = await ServerSettings.findOne({
              guildId: interaction.guild.id
            });

            const adminBan = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED)
              .setDescription(
                `I can't ban an admin, if you'd like to turn off this feature please change it in the bot server settings using ${CommandLinks.ServerSettings}`
              );

            if (
              (!serverSettingsDocs ||
                (serverSettingsDocs && !serverSettingsDocs.AdminBan)) &&
              targetMember.permissions.has(PermissionFlagsBits.Administrator) &&
              interaction.member.id !== interaction.guild.ownerId
            )
              return interaction.reply({
                embeds: [adminBan],
                ephemeral: true
              });

            const botPosition =
              interaction.guild.members.me.roles.highest.position;
            const targetPosition = targetMember.roles.highest.position;

            if (interaction.member.id !== interaction.guild.ownerId) {
              const commandAuthorPosition =
                interaction.member.roles.highest.position;

              const authorLower = new EmbedBuilder()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setColor(colors.ERRORRED)
                .setDescription(
                  `${targetMember.user.username}'s position is higher or equal to yours.`
                );

              if (commandAuthorPosition <= targetPosition)
                return interaction.reply({
                  embeds: [authorLower],
                  ephemeral: true
                });
            }

            const botLower = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED)
              .setDescription(
                `${targetMember.user.username}'s position is higher or equal to mine.`
              );

            if (botPosition <= targetPosition)
              return interaction.reply({
                embeds: [botLower],
                ephemeral: true
              });

            const BanData = await BanSchema.findOne({
              userId: targetMember.id,
              guildId: interaction.guild.id
            });

            const caseIDIdentifier = getLastDigits(interaction.guild.id, 3);

            const userBanned = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} User Banned`)
              .setColor(colors.DEFAULT)
              .setFields(
                {
                  name: "Moderator:",
                  value: `${interaction.user.tag} (${interaction.user.id})`,
                  inline: true
                },
                {
                  name: "Target:",
                  value: `${targetMember.user.tag} (${targetMember.id})`,
                  inline: true
                },
                {
                  name: "Reason:",
                  value: `${banReason}`,
                  inline: true
                },
                {
                  name: "Time of Ban:",
                  value: `<t:${Math.round(new Date().getTime() / 1000)}:F>`,
                  inline: true
                },
                {
                  name: "Case ID:",
                  value: `#BN${
                    BanData ? BanData.TotalCases + 1 : 1
                  }GI${caseIDIdentifier}`,
                  inline: true
                },
                {
                  name: "Messages Sent Deleted",
                  value: `${
                    deleteDays > 0
                      ? msToTime((deleteDays / 86400) * 8.64e7)
                      : "Don't Delete"
                  }`,
                  inline: true
                }
              )
              .setFooter({
                text: `${interaction.guild.name} Moderation powered by GBF`,
                iconURL: client.user.displayAvatarURL()
              });

            if (serverSettingsDocs && serverSettingsDocs.BanDM) {
              const DMBan = new EmbedBuilder()
                .setTitle(`You've been banned from ${interaction.guild.name}`)
                .setColor(colors.DEFAULT)
                .setDescription(
                  `You've been banned from ${interaction.guild.name} by ${interaction.user.username} for the following reason(s): ${banReason}`
                )
                .setFooter({
                  text: `${interaction.guild.name} Moderation powered by GBF`,
                  iconURL: interaction.guild.iconURL()
                })
                .setTimestamp();

              try {
                targetMember.send({
                  embeds: [DMBan]
                });
              } catch (err) {
                const logsChannel = await interaction.guild.channels.cache.get(
                  serverSettingsDocs.LogsChannel
                );

                if (logsChannel)
                  return logsChannel.send({
                    content: `${emojis.ERROR} I couldn't DM ${targetMember.user.tag} telling them they were banned.`
                  });
              }
            }

            if (BanData) {
              BanData.Cases.push(
                `#BN${
                  BanData ? BanData.TotalCases + 1 : 1
                }GI${caseIDIdentifier}`
              );
              BanData.Reasons.push(`${banReason}`);
              BanData.TotalCases += 1;

              await BanData.save();

              await interaction.reply({
                embeds: [userBanned]
              });

              return interaction.guild.bans.create(targetMember.id, {
                deleteMessageSeconds: deleteDays,
                reason: banReason
              });
            } else {
              const newBanData = new BanSchema({
                guildId: interaction.guild.id,
                userId: targetMember.id,
                Cases: [
                  `#BN${
                    BanData ? BanData.TotalCases + 1 : 1
                  }GI${caseIDIdentifier}`
                ],
                Reasons: [`${banReason}`],
                TotalCases: 1
              });

              await newBanData.save();

              await interaction.reply({
                embeds: [userBanned]
              });

              return interaction.guild.bans.create(targetMember.id, {
                deleteMessageSeconds: deleteDays,
                reason: banReason
              });
            }
          }
        },
        remove: {
          description: "Unban a user from this server",
          args: [
            {
              name: "user",
              description: "The user that you want to un-ban from this server.",
              type: ApplicationCommandOptionType.User,
              required: true
            },
            {
              name: "reason",
              description: "The reason for un-banning the user",
              type: ApplicationCommandOptionType.String
            }
          ],
          execute: async ({ client, interaction }) => {
            const targetUser = interaction.options.getUser("user");
            const unbanReason =
              interaction.options.getString("reason") || "No Reason Specified";

            const targetMember = await interaction.guild.members.cache.get(
              targetUser.id
            );

            const targetNotBanned = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} You can't do that`)
              .setColor(colors.ERRORRED)
              .setDescription(
                `The specified user is not banned in ${interaction.guild.name}`
              );

            const guildBans = await interaction.guild.bans.fetch();

            if (targetMember)
              return interaction.reply({
                embeds: [targetNotBanned],
                ephemeral: true
              });

            if (!guildBans)
              return interaction.reply({
                embeds: [targetNotBanned],
                ephemeral: true
              });

            if (guildBans) {
              const userBannedBoolean = guildBans.get(targetUser.id);
              if (!userBannedBoolean)
                return interaction.reply({
                  embeds: [targetNotBanned],
                  ephemeral: true
                });
            }

            const userUnbanned = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} User Unbanned`)
              .setColor(colors.DEFAULT)
              .setFields(
                {
                  name: "Moderator:",
                  value: `${interaction.user.tag} (${interaction.user.id})`,
                  inline: true
                },
                {
                  name: "Target:",
                  value: `${targetUser.tag} (${targetUser.id})`,
                  inline: true
                },
                {
                  name: "\u200b",
                  value: "\u200b",
                  inline: true
                },
                {
                  name: "Reason:",
                  value: `${unbanReason}`,
                  inline: true
                },
                {
                  name: "Time of Ban:",
                  value: `<t:${Math.round(new Date().getTime() / 1000)}:F>`,
                  inline: true
                },
                {
                  name: "\u200b",
                  value: "\u200b",
                  inline: true
                }
              )
              .setFooter({
                text: `${interaction.guild.name} Moderation powered by GBF`,
                iconURL: client.user.displayAvatarURL()
              });

            await interaction.reply({
              embeds: [userUnbanned]
            });

            return interaction.guild.bans.remove(targetUser.id, unbanReason);
          }
        }
      }
    });
  }
};
