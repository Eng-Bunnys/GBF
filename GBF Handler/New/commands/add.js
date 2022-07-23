module.exports = {
  minArgs: 2, //def: 0
  maxArgs: 3, //def: no limit -1
  callback: ({ message, args }) => {
    let sum = 0;

    for (const arg of args) sum += parseInt(arg);

    return message.reply({
      content: `The sum is ${sum}`,
    });
  },
};
