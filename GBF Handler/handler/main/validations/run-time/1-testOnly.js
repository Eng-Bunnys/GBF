module.exports = (command, usage, prefix) => {
  const { instance, commandObject } = command;
  const { guild } = usage;

  if (commandObject.testOnly !== true) return true;

  return instance.testServers.includes(guild?.id);
};
