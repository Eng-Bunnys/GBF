module.exports = {
  name: "add",
  minArgs: 2, //default: 0
  maxArgs: 3, //default: -1 (infinite)
  correctSyntax: "Correct syntax: {PREFIX}add <num 1> <num 2> <etc>",

  testOnly: true, //boolean (default: false)

  callback: ({ message, args }) => {
    let sum = 0;

    for (const arg of args) sum += parseInt(arg);

    message.reply({
      content: `The sum is ${sum}`,
    });
  },
};
