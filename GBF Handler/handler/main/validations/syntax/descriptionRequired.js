module.exports = (command) => {
  const { commandName, commandObject } = command;

  if (commandObject.slash === true || commandObject.slash === "both") {
    if (!commandObject.description)
      throw new Error(`The command "${commandName}" is missing a description`);
  }
};
