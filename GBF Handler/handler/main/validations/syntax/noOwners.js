module.exports = (command) => {
    const { instance, commandName, commandObject } = command;

    if (commandObject.devOnly !== true || instance.botOwners.length) return;
  
    throw new Error(
      `The command "${commandName}" has been set to owner only, but there are no owner IDs specified.`
    )
}
