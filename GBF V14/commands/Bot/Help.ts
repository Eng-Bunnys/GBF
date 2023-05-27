import SlashCommand from "../../utils/slashCommands";

import {
  APIEmbedField,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  Client,
  Collection,
  ColorResolvable,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  StringSelectMenuBuilder
} from "discord.js";

import { GBFSlash, GBFSlashOptions } from "../../handler/handlerforSlash";
import { CommandOptions } from "../../handler/commandhandler";

import GBFClient from "../../handler/clienthandler";

import colors from "../../GBF/GBFColor.json";
import { capitalize } from "../../utils/Engine";

interface IExecute {
  client: GBFClient;
  interaction: CommandInteraction;
}

export default class HelpMenu extends SlashCommand {
  constructor(client: Client) {
    super(client, {
      name: "help",
      description: "Get information about GBF's commands",
      category: "Bot-Info",
      options: [
        {
          name: "type",
          description: "The type of commands that you want to know about",
          type: ApplicationCommandOptionType.String,
          choices: [
            {
              name: "Slash Commands",
              value: "Slash"
            },
            {
              name: "Message Commands",
              value: "Message"
            }
          ],
          required: true
        }
      ],
      devOnly: false,
      devBypass: false,
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: true,
      dmEnabled: true,
      Partner: false
    });
  }

  async execute({ client, interaction }: IExecute) {
    const HelpType = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("type");

    const HelpMenuSlash = new EmbedBuilder()
      .setTitle(`${client.user.username} Help Menu | Slash`)
      .setColor(colors.DEFAULT as ColorResolvable)
      .setFooter({
        text: `Use the select menu to get more detailed information about categories / commands`
      });

    const HelpMenuLegacy = new EmbedBuilder()
      .setTitle(`${client.user.username} Help Menu | Legacy`)
      .setColor(colors.DEFAULT as ColorResolvable)
      .setFooter({
        text: `Use the select menu to get more detailed information about categories / commands`
      });

    const LegacyCategories = [{ name: "test", emoji: "👻" }];
    const SlashCategories = [
      { name: "Animals", emoji: "🐦" },
      {
        name: "Bot-Info",
        emoji: `🤖`
      },
      {
        name: "Developer",
        emoji: `👩🏽‍💻`
      },
      {
        name: "Economy",
        emoji: "💰"
      },
      {
        name: "Storymode",
        emoji: "🌆"
      },
      {
        name: "Freebie",
        emoji: "🎮"
      },
      {
        name: "Love",
        emoji: "💗"
      },
      {
        name: "Moderation",
        emoji: "🔐"
      },
      {
        name: "Timer",
        emoji: "⏲️"
      }
    ];

    function toLowerCaseArray(arr: string[]): string[] {
      return arr.map((elem) => elem.toLowerCase());
    }

    function generateHelpMenuFields(
      commands: Collection<string, CommandOptions | GBFSlashOptions>,
      categories: { name: string; emoji: string }[],
      excludedCategories: string[] = []
    ): APIEmbedField[] {
      const fields = commands.reduce<APIEmbedField[]>(
        (fieldAccumulator, cmd) => {
          if (
            toLowerCaseArray(excludedCategories).includes(
              cmd.category.toLocaleLowerCase()
            ) ||
            cmd.category === ""
          ) {
            return fieldAccumulator;
          }
          const categoryIndex = categories.findIndex(
            (c) => c.name === cmd.category
          );
          const categoryName =
            categoryIndex === -1
              ? cmd.category
              : `${categories[categoryIndex].emoji} ${categories[categoryIndex].name}`;
          let category: {
            name: string;
            value: string;
            inline?: boolean;
          } = {
            name: `• ${capitalize(categoryName)}`,
            value: `\`${cmd.name}\``,
            inline: true
          };
          const existingCategoryField = fieldAccumulator.find(
            (field) => field.name === category.name
          );
          if (existingCategoryField) {
            category = existingCategoryField;
          } else {
            fieldAccumulator.push(category);
          }
          if (cmd instanceof GBFSlash) {
            if (cmd.subcommands) {
              const subcommands = Object.keys(cmd.subcommands)
                .map((key) => `\`${key}\``)
                .join(", ");
              category.value += ` - ${subcommands}`;
            }
          }
          return fieldAccumulator;
        },
        []
      );
      return fields;
    }

    function generateCategorySelectMenu(
      categories: { name: string; emoji: string }[],
      excludedCategories: string[] = []
    ): StringSelectMenuBuilder {
      const filteredCategories = categories.filter(
        (cat) =>
          cat.name !== "" &&
          !toLowerCaseArray(excludedCategories).includes(cat.name.toLowerCase())
      );

      const selectOptions = filteredCategories.map((c) => {
        return {
          label: c.emoji + " " + c.name,
          value: c.name
        };
      });

      const HelpMenuSelect = new StringSelectMenuBuilder()
        .setCustomId("HelpMenuSelect")
        .setPlaceholder("Select a category")
        .addOptions(selectOptions);

      return HelpMenuSelect;
    }

    const LegacyHelpMenuFields = generateHelpMenuFields(
      client.commands,
      LegacyCategories,
      ["Developer", "Storymode"]
    );

    const LegacyHelpCategoryMenu = generateCategorySelectMenu(
      LegacyCategories,
      ["Developer", "storymode"]
    );

    const SlashHelpMenuFields = generateHelpMenuFields(
      client.slashCommands,
      SlashCategories,
      ["Developer", "Storymode"]
    );

    const SlashHelpCategoryMenu = generateCategorySelectMenu(SlashCategories, [
      "Developer",
      "storymode"
    ]);

    const SlashHelpMenuRow: ActionRowBuilder<any> =
      new ActionRowBuilder().addComponents([SlashHelpCategoryMenu]);

    const LegacyHelpMenuRow: ActionRowBuilder<any> =
      new ActionRowBuilder().addComponents([LegacyHelpCategoryMenu]);

    HelpMenuSlash.addFields(SlashHelpMenuFields);
    HelpMenuLegacy.addFields(LegacyHelpMenuFields);

    if (HelpType === "Slash")
      return interaction.reply({
        embeds: [HelpMenuSlash],
        components: [SlashHelpMenuRow]
      });

    if (HelpType === "Message")
      return interaction.reply({
        embeds: [HelpMenuLegacy],
        components: [LegacyHelpMenuRow]
      });
  }
}
