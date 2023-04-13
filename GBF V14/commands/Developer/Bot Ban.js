const SlashCommand = require("../../utils/slashCommands");

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType
} = require("discord.js");

const colours = require("../../GBF/GBFColor.json");
const emojis = require("../../GBF/GBFEmojis.json");
const deverloperID = require("../../GBF/Bot Ban Features.json");

const botBanSchema = require("../../schemas/GBF Schemas/Bot Ban Schema");

module.exports = class botBans extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "bot-ban",
      description: "Ban a user from using the bot",
      category: "Developer",
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: false,
      devOnly: true,
      subcommands: {
        ban: {
          description: "Ban a user from using GBF",
          args: [
            {
              name: "user",
              description: "The user that you want to ban",
              type: ApplicationCommandOptionType.User,
              required: true
            },
            {
              name: "reason",
              description: "The reason for the ban",
              type: ApplicationCommandOptionType.String,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const targetUser = interaction.options.getUser("user");
            const banReason = interaction.options.getString("reason");

            const banData = await botBanSchema.findOne({
              userId: targetUser.id
            });

            if (banData)
              return interaction.reply({
                content: `The user is already banned`,
                ephemeral: true
              });

            const newBanDoc = new botBanSchema({
              userId: targetUser.id,
              reason: banReason,
              timeOfBan: new Date(Date.now()),
              Developer: interaction.user.id
            });

            await newBanDoc.save();

            const newBan = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Success`)
              .setDescription(
                `**${targetUser.tag}**[${targetUser.id}] has been banned from GBF Services\nReason: ${banReason}\nBanned By: ${interaction.user.tag}`
              )
              .setColor(colours.DEFAULT)
              .setTimestamp()
              .setFooter({
                text: `GBF Security & Anti-Cheat`,
                iconURL: client.user.displayAvatarURL()
              });

            const logsChannel = await client.channels.fetch(
              deverloperID.GBFLogsChannel
            );

            const dmBan = new EmbedBuilder()
              .setTitle(`📩 You have received a new message`)
              .setDescription(
                `You have been **banned** from GBF Services\nReason: ${banReason}\nTime of Ban: <t:${Math.floor(
                  Date.now() / 1000
                )}:F>\n\nIf you think this is a mistake, submit a ticket [here](${
                  deverloperID.GBFBanAppeal
                })`
              )
              .setColor(colours.DEFAULT)
              .setTimestamp()
              .setFooter({
                text: `GBF Security & Anti-Cheat`,
                iconURL: client.user.displayAvatarURL()
              });

            const dmBanButton = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel("Ban Appeal")
                .setStyle(ButtonStyle.Link)
                .setURL(deverloperID.GBFBanAppeal)
            );

            try {
              targetUser.send({
                embeds: [dmBan],
                components: [dmBanButton]
              });
            } catch (err) {
              console.log(`I couldn't DM ${targetUser.tag}`);
            }
            await logsChannel.send({
              embeds: [newBan]
            });

            return interaction.reply({
              embeds: [newBan]
            });
          }
        },
        unban: {
          description: "Unban a user from using GBF",
          args: [
            {
              name: "user",
              description: "The user that you want to unban",
              type: ApplicationCommandOptionType.User,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const targerUser = interaction.options.getUser("user");

            const banData = await botBanSchema.findOne({
              userId: targerUser.id
            });

            if (!banData)
              return interaction.reply({
                content: `The user is not banned`,
                ephemeral: true
              });

            await botBanSchema.deleteOne({
              userId: targerUser.id
            });

            const newUnban = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Success`)
              .setDescription(
                `**${targerUser.tag}**[${targerUser.id}] has been unbanned from GBF Services`
              )
              .setColor(colours.DEFAULT)
              .setTimestamp()
              .setFooter({
                text: `GBF Security & Anti-Cheat`,
                iconURL: client.user.displayAvatarURL()
              });

            const unBanDm = new EmbedBuilder()
              .setTitle(`📩 You have received a new message`)
              .setDescription(`You have been **unbanned** from GBF Services`)
              .setColor(colours.DEFAULT)
              .setTimestamp()
              .setFooter({
                text: `GBF Security & Anti-Cheat`,
                iconURL: client.user.displayAvatarURL()
              });

            try {
              targerUser.send({
                embeds: [unBanDm]
              });
            } catch (err) {
              console.log(`I couldn't DM ${targerUser.tag}`);
            }

            const logsChannel = await client.channels.fetch(
              deverloperID.GBFLogsChannel
            );

            await logsChannel.send({
              embeds: [newUnban]
            });

            return interaction.reply({
              embeds: [newUnban]
            });
          }
        }
      }
    });
  }
};
