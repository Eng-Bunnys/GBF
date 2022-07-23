module.exports = (command) => {
  const { commandName, commandObject } = command;

  if (!commandObject.callback)
    throw new Error(`A callback function is required to run the command "${commandName}"`);
};
