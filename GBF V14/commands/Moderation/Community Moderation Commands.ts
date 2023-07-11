import SlashCommand from "../../utils/slashCommands";
import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ColorResolvable,
  CommandInteractionOptionResolver
} from "discord.js";

import GBFClient from "../../handler/clienthandler";

export default class Tests extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "create",
      description: "Community commands",
      category: "",
      userPermission: [],
      botPermission: [],
      subcommands: {
        poll: {
          description: "Create a poll for users to vote on",
          args: [
            {
              name: "poll-question",
              description: "The topic of the poll",
              type: ApplicationCommandOptionType.String,
              required: true
            },
            {
              name: "option-one",
              description: "The first option for the poll",
              type: ApplicationCommandOptionType.String,
              required: true
            },
            {
              name: "option-two",
              description: "The second option for the poll",
              type: ApplicationCommandOptionType.String,
              required: true
            },
            {
              name: "option-three",
              description: "The third option for the poll",
              type: ApplicationCommandOptionType.String,
              required: false
            },
            {
              name: "option-four",
              description: "The fourth option for the poll",
              type: ApplicationCommandOptionType.String,
              required: false
            },
            {
              name: "image",
              description: "Add an image to the poll",
              type: ApplicationCommandOptionType.Attachment,
              required: false
            }
          ],
          execute: async ({ client, interaction }) => {
            const PollName = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("poll-question");
            const ChoiceOne = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("option-one");
            const ChoiceTwo = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("option-two");
            const ChoiceThree = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("option-three");
            const ChoiceFour = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("option-four");

            const ProvidedAttachment = (
              interaction.options as CommandInteractionOptionResolver
            ).getAttachment("image");

            const ChoicesValues = [ChoiceOne, ChoiceTwo];
            if (ChoiceThree) ChoicesValues.push(ChoiceThree);
            if (ChoiceFour) ChoicesValues.push(ChoiceFour);

            let ChosenImage = ``;

            const WrongImageType = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `The file provided is not a correct image file with the correct extension\nSupported extensions: \`png\` and \`jpg\``
              )
              .setColor(colors.ERRORRED as ColorResolvable)
              .setTimestamp();

            if (ProvidedAttachment) {
              const imageRegex = /^image\/(bmp|gif|jpeg|jpg|png|tiff)$/i;

              if (!imageRegex.test(ProvidedAttachment.contentType))
                return interaction.reply({
                  embeds: [WrongImageType],
                  ephemeral: true
                });

              if (!imageRegex.test(ProvidedAttachment.contentType)) {
                return interaction.reply({
                  embeds: [WrongImageType],
                  ephemeral: true
                });
              }

              ChosenImage = ProvidedAttachment.url;
            }

            const PollEmbed = new EmbedBuilder()
              .setAuthor({
                name: `${interaction.guild.name} poll`
              })
              .setColor(colors.DEFAULT as ColorResolvable)
              .setTitle(PollName)
              .setDescription(`Use the buttons below to vote on the poll`);

            for (let i = 0; i < ChoicesValues.length; i++) {
              PollEmbed.addFields({
                name: `Choice ${i + 1}:`,
                value: `${ChoicesValues[i]}`
              });
            }

            return interaction.reply({
              embeds: [PollEmbed]
            });
          }
        },
        embed: {
          description: "Create an embed",
          args: [
            {
              name: "author",
              description: "The author of the embed",
              type: ApplicationCommandOptionType.String
            },
            {
              name: "title",
              description: "The title of the embed",
              type: ApplicationCommandOptionType.String
            },
            {
              name: "description",
              description: "The description of the embed",
              type: ApplicationCommandOptionType.String
            },
            {
              name: "color",
              description: "The color of the embed [Default for default color]",
              type: ApplicationCommandOptionType.String
            },
            {
              name: "footer",
              description: "The footer of the embed",
              type: ApplicationCommandOptionType.String
            },
            {
              name: "timestamp",
              description: "Add a timestamp to the embed",
              type: ApplicationCommandOptionType.Boolean
            }
          ],
          execute: async ({ client, interaction }) => {
            const EmbedAuthor = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("author");
            const EmbedTitle = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("title");
            const EmbedDescription = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("description");
            let EmbedColor = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("color");
            const EmbedFooter = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("footer");
            const EmbedTimestamp = (
              interaction.options as CommandInteractionOptionResolver
            ).getBoolean("timestamp");

            const IncompleteEmbed = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `You need to have atleast one of these values set: \`Title\`, \`Description\`, \`Footer\` or \`Author\``
              )
              .setColor(colors.ERRORRED as ColorResolvable);

            const colorCodeRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

            const InvalidColor = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(
                `You can only enter colors in hexadecimal format\nEG.\`#00FF00\` (# must be included) || [Click me](${`https://htmlcolorcodes.com/`}) to check out color codes`
              )
              .setColor(colors.ERRORRED as ColorResolvable);

            if (EmbedColor.toLocaleLowerCase().includes("default"))
              EmbedColor = colors.DEFAULT;

            if (EmbedColor && !EmbedColor.includes("#")) EmbedColor += `#`;

            if (EmbedColor && !colorCodeRegex.test(EmbedColor)) {
              return interaction.reply({
                embeds: [InvalidColor],
                ephemeral: true
              });
            }

            if (
              !EmbedTitle &&
              !EmbedDescription &&
              !EmbedFooter &&
              !EmbedAuthor
            )
              return interaction.reply({
                embeds: [IncompleteEmbed],
                ephemeral: true
              });

            const CustomEmbed = new EmbedBuilder();

            if (EmbedAuthor)
              CustomEmbed.setAuthor({
                name: EmbedAuthor
              });
            if (EmbedTitle) CustomEmbed.setTitle(EmbedTitle);
            if (EmbedDescription) CustomEmbed.setDescription(EmbedDescription);
            if (EmbedColor) CustomEmbed.setColor(EmbedColor as ColorResolvable);
            if (EmbedFooter)
              CustomEmbed.setFooter({
                text: EmbedFooter
              });
            if (EmbedTimestamp === true) CustomEmbed.setTimestamp();

            return interaction.reply({
              embeds: [CustomEmbed]
            });
          }
        }
      }
    });
  }
}
