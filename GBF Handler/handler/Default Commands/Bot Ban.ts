import SlashCommand from "../../utils/slashCommands";

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  ColorResolvable,
  CommandInteraction,
  CommandInteractionOptionResolver,
  TextChannel,
  User
} from "discord.js";

import colours from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";
import deverloperID from "../../GBF/Bot Ban Features.json";

import { GBFBotBanModel } from "../../schemas/GBF Schemas/Bot Ban Schema";
import GBFClient from "../clienthandler";

interface IExecute {
  client: GBFClient;
  interaction: CommandInteraction;
}

export default class botBans extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "bot-ban",
      description: "Ban a user from using the bot",
      category: "Developer",
      cooldown: 0,
      devOnly: true,
      subcommands: {
        add: {
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
          execute: async ({ client, interaction }: IExecute) => {
            const targetUser: User = interaction.options.getUser("user");
            const banReason: string = (
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
                  value: `${targetUser.tag} (${targetUser.id})`,
                  inline: true
                },
                {
                  name: "Developer",
                  value: `${interaction.user.tag} (${interaction.user.id})`,
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
                text: `GBF Security & Anti-Cheat`,
                iconURL: client.user.displayAvatarURL()
              });

            const dmBan = new EmbedBuilder()
              .setTitle(`📩 You have received a new message`)
              .setDescription(
                `You have been **banned** from GBF Services\nReason: ${banReason}\nTime of Ban: <t:${Math.floor(
                  Date.now() / 1000
                )}:F>\n\nIf you think this is a mistake, submit a ticket [here](${
                  deverloperID.GBFBanAppeal
                })`
              )
              .setColor(colours.DEFAULT as ColorResolvable)
              .setTimestamp()
              .setFooter({
                text: `GBF Security & Anti-Cheat`,
                iconURL: client.user.displayAvatarURL()
              });

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
              console.log(`I couldn't DM ${targetUser.tag}`);
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
          execute: async ({ client, interaction }: IExecute) => {
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
                `${targerUser.tag} (${targerUser.id}) has been unbanned from GBF Services`
              )
              .setColor(colours.DEFAULT as ColorResolvable)
              .setTimestamp()
              .setFooter({
                text: `GBF Security & Anti-Cheat`,
                iconURL: client.user.displayAvatarURL()
              });

            const unBanDm = new EmbedBuilder()
              .setTitle(`📩 You have received a new message`)
              .setDescription(`You have been **unbanned** from GBF Services`)
              .setColor(colours.DEFAULT as ColorResolvable)
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
