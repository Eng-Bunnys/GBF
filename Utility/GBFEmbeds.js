const { MessageEmbed } = require("discord.js");
const colours = require('../GBFColor.json');

const ImageGenerating = new MessageEmbed()
  .setTitle(`Generating image... <a:Loading:971730094169141248>`)
  .setColor(colours.DEFAULT)
  .setDescription(
    `This may take up to 2 minutes (Average 10s) depending on quality and server load`
  )
  .setTimestamp();

module.exports = {
  ImageGenerating,
};
