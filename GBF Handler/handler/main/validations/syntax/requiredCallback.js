module.exports = (command) => {
  console.log(`Checking callbacks`)
  const { commandObject, commandName } = command;

  if (!commandObject.callback)
    throw new Error(
      `A callback function is required to run the command "${commandName}".`
    );
};
