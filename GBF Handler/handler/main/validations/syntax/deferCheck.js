module.exports = (command) => {
  const { deferReply } = command.commandObject;

  if (typeof deferReply !== "boolean" && deferReply !== "ephemeral")
    throw new Error(
      `The commnad "${command.commandName}" has an invalid value for "deferReply, must be a boolean value or the string "ephemeral"`
    );
};
