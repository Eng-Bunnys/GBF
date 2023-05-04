const SlashCommand = require("../../../utils/slashCommands").default;

import {
  ApplicationCommandOptionType,
  Client,
  ColorResolvable,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  User
} from "discord.js";

import UserProfileSchema from "../../../schemas/User Schemas/User Profile Schema";

import colors from "../../../GBF/GBFColor.json";
import emojis from "../../../GBF/GBFEmojis.json";

interface IExecute {
  client: Client;
  interaction: CommandInteraction;
}

export default class SueLuzStatEditor extends SlashCommand {
  constructor(client: Client) {
    super(client, {
      name: "stat-edit",
      description: "[Developer] Edit a user's SueLuz stats",
      development: true,
      devOnly: true,
      subcommands: {
        ["give-cash"]: {
          description: "Give a user cash",
          args: [
            {
              name: "user",
              description: "The user that you want to give money to",
              type: ApplicationCommandOptionType.User,
              required: true
            },
            {
              name: "amount",
              description:
                "The amount of money that you want to give to the user",
              type: ApplicationCommandOptionType.Integer,
              required: true
            }
          ],
          execute: async ({ client, interaction }: IExecute) => {
            const targetUser: User = (
              interaction.options as CommandInteractionOptionResolver
            ).getUser("user", true);
            const editedAmount: number = (
              interaction.options as CommandInteractionOptionResolver
            ).getInteger("amount", true);

            const userData = await UserProfileSchema.findOne({
              userID: targetUser.id
            });

            const noUser = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} 404`)
              .setDescription(
                `The specified user does not have a SueLuz account`
              )
              .setColor(colors.ERRORRED as ColorResolvable);

            if (!userData)
              return interaction.reply({
                embeds: [noUser],
                ephemeral: true
              });

            const moneyAdded = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Success`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `Given ${targetUser.username} ₲${editedAmount.toLocaleString()}`
              );

            await userData.updateOne({
              cash: userData.cash + editedAmount,
              totalEarned: userData.totalEarned + editedAmount
            });

            return interaction.reply({
              embeds: [moneyAdded]
            });
          }
        },
        ["remove-cash"]: {
          description: "Take a user's cash",
          args: [
            {
              name: "user",
              description: "The user that you want to give money to",
              type: ApplicationCommandOptionType.User,
              required: true
            },
            {
              name: "amount",
              description:
                "The amount of money that you want to remove from the user",
              type: ApplicationCommandOptionType.Integer,
              required: true
            }
          ],
          execute: async ({ client, interaction }: IExecute) => {
            const targetUser: User = (
              interaction.options as CommandInteractionOptionResolver
            ).getUser("user", true);
            const editedAmount: number = (
              interaction.options as CommandInteractionOptionResolver
            ).getInteger("amount", true);

            const userData = await UserProfileSchema.findOne({
              userID: targetUser.id
            });

            const noUser = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} 404`)
              .setDescription(
                `The specified user does not have a SueLuz account`
              )
              .setColor(colors.ERRORRED as ColorResolvable);

            if (!userData)
              return interaction.reply({
                embeds: [noUser],
                ephemeral: true
              });

            const moneyRemoved = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Success`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `Removed from ${
                  targetUser.username
                } ₲${editedAmount.toLocaleString()}`
              );

            await userData.updateOne({
              cash: userData.cash - editedAmount
            });

            return interaction.reply({
              embeds: [moneyRemoved]
            });
          }
        }
      }
    });
  }
}
