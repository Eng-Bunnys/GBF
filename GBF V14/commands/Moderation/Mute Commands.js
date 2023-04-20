const SlashCommand = require("../../utils/slashCommands");

const colors = require("../../GBF/GBFColor.json");
const emojis = require("../../GBF/GBFEmojis.json");
const CommandLinks = require("../../GBF/GBFCommands.json");

const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const { msToTime } = require("../../utils/Engine");
const ServerSettings = require("../../schemas/Moderation Schemas/Server Settings");

module.exports = class MuteCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "mute",
      description: "Mute or un-mute a user from this server",
      userPermission: [PermissionFlagsBits.ModerateMembers],
      botPermission: [PermissionFlagsBits.ModerateMembers],
      cooldown: 0,
      development: true,
      subcommands: {
        add: {
          description: "Mute a user for a specific amount of time",
          args: [
            {
              name: "user",
              description: "The user that you want to mute",
              type: ApplicationCommandOptionType.User,
              required: true
            },
            {
              name: "duration",
              description: "The time that you want to mute the user for",
              type: ApplicationCommandOptionType.Number,
              required: true
            },
            {
              name: "unit",
              description:
                "The unit of the time that the user will be muted for",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "minutes",
                  value: "m"
                },
                {
                  name: "hours",
                  value: "h"
                },
                {
                  name: "days",
                  value: "d"
                }
              ],
              required: true
            },
            {
              name: "reason",
              description: "The reason that you want to timeout the user",
              type: ApplicationCommandOptionType.String
            }
          ],
          execute: async ({ client, interaction }) => {
            const targetMember = interaction.options.getMember("user");
            const setDuration = interaction.options.getNumber("duration");
            const durationUnit = interaction.options.getString("unit");
            const muteReason =
              interaction.options.getString("reason") || "No Reason Specified";

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

            let msDuration;

            if (durationUnit === "m") msDuration = setDuration * 60000;
            if (durationUnit === "h") msDuration = setDuration * 3600000;
            if (durationUnit === "d") msDuration = setDuration * 86400000;

            const tooLong = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `The time you specified is too long, you can't mute for more than 10 days.`
              )
              .setColor(colors.ERRORRED)
              .setFooter({
                text: `${interaction.guild.name} logging powered by GBF`,
                iconURL: interaction.guild.iconURL()
              })
              .setTimestamp();

            const tooShort = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `The time you specified is too short, you need to specifiy a time longer than one minute.`
              )
              .setColor(colors.ERRORRED)
              .setFooter({
                text: `${interaction.guild.name} logging powered by GBF`,
                iconURL: interaction.guild.iconURL()
              })
              .setTimestamp();

            if (msDuration > 864000000)
              return interaction.reply({
                embeds: [tooLong],
                ephemeral: true
              });

            if (msDuration < 60000)
              return interaction.reply({
                embeds: [tooShort],
                ephemeral: true
              });

            let combinedTime;

            if (targetMember.isCommunicationDisabled() === true) {
              combinedTime =
                targetMember.communicationDisabledUntil -
                Date.now() +
                msDuration;
            } else combinedTime = msDuration;

            if (combinedTime > 864000000) combinedTime = 864000000;

            const unixTime = Date.now() + combinedTime;

            const serverSettingsDocs = await ServerSettings.findOne({
              guildId: interaction.guild.id
            });

            const adminMute = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED)
              .setDescription(
                `I can't mute an admin, if you'd like to turn off this feature please change it in the bot server settings using ${CommandLinks.ServerSettings}`
              );

            if (
              (!serverSettingsDocs ||
                (serverSettingsDocs && !serverSettingsDocs.AdminMute)) &&
              targetMember.permissions.has(PermissionFlagsBits.Administrator) &&
              interaction.member.id !== interaction.guild.ownerId
            )
              return interaction.reply({
                embeds: [adminMute],
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

            const userMuted = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Success`)
              .setDescription(
                `${targetMember.user.tag} (${targetMember.id}) has been muted`
              )
              .setColor(colors.DEFAULT)
              .addFields(
                {
                  name: "Duration:",
                  value: `${msToTime(msDuration)}`,
                  inline: true
                },
                {
                  name: "Reason:",
                  value: `${muteReason}`,
                  inline: true
                },
                {
                  name: "Moderator:",
                  value: `${interaction.user.tag} (${interaction.user.id})`,
                  inline: true
                },
                {
                  name: "Mute Until:",
                  value: `<t:${Math.floor(unixTime / 1000)}:F>`,
                  inline: true
                }
              )
              .setFooter({
                text: `${interaction.guild.name} logging powered by GBF`,
                iconURL: interaction.guild.iconURL()
              })
              .setTimestamp();

            await targetMember.timeout(combinedTime, muteReason);

            return interaction.reply({
              embeds: [userMuted]
            });
          }
        },
        remove: {
          description: "Unmute a muted user",
          args: [
            {
              name: "user",
              description: "The user that you want to un-mute",
              type: ApplicationCommandOptionType.User,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const targetMember = interaction.options.getMember("user");

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

            const notMuted = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(`The user you specified isn't muted.`)
              .setColor(colors.ERRORRED)
              .setFooter({
                text: `${interaction.guild.name} logging powered by GBF`,
                iconURL: interaction.guild.iconURL()
              })
              .setTimestamp();

            if (!targetMember.isCommunicationDisabled())
              return interaction.reply({
                embeds: [notMuted],
                ephemeral: true
              });

            await targetMember.timeout(null);

            const userUnmuted = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Success`)
              .setColor(colors.DEFAULT)
              .setDescription(`${targetMember.user.tag} has been unmuted`)
              .addFields({
                name: "Moderator:",
                value: `${interaction.user.tag}`
              })
              .setFooter({
                text: `${interaction.guild.name} logging powered by GBF`,
                iconURL: interaction.guild.iconURL()
              })
              .setTimestamp();

            return interaction.reply({
              embeds: [userUnmuted]
            });
          }
        }
      }
    });
  }
};
