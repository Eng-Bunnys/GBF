const { MessageEmbed, Permissions } = require("discord.js");

const colours = require("../GBFColor.json");

const { greenBright, redBright } = require("chalk");

const timerSchema = require("../schemas/GBF Schemas/timer schema");

const { msToTime } = require("../utils/engine");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      if (
        interaction.customId === "devTimerA" &&
        interaction.user.id === "333644367539470337"
      ) {
        const timerData = await timerSchema.findOne({
          userID: interaction.user.id
        });
        if (!timerData) {
          const newData = new timerSchema({
            userID: interaction.user.id,
            intiationTime: new Date(Date.now())
          });
          await newData.save();
        } else {
          await timerData.updateOne({
            intiationTime: new Date(Date.now())
          });
        }
        await interaction.channel.send({
          content: `Timer started`
        });
      } else if (
        interaction.customId === "devTimer" &&
        interaction.user.id === "333644367539470337"
      ) {
        const timerData = await timerSchema.findOne({
          userID: interaction.user.id
        });

        if (!timerData || timerData.intiationTime === null) {
          return interaction.channel.send({
            content: `There's no previous recorded start time.`
          });
        }

        const startedAtUNIX = timerData.intiationTime.getTime();

        const timeElapsed = (Date.now() - startedAtUNIX) / 1000;

        const averageInMS =
          timerData.timeSpent * 1000 +
          (timeElapsed * 1000) / timerData.numberOfStarts +
          1;

        const updatedUserData = msToTime(averageInMS);

        const sessionDetails = new MessageEmbed()
          .setTitle(`🕛 Timer Stopped`)
          .setColor(colours.DEFAULT)
          .setDescription(
            `Time spent:\n${msToTime(
              timeElapsed * 1000
            )}\n\nAverage session time: ${updatedUserData}`
          )
          .setTimestamp();

        await interaction.reply({
          embeds: [sessionDetails],
          components: []
        });

        return timerData.updateOne({
          intiationTime: null,
          numberOfStarts: timerData.numberOfStarts + 1,
          timeSpent: Math.round(timerData.timeSpent + timeElapsed)
        });
      }
    }
  });
};
