module.exports = (command) => {
  console.log(`Checking if test servers have been set`);
  const { instance, commandName, commandObject } = command;

  if (commandObject.testOnly !== true || instance.testServers.length) return;

  throw new Error(
    `The command "${commandName}" is has been set to test only, but there are no test servers set.`
  )
}
