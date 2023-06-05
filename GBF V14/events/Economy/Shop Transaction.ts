import {
  ButtonInteraction,
  ColorResolvable,
  EmbedBuilder,
  Events,
  User
} from "discord.js";
import { TransactionFailed } from "../../GBF/SueLuz/Shop Dialouge";
import { processPayment } from "../../utils/SueLuz Engine";
import { GBFUserProfileModel } from "../../schemas/User Schemas/User Profile Schema";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";
import CommandLinks from "../../GBF/GBFCommands.json";

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

      await interaction.deferReply();

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

        if (Transaction.errorMessage !== null)
          interaction.followUp({
            embeds: [TransactionFailed],
            ephemeral: true
          });
      }
      if (interaction.customId === "OMR") {
        const Transaction = ProcessRingPayment(
          RingPrices[interaction.customId]
        );

        if (Transaction.errorMessage !== null)
          interaction.followUp({
            embeds: [TransactionFailed],
            ephemeral: true
          });
      }
      if (interaction.customId === "OPR") {
        const Transaction = ProcessRingPayment(
          RingPrices[interaction.customId]
        );

        if (Transaction.errorMessage !== null)
          interaction.followUp({
            embeds: [TransactionFailed],
            ephemeral: true
          });
      }

      if (interaction.customId === "HDR") {
        const Transaction = ProcessRingPayment(
          RingPrices[interaction.customId]
        );

        if (Transaction.errorMessage !== null)
          interaction.followUp({
            embeds: [TransactionFailed],
            ephemeral: true
          });
      }

      if (interaction.customId === "HMR") {
        const Transaction = ProcessRingPayment(
          RingPrices[interaction.customId]
        );

        if (Transaction.errorMessage !== null)
          interaction.followUp({
            embeds: [TransactionFailed],
            ephemeral: true
          });
      }

      if (interaction.customId === "HPR") {
        const Transaction = ProcessRingPayment(
          RingPrices[interaction.customId]
        );

        if (Transaction.errorMessage !== null)
          interaction.followUp({
            embeds: [TransactionFailed],
            ephemeral: true
          });
      }

      if (interaction.customId === "HPSR") {
        const Transaction = ProcessRingPayment(
          RingPrices[interaction.customId]
        );

        if (Transaction.errorMessage !== null)
          interaction.followUp({
            embeds: [TransactionFailed],
            ephemeral: true
          });
      }
    }
  );
}
