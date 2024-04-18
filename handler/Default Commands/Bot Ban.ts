import SlashCommand from "../../utils/slashCommands";

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  ColorResolvable,
  CommandInteractionOptionResolver,
  TextChannel,
  hyperlink
} from "discord.js";

import colours from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";
import deverloperID from "../../GBF/Bot Ban Features.json";

import { GBFBotBanModel } from "../../schemas/GBF Schemas/Bot Ban Schema";
import GBFClient from "../clienthandler";

export default class botBans extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "bot-ban",
      description: "Ban a user from using the bot",
      category: "Developer",
      dmEnabled: false,
      devOnly: true,
      subcommands: {
        add: {
          description: "Ban a user from using GBF",
          args: [
            {
              name: "user",
              description: "The user that you want to ban from using this bot",
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
            const banReason = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("reason");

            const banData = await GBFBotBanModel.findOne({
              userId: targetUser.id
            });

            if (banData)
              return interaction.reply({
                content: `The user is already banned`,
                ephemeral: true
              });

            const newBanDoc = new GBFBotBanModel({
              userId: targetUser.id,
              reason: banReason,
              timeOfBan: new Date(Date.now()),
              Developer: interaction.user.id
            });

            await newBanDoc.save();

            const newBan = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Success`)
              .addFields(
                {
                  name: "Target",
                  value: `${targetUser.username} (${targetUser.id})`,
                  inline: true
                },
                {
                  name: "Developer",
                  value: `${interaction.user.username} (${interaction.user.id})`,
                  inline: true
                },
                {
                  name: "Reason:",
                  value: `${banReason}`,
                  inline: true
                }
              )
              .setColor(colours.DEFAULT as ColorResolvable)
              .setTimestamp()
              .setFooter({
                text: `${client.user.username} Security & Anti-Cheat`,
                iconURL: client.user.displayAvatarURL()
              });

            const AppealMessage = deverloperID.GBFBanAppeal.length
              ? `\n\nIf you think this is a mistake, submit a ticket ${hyperlink(
                  "here",
                  deverloperID.GBFBanAppeal
                )}`
              : ``;

            const dmBan = new EmbedBuilder()
              .setTitle(`📩 You have received a new message`)
              .setDescription(
                `You have been **banned** from ${
                  client.user.username
                } Services\nReason: ${banReason}\nTime of Ban: <t:${Math.floor(
                  Date.now() / 1000
                )}:F>${AppealMessage}`
              )
              .setColor(colours.DEFAULT as ColorResolvable)
              .setTimestamp()
              .setFooter({
                text: `${client.user.username} Security & Anti-Cheat`,
                iconURL: client.user.displayAvatarURL()
              });

            if (deverloperID.GBFBanAppeal.length) {
              const dmBanButton: ActionRowBuilder<any> =
                new ActionRowBuilder().addComponents(
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
                console.log(`I couldn't DM ${targetUser.username}\n\n${err}`);
              }
            } else {
              try {
                targetUser.send({
                  embeds: [dmBan]
                });
              } catch (err) {
                console.log(`I couldn't DM ${targetUser.username}\n\n${err}`);
              }
            }

            if (client.LogsChannel) {
              const logsChannel = client.channels.cache.get(
                client.LogsChannel
              ) as TextChannel;

              await logsChannel.send({
                embeds: [newBan]
              });
            }

            return interaction.reply({
              embeds: [newBan]
            });
          }
        },
        remove: {
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

            const banData = await GBFBotBanModel.findOne({
              userId: targerUser.id
            });

            if (!banData)
              return interaction.reply({
                content: `The user is not banned`,
                ephemeral: true
              });

            await GBFBotBanModel.deleteOne({
              userId: targerUser.id
            });

            const newUnban = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Success`)
              .setDescription(
                `${targerUser.username} (${targerUser.id}) has been unbanned from ${client.user.username} Services`
              )
              .setColor(colours.DEFAULT as ColorResolvable)
              .setTimestamp()
              .setFooter({
                text: `${client.user.username} Security & Anti-Cheat`,
                iconURL: client.user.displayAvatarURL()
              });

            const unBanDm = new EmbedBuilder()
              .setTitle(`📩 You have received a new message`)
              .setDescription(`You have been **unbanned** from GBF Services`)
              .setColor(colours.DEFAULT as ColorResolvable)
              .setTimestamp()
              .setFooter({
                text: `${client.user.username} Security & Anti-Cheat`,
                iconURL: client.user.displayAvatarURL()
              });

            try {
              targerUser.send({
                embeds: [unBanDm]
              });
            } catch (err) {
              console.log(`I couldn't DM ${targerUser.username}\n\n${err}`);
            }

            if (client.LogsChannel) {
              const logsChannel = client.channels.cache.get(
                client.LogsChannel
              ) as TextChannel;

              await logsChannel.send({
                embeds: [newUnban]
              });
            }

            return interaction.reply({
              embeds: [newUnban]
            });
          }
        }
      }
    });
  }
}
