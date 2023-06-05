import {
  BaseShop,
  HeartRings,
  OvalRings,
  RingShop,
  ShopMenu
} from "../../../GBF/SueLuz/Shop Features";

import GBFClient from "../../../handler/clienthandler";
import { GBFUserProfileModel } from "../../../schemas/User Schemas/User Profile Schema";
import { delay } from "../../../utils/Engine";
import SlashCommand from "../../../utils/slashCommands";

import colors from "../../../GBF/GBFColor.json";
import emojis from "../../../GBF/GBFEmojis.json";
import CommandLinks from "../../../GBF/GBFCommands.json";

import {
  ApplicationCommandOptionType,
  ButtonInteraction,
  ColorResolvable,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  Interaction,
  StringSelectMenuInteraction
} from "discord.js";

interface IExecute {
  client: GBFClient;
  interaction: CommandInteraction;
}

export default class SueLuzShop extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "shop",
      category: "Economy",
      description: "Buy or sell SueLuz items",

      options: [
        {
          name: "type",
          description: "The type of transaction that you want to perform",
          type: ApplicationCommandOptionType.String,
          choices: [
            {
              name: "Buy",
              value: "Buy"
            },
            {
              name: "Sell",
              value: "Sell"
            }
          ],
          required: true
        }
      ],

      devOnly: true,
      NSFW: false,
      cooldown: 0,
      development: true
    });
  }

  async execute({ client, interaction }: IExecute) {
    const TransactionType = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("type", true);

    const UnableToRun = new EmbedBuilder()
      .setTitle(`${emojis.ERROR} You can't do that`)
      .setColor(colors.ERRORRED as ColorResolvable);

    const UserData = await GBFUserProfileModel.findOne({
      userID: interaction.user.id
    });

    if (!UserData) {
      UnableToRun.setDescription(
        `You don't have a SueLuz account, create one using: ${CommandLinks.SueLuzRegister}`
      );
      return interaction.reply({
        embeds: [UnableToRun],
        ephemeral: true
      });
    }

    if (TransactionType === "Buy") {
      await interaction.reply({
        embeds: [BaseShop],
        components: [ShopMenu]
      });

      const filter = (i: Interaction) => {
        return i.user.id === interaction.user.id;
      };

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        idle: 300000
      });

      collector.on("collect", async (i: StringSelectMenuInteraction) => {
        await i.deferUpdate();
        await delay(750);

        if (i.values[0] === "MainMenuShop")
          await interaction.editReply({
            embeds: [BaseShop]
          });

        if (i.values[0] === "DynastySue") {
          await interaction.editReply({
            embeds: [RingShop],
            components: [ShopMenu, HeartRings, OvalRings]
          });
        }
      });
    }
  }
}
