import {
  ButtonInteraction,
  ColorResolvable,
  EmbedBuilder,
  Events
} from "discord.js";

import {
  CheapRing,
  ExpensiveRing,
  MidRangeRing,
  TransactionFailed
} from "../../GBF/SueLuz/Shop Dialouge";

import { processPayment } from "../../API/Economy/SueLuz Engine";
import { GBFUserProfileModel } from "../../schemas/User Schemas/User Profile Schema";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";
import CommandLinks from "../../GBF/GBFCommands.json";
import { RingCustomIds } from "../../GBF/SueLuz/Shop Features";
import GBFClient from "../../handler/clienthandler";

export default function ShopTransaction(client) {
  client.on(
    Events.InteractionCreate,
    async (interaction: ButtonInteraction) => {
      if (!interaction.isButton()) return;

      const UserData = await GBFUserProfileModel.findOne({
        userID: interaction.user.id
      });

      const NoAccount = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} You can't do that`)
        .setColor(colors.ERRORRED as ColorResolvable)
        .setDescription(
          `You don't have a SueLuz account, create one using: ${CommandLinks.SueLuzRegister}`
        );

      if (!UserData)
        return interaction.reply({
          embeds: [NoAccount],
          ephemeral: true
        });

      if (
        interaction.customId !== RingCustomIds["Heart Diamond Ring"] &&
        interaction.customId !== RingCustomIds["Heart Musgravite Ring"] &&
        interaction.customId !== RingCustomIds["Heart Painite Ring"] &&
        interaction.customId !== RingCustomIds["Heart Pink Star Ring"] &&
        interaction.customId !== RingCustomIds["Oval Diamond Ring"] &&
        interaction.customId !== RingCustomIds["Oval Musgravite Ring"] &&
        interaction.customId !== RingCustomIds["Oval Painite Ring"]
      )
        return;

      const RingOwned: string = `${interaction.user}, You already own this ring`;

      const RingPrices = {
        "ODR": 50000,
        "HDR": 100000,
        "OMR": 200000,
        "HMR": 250000,
        "OPR": 1000000,
        "HPR": 1500000,
        "HPSR": 4600000
      };

      function ProcessRingPayment(Ring: number) {
        return processPayment("wallet", UserData.cash, UserData.bank, Ring);
      }

      if (interaction.customId === "ODR") {
        const Transaction = ProcessRingPayment(
          RingPrices[interaction.customId]
        );

        if (UserData.inventory.rings["Oval Diamond Ring"])
          return interaction.reply({
            content: `${RingOwned}`,
            ephemeral: true
          });

        if (Transaction.errorMessage !== null)
          interaction.reply({
            embeds: [TransactionFailed],
            ephemeral: true
          });

        await UserData.updateOne({
          cash:
            Transaction.paymentType === "wallet"
              ? Transaction.remainingBalance
              : UserData.cash,
          bank:
            Transaction.paymentType === "bank"
              ? Transaction.remainingBalance
              : UserData.bank,
          inventory: {
            rings: {
              "Oval Diamond Ring": true
            }
          }
        });

        return interaction.reply({
          content: `${interaction.user}`,
          embeds: [CheapRing]
        });
      }
      if (interaction.customId === "OMR") {
        const Transaction = ProcessRingPayment(
          RingPrices[interaction.customId]
        );

        if (UserData.inventory.rings["Oval Musgravite Ring"])
          return interaction.reply({
            content: `${RingOwned}`,
            ephemeral: true
          });

        if (Transaction.errorMessage !== null)
          interaction.reply({
            embeds: [TransactionFailed],
            ephemeral: true
          });

        await UserData.updateOne({
          cash:
            Transaction.paymentType === "wallet"
              ? Transaction.remainingBalance
              : UserData.cash,
          bank:
            Transaction.paymentType === "bank"
              ? Transaction.remainingBalance
              : UserData.bank,
          inventory: {
            rings: {
              "Oval Musgravite Ring": true
            }
          }
        });

        return interaction.reply({
          content: `${interaction.user}`,
          embeds: [CheapRing]
        });
      }
      if (interaction.customId === "OPR") {
        const Transaction = ProcessRingPayment(
          RingPrices[interaction.customId]
        );

        if (UserData.inventory.rings["Oval Painite Ring"])
          return interaction.reply({
            content: `${RingOwned}`,
            ephemeral: true
          });

        if (Transaction.errorMessage !== null)
          interaction.reply({
            embeds: [TransactionFailed],
            ephemeral: true
          });

        await UserData.updateOne({
          cash:
            Transaction.paymentType === "wallet"
              ? Transaction.remainingBalance
              : UserData.cash,
          bank:
            Transaction.paymentType === "bank"
              ? Transaction.remainingBalance
              : UserData.bank,
          inventory: {
            rings: {
              "Oval Painite Ring": true
            }
          }
        });

        return interaction.reply({
          content: `${interaction.user}`,
          embeds: [CheapRing]
        });
      }

      if (interaction.customId === "HDR") {
        const Transaction = ProcessRingPayment(
          RingPrices[interaction.customId]
        );

        if (UserData.inventory.rings["Heart Diamond Ring"])
          return interaction.reply({
            content: `${RingOwned}`,
            ephemeral: true
          });

        if (Transaction.errorMessage !== null)
          interaction.reply({
            embeds: [TransactionFailed],
            ephemeral: true
          });

        await UserData.updateOne({
          cash:
            Transaction.paymentType === "wallet"
              ? Transaction.remainingBalance
              : UserData.cash,
          bank:
            Transaction.paymentType === "bank"
              ? Transaction.remainingBalance
              : UserData.bank,
          inventory: {
            rings: {
              "Heart Diamond Ring": true
            }
          }
        });

        return interaction.reply({
          content: `${interaction.user}`,
          embeds: [MidRangeRing]
        });
      }

      if (interaction.customId === "HMR") {
        const Transaction = ProcessRingPayment(
          RingPrices[interaction.customId]
        );

        if (UserData.inventory.rings["Heart Musgravite Ring"])
          return interaction.reply({
            content: `${RingOwned}`,
            ephemeral: true
          });

        if (Transaction.errorMessage !== null)
          interaction.reply({
            embeds: [TransactionFailed],
            ephemeral: true
          });

        await UserData.updateOne({
          cash:
            Transaction.paymentType === "wallet"
              ? Transaction.remainingBalance
              : UserData.cash,
          bank:
            Transaction.paymentType === "bank"
              ? Transaction.remainingBalance
              : UserData.bank,
          inventory: {
            rings: {
              "Heart Musgravite Ring": true
            }
          }
        });

        return interaction.reply({
          content: `${interaction.user}`,
          embeds: [MidRangeRing]
        });
      }

      if (interaction.customId === "HPR") {
        const Transaction = ProcessRingPayment(
          RingPrices[interaction.customId]
        );

        if (UserData.inventory.rings["Heart Painite Ring"])
          return interaction.reply({
            content: `You already own this ring`,
            ephemeral: true
          });

        if (Transaction.errorMessage !== null)
          interaction.reply({
            embeds: [TransactionFailed],
            ephemeral: true
          });

        await UserData.updateOne({
          cash:
            Transaction.paymentType === "wallet"
              ? Transaction.remainingBalance
              : UserData.cash,
          bank:
            Transaction.paymentType === "bank"
              ? Transaction.remainingBalance
              : UserData.bank,
          inventory: {
            rings: {
              "Heart Painite Ring": true
            }
          }
        });

        return interaction.reply({
          content: `${interaction.user}`,
          embeds: [ExpensiveRing]
        });
      }

      if (interaction.customId === "HPSR") {
        const Transaction = ProcessRingPayment(
          RingPrices[interaction.customId]
        );

        if (UserData.inventory.rings["Heart Pink Star Ring"])
          return interaction.reply({
            content: `${RingOwned}`,
            ephemeral: true
          });

        if (Transaction.errorMessage !== null)
          interaction.reply({
            embeds: [TransactionFailed],
            ephemeral: true
          });

        await UserData.updateOne({
          cash:
            Transaction.paymentType === "wallet"
              ? Transaction.remainingBalance
              : UserData.cash,
          bank:
            Transaction.paymentType === "bank"
              ? Transaction.remainingBalance
              : UserData.bank,
          inventory: {
            rings: {
              "Heart Pink Star Ring": true
            }
          }
        });

        if (!UserData.achievements.PinkStar)
          (client as GBFClient).emit(
            "achievementGet",
            interaction,
            interaction.user,
            "PinkDiamond"
          );

        return interaction.reply({
          content: `${interaction.user}`,
          embeds: [ExpensiveRing]
        });
      }
    }
  );
}
