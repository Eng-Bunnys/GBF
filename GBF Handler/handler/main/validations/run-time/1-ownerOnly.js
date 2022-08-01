const { EmbedBuilder } = require('discord.js');
const titles = require('../../../../settings/GBFEmbedMessages.json');
const colours = require('../../../../settings/GBFColor.json');
module.exports = (command, usage) => {
  const { botOwners } = command.instance;
  const { devOnly } = command.commandObject;
  const { message, interaction, user } = usage;

  if (devOnly === true && !botOwners.includes(user.id)) {
    const devOnlyCommand = new EmbedBuilder()
    .setTitle(titles.USER_ERROR)
    .setColor(colours.ERRORRED)
    .setDescription(`The command "${command.commandName}" is a bot-owner only command.`)
    .setTimestamp()
    
    if (message) message.reply({ embeds: [devOnlyCommand] });
    else if (interaction) interaction.reply({ embeds: [devOnlyCommand], ephemeral: true });

    return false;
  }
  return true;
};
