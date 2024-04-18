import SlashCommand from "../../utils/slashCommands";
import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ColorResolvable,
  CommandInteractionOptionResolver,
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
        }
      }
    });
  }
}
