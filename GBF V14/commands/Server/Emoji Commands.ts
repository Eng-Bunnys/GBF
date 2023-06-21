import SlashCommand from "../../utils/slashCommands";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ColorResolvable,
  CommandInteractionOptionResolver,
  GuildEmoji,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

import GBFClient from "../../handler/clienthandler";

export default class EmojiCommands extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "emoji",
      description: "Emoji related commands",
      category: "Emoji",
      userPermission: [],
      botPermission: [],
      cooldown: 2,
      development: true,
      subcommands: {
        info: {
          description: "Get information about an emoji!",
          args: [
            {
              name: "emoji",
              description: "The emoji that you want to get information about",
              type: ApplicationCommandOptionType.String,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const UserInput = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("emoji");

            function EmojiCheck(str: String): GuildEmoji {
              return interaction.guild.emojis.cache.find(
                (emoji) =>
                  emoji.name.toLowerCase() === str.toLowerCase() ||
                  emoji.id === str ||
                  emoji.toString() === str.replace(/([^\d])+/gim, "") ||
                  str.toLowerCase().includes(emoji.name.toLowerCase()) ||
                  str.includes(emoji.id)
              );
            }

            const UserArgs = UserInput.split(" ");

            const InputtedEmojis: GuildEmoji[] = [];

            for (const Arg of UserArgs) {
              const CurrentArgCheck = EmojiCheck(Arg);

              if (CurrentArgCheck) InputtedEmojis.push(CurrentArgCheck);
            }

            const EmojiInfo = new EmbedBuilder().setColor(
              colors.DEFAULT as ColorResolvable
            );

            if (InputtedEmojis.length) {
              const EmojiName = InputtedEmojis[0].name;
              const EmojiID = InputtedEmojis[0].id;
              const EmojiMention = InputtedEmojis[0].animated
                ? `<a:${EmojiName}:${EmojiID}>`
                : `<:${EmojiName}:${EmojiID}>`;

              const EmojiDiscordLink = `https://cdn.discordapp.com/emojis/${EmojiID}`;

              const EmojiAnimated = InputtedEmojis[0].animated
                ? "Animated"
                : "Static";
              const EmojiLink = InputtedEmojis[0].animated
                ? EmojiDiscordLink + `.gif`
                : EmojiDiscordLink + ".png";

              EmojiInfo.addFields(
                {
                  name: "Emoji",
                  value: `${InputtedEmojis[0]}`
                },
                {
                  name: "Mention",
                  value: `\`${EmojiMention}\``
                },
                {
                  name: "Name",
                  value: `${EmojiName}`,
                  inline: true
                },
                {
                  name: "ID",
                  value: `${EmojiID}`,
                  inline: true
                },
                {
                  name: "Type",
                  value: `${EmojiAnimated}`
                }
              ).setThumbnail(EmojiLink);

              const EmojiButton: ActionRowBuilder<any> =
                new ActionRowBuilder().addComponents([
                  new ButtonBuilder()
                    .setURL(EmojiLink)
                    .setLabel(EmojiName)
                    .setStyle(ButtonStyle.Link)
                ]);

              return interaction.reply({
                embeds: [EmojiInfo],
                components: [EmojiButton]
              });
            } else
              return interaction.reply({
                content: `Please provide a valid emoji from ${interaction.guild.name}`,
                ephemeral: true
              });
          }
        },
        emojify: {
          description: "Change text to emojis!",
          args: [
            {
              name: "text",
              description: "The text that you want to emojify",
              type: ApplicationCommandOptionType.String,
              maxLength: 2000 / ":grey_exclamation:".length,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const UserInput = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("text");

            const numbers: Record<string, string> = {
              " ": "   ",
              "0": ":zero:",
              "1": ":one:",
              "2": ":two:",
              "3": ":three:",
              "4": ":four:",
              "5": ":five:",
              "6": ":six:",
              "7": ":seven:",
              "8": ":eight:",
              "9": ":nine:",
              "!": ":grey_exclamation:",
              "?": ":grey_question:",
              "#": ":hash:",
              "*": ":asterisk:"
            };
            "abcdefghijklmnopqrstuvwxyz".split("").forEach((c) => {
              numbers[c] = numbers[
                c.toUpperCase()
              ] = `:regional_indicator_${c}:`;
            });

            return interaction.reply({
              content: UserInput.split("")
                .map((c) => numbers[c] || c)
                .join("")
            });
          }
        }
      }
    });
  }
}
