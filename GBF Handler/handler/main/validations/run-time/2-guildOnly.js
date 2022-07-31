module.exports = (command, usage) => {
  const { guildOnly } = command.commandObject;
  const { guild, message, interaction } = usage;

  if (guildOnly === true && !guild) {
    const errorMessage = `This command can only be ran in a server.`;

    if (message)
      message.reply({
        content: errorMessage,
      });
    else if (interaction)
      interaction.reply({
        content: errorMessage,
        ephemeral: true,
      });
    return false;
  }
  return true;
};
