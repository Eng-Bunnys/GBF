import SlashCommand from "../../utils/slashCommands";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder,
  Client,
  ColorResolvable
} from "discord.js";

module.exports = class ClearCommand extends SlashCommand {
  constructor(client: Client) {
    super(client, {
      name: "clear",
      description: "Delete a number of messages",

      options: [
        {
          name: "amount",
          description: "The number of messages that you want to delete",
          type: ApplicationCommandOptionType.Integer,
          minValue: 1,
          maxValue: 100,
          required: true
        }
      ],

      devOnly: false,
      userPermission: [PermissionFlagsBits.ManageMessages],
      botPermission: [PermissionFlagsBits.ManageMessages],
      cooldown: 4,
      devBypass: true,
      development: false,
      Partner: false
    });
  }

  async execute({ client, interaction }) {
    const count = interaction.options.getInteger("amount", true);

    const messagesToBeDeleted = await interaction.channel.messages.fetch({
      limit: count
    });

    await interaction.channel.bulkDelete(messagesToBeDeleted, true);

    const successEmbed = new EmbedBuilder()
      .setTitle(`${emojis.VERIFY} Success!`)
      .setColor(colors.DEFAULT as ColorResolvable)
      .setDescription(`Successfully deleted **${count}** messages`)
      .setFooter({
        text: `This message auto-deletes in 5 seconds`,
        iconURL: interaction.user.displayAvatarURL()
      });

    await interaction.reply({
      embeds: [successEmbed]
    });

    setTimeout(() => interaction.deleteReply(), 5000);
  }
};
