const SlashCommand = require("../../utils/slashCommands");

const colors = require("../../GBF/GBFColor.json");
const emojis = require("../../GBF/GBFEmojis.json");

const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = class ClearCommand extends SlashCommand {
  constructor(client) {
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
      botPermission: [],
      cooldown: 0,
      development: false,
      Partner: false
    });
  }

  async execute({ client, interaction }) {
    const count = interaction.options.getInteger("amount");

    const messagesToBeDeleted = await interaction.channel.messages.fetch({
      limit: count
    });

    await interaction.channel.bulkDelete(messagesToBeDeleted, true);

    const successEmbed = new EmbedBuilder()
      .setTitle(`${emojis.VERIFY} Success!`)
      .setColor(colors.DEFAULT)
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
