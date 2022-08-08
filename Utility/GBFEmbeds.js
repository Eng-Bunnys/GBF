const { MessageEmbed } = require("discord.js");
const colours = require("../GBFColor.json");

const ImageGenerating = new MessageEmbed()
  .setTitle(`Generating image... <a:Loading:971730094169141248>`)
  .setColor(colours.DEFAULT)
  .setDescription(
    `This may take up to 2 minutes (Average 10s) depending on quality and server load`
  )
  .setTimestamp();

const APIError = new MessageEmbed()
  .setTitle(titles.ERROR)
  .setDescription(
    `An error in the API occured, I've already reported it to my developers!\nPlease try again later.\n\nError:\`\`\`js\n${err}\`\`\``
  )
  .setColor(colours.ERRORRED)
  .addFields({
    name: "FYI:",
    value: `\`User aborted the request\` error just means that the bot is under load`,
  })
  .setFooter({
    text: `We apologize for the inconvenience`,
    iconURL: client.user.displayAvatarURL(),
  });

module.exports = {
  ImageGenerating,
  APIError,
};
