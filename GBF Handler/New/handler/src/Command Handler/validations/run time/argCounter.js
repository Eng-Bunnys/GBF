const errMessages = require("../../../../../settings/errorMessages.json");
module.exports = (command, usage, prefix) => {
  const { minArgs = 0, maxArgs = -1, correctSyntax } = command.commandObject;
  const { length } = usage.args;

  if (length < minArgs) {
    usage.message.reply({
      content: `${errMessages.MIN_ARGS.replace("{ARG}", minArgs).replace(
        "{SYNTAX}",
        correctSyntax.replace("{PREFIX}", prefix)
      )}`,
    });
    return false;
  }

  if (length > maxArgs && maxArgs !== -1) {
    usage.message.reply({
      content: `${errMessages.MAX_ARGS.replace("{ARG}", minArgs).replace(
        "{SYNTAX}",
        correctSyntax.replace("{PREFIX}", prefix)
      )}`,
    });
    return false;
  }

  return true;
};
