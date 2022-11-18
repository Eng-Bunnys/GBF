const SlashCommand = require("../../utils/slashCommands");

const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const title = require("../../gbfembedmessages.json");
const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

const timerSchema = require("../../schemas/GBF Schemas/timer schema");

const { msToTime } = require("../../utils/engine");

const fetch = require("node-fetch");

module.exports = class ClearCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "timer",
      category: "Developer",
      description: "Timer haha",
      usage: "/timer",
      examples: "/timer",

      devOnly: false,
      userPermission: ["MANAGE_MESSAGES"],
      botPermission: [],
      cooldown: 0,
      development: true,
      Partner: false
    });
  }

  async execute({ client, interaction }) {

    if (interaction.user.id !== '333644367539470337') return interaction.reply({
      content: `Fuck off will you`,
      ephemeral: true
    })

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
        .setEmoji("🕛"),
      new MessageButton()
        .setCustomId("devTimer")
        .setLabel("End timer")
        .setStyle("SECONDARY")
        .setEmoji("🕛")
    ]);

    const updatedUserData = msToTime(
      (userData.timeSpent * 1000) / userData.numberOfStarts
    );

    let goofyAdvice;

    await fetch(`https://luminabot.xyz/api/json/advice`)
      .then((response) => response.json())
      .then((data) => {
        goofyAdvice = `Goofy Advice: ${data.advice}`;
      });

    const timerStart = new MessageEmbed()
      .setTitle(`⏰ Timer started`)
      .setColor(colours.DEFAULT)
      .setDescription(
        `Average session time: ${updatedUserData}\nNumber of sessions: ${userData.numberOfStarts}\n\n${goofyAdvice}`
      )
      .setFooter({
        text: `Best of luck!`
      });

    await interaction.reply({
      embeds: [timerStart],
      components: [timerButtonA]
    });
  }
};
