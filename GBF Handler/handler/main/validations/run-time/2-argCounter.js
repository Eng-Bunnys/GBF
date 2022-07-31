const errMsgs = require("../../../../settings/errorMessages.json");
module.exports = (command, usage, prefix) => {
  const {
    minArgs = 0,
    maxArgs = -1,
    correctSyntax,
    expectedArgs = "",
  } = command.commandObject;
  const { length } = usage.args;
  const { message, interaction } = usage;

  if (length < minArgs) {
    const lowerText = `${errMsgs.MIN_ARGS.replace("{ArgCount}", minArgs)
    .replace(
      "{Syntax}",
      correctSyntax.replace("{PREFIX}", prefix).replace("{ARGS}", expectedArgs)
    )}`;

    if (message)
      message.reply({
        content: lowerText,
      });
    else if (interaction)
      interaction.reply({
        content: lowerText,
        ephemeral: true,
      });

    return false;
  }

  if (length > maxArgs && maxArgs !== -1) {
    const higherText = `${errMsgs.MAX_ARGS.replace("{ArgCount}", maxArgs)
    .replace(
      "{Syntax}",
      correctSyntax.replace("{PREFIX}", prefix).replace("{ARGS}", expectedArgs)
    )}`;

    if (message)
      message.reply({
        content: higherText,
      });
    else if (interaction)
      interaction.reply({
        content: higherText,
        ephemeral: true,
      });

    return false;
  }
  return true;
};
