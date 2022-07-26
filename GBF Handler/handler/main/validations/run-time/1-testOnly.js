module.exports = (command, usage, prefix) => {
  console.log(`Checking if the command is ran in a guild`);
  const { instance, commandObject } = command;
  const { guild } = usage;

  if (commandObject.testOnly !== true) return true;

  return instance.testServers.includes(guild?.id);
};
