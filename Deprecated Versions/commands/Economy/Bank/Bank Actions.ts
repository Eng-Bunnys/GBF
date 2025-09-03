import SlashCommand from "../../../utils/slashCommands";

import {
  EmbedBuilder,
  ColorResolvable,
  ApplicationCommandOptionType,
  CommandInteractionOptionResolver
} from "discord.js";

import colors from "../../../GBF/GBFColor.json";
import emojis from "../../../GBF/GBFEmojis.json";
import CommandLinks from "../../../GBF/GBFCommands.json";

import {
  GBFUserProfileModel,
  IUserProfileData
} from "../../../schemas/User Schemas/User Profile Schema";

import GBFClient from "../../../handler/clienthandler";
import { capitalize } from "../../../utils/Engine";
import { createAccount } from "../../../API/Economy/SueLuz Engine";
import EconomyUser from "../../../API/Economy/User Based";

export default class BankActions extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "bank",
      description: "Actions that you can do with your balance in SueLuz",
      category: "Economy",
      userPermission: [],
      botPermission: [],
      cooldown: 20,
      subcommands: {
        balance: {
          description: "Check your SueLuz balance",
          execute: async ({ client, interaction }) => {
            const SueLuzUserData = new EconomyUser(interaction.user.id);

            const UserData = SueLuzUserData.getBalance();

            const BankBalance = new EmbedBuilder()
              .setTitle(`${capitalize(interaction.user.username)}'s Balance`)
              .setColor(colors.DunkelLuzGreen as ColorResolvable)
              .addFields(
                {
                  name: "Wallet:",
                  value: `₲${UserData[1].toLocaleString()}`,
                  inline: true
                },
                {
                  name: "Bank:",
                  value: `₲${UserData[0].toLocaleString()}`,
                  inline: true
                }
              )
              .setFooter({
                text: `Estafadores Bank | SueLuz`
              });

            return interaction.reply({
              embeds: [BankBalance]
            });
          }
        },
        transfer: {
          description: "Transfer money to and from your bank",
          args: [
            {
              name: "amount",
              description: "The amount that you want to transfer",
              type: ApplicationCommandOptionType.Integer,
              required: true
            },
            {
              name: "type",
              description: "The account that you want to transfer money from",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Deposit",
                  value: "bank"
                },
                {
                  name: "Withdraw",
                  value: "wallet"
                }
              ],
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const UserData = await GBFUserProfileModel.findOne({
              userID: interaction.user.id
            });

            if (!UserData) {
              await createAccount(interaction.user.id);

              const NoAccount = new EmbedBuilder()
                .setTitle(`${emojis.ERROR} Not yet!`)
                .setColor(colors.ERRORRED as ColorResolvable)
                .setDescription(
                  `Welcome to SueLuz! I've automatically created your account, you can now use this command.`
                );

              return interaction.reply({
                embeds: [NoAccount]
              });
            }

            const TransferType = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("type");

            const TransferAmount = (
              interaction.options as CommandInteractionOptionResolver
            ).getInteger("amount");

            function hasSufficientBalance(
              type: string,
              data: IUserProfileData,
              amount: number
            ) {
              return type === "bank"
                ? data.cash >= amount
                : data.bank >= amount;
            }

            const TransferBoolean = hasSufficientBalance(
              TransferType,
              UserData,
              TransferAmount
            );

            const NoFunds = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(
                `You don't have sufficient funds in your ${TransferType}.`
              );

            if (!TransferBoolean)
              return interaction.reply({
                embeds: [NoFunds],
                ephemeral: true
              });

            const RemainingBalance =
              TransferType === "wallet"
                ? UserData.bank - TransferAmount
                : UserData.cash - TransferAmount;

            const Transaction =
              TransferType === "wallet"
                ? {
                    bank: RemainingBalance,
                    cash: UserData.cash + TransferAmount
                  }
                : {
                    cash: RemainingBalance,
                    bank: UserData.bank + TransferAmount
                  };

            await UserData.updateOne(Transaction);

            const TransferredMessage =
              TransferType === "wallet"
                ? `Withdrew **₲${TransferAmount.toLocaleString()}**`
                : `Deposited **₲${TransferAmount.toLocaleString()}**`;

            const TransferEmbed = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Transaction Complete`)
              .setColor(colors.DunkelLuzGreen as ColorResolvable)
              .setDescription(`${TransferredMessage}`)
              .setFooter({
                text: `Estafadores Bank | SueLuz`
              });

            return interaction.reply({
              embeds: [TransferEmbed]
            });
          }
        }
      }
    });
  }
}
