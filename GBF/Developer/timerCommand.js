const SlashCommand = require("../../utils/slashCommands");

const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const title = require("../../gbfembedmessages.json");
const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

const timerSchema = require("../../schemas/GBF Schemas/timer schema");

const { msToTime } = require("../../utils/engine");

module.exports = class ClearCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "timer",
      category: "Developer",
      description: "Timer haha",
      usage: "/timer",
      examples: "/timer",

      devOnly: true,
      userPermission: ["MANAGE_MESSAGES"],
      botPermission: [],
      cooldown: 0,
      development: true,
      Partner: false
    });
  }

  async execute({ client, interaction }) {
    const userData = await timerSchema.findOne({
      userID: interaction.user.id
    });

    if (!userData) {
      const newData = new timerSchema({
        userID: interaction.user.id
      });
      await newData.save();
      return interaction.reply({
        content: `Please re-run the program`,
        ephemeral: true
      });
    }

    const timerButtonA = new MessageActionRow().addComponents([
      new MessageButton()
        .setCustomId("devTimerA")
        .setLabel("Start timer")
        .setStyle("SECONDARY")
        .setEmoji("🕛")
    ]);

    const timerButton = new MessageActionRow().addComponents([
      new MessageButton()
        .setCustomId("devTimer")
        .setLabel("End timer")
        .setStyle("SECONDARY")
        .setEmoji("🕛")
    ]);

    const updatedUserData = msToTime(
      (userData.timeSpent * 1000) / userData.numberOfStarts
    );

    const timerStart = new MessageEmbed()
      .setTitle(`⏰ Timer started`)
      .setColor(colours.DEFAULT)
      .setDescription(
        `Average session time: ${updatedUserData}\nNumber of sessions: ${userData.numberOfStarts}`
      )
      .setFooter({
        text: `Best of luck! Remember why you're doing this.`
      });

    await interaction.reply({
      embeds: [timerStart],
      components: [timerButtonA, timerButton]
    });
  }
};
