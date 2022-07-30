const errMsgs = require("../../../../settings/errorMessages.json");
module.exports = (command, usage, prefix) => {
  const { minArgs = 0, maxArgs = -1, correctSyntax } = command.commandObject;
  const { length } = usage.args;

  if (length < minArgs) {
    usage.message.reply({
      content: `${errMsgs.MIN_ARGS.replace("{ArgCount}", minArgs).replace(
        "{Syntax}",
        correctSyntax.replace("{PREFIX}", prefix)
      )}`,
    });
    return false;
  }

  if (length > maxArgs && maxArgs !== -1) {
    usage.message.reply({
      content: `${errMsgs.MAX_ARGS.replace("{ArgCount}", maxArgs).replace(
        "{Syntax}",
        correctSyntax.replace("{PREFIX}", prefix)
      )}`,
    });
    return false;
  }
  return true;
};
