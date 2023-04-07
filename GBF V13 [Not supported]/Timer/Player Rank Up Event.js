const { MessageEmbed } = require("discord.js");

const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

module.exports = (client) => {
  client.on(
    "playerLevelUp",
    async (interaction, data, type, extraLevels, remainingRP) => {
      console.log("testing");
    }
  );
};
