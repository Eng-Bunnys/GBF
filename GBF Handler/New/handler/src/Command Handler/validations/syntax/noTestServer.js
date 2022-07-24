module.exports = (command) => {
  const { instance, commandName, commandObject } = command;

  if (commandObject.testOnly !== true || instance.testServers.length) return;

  throw new Error(`There are no test servers specified and the command "${commandName}" is a test only command.`);
};
