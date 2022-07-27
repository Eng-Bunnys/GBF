module.exports = {
  name: "test", //Will always be lowercase, this feature is here to avoid slash command errors
  description: "Adds two numbers together", //Command description, required for slash commands
  type: "LEGACY", //LEGACY : Prefix Commands, SLASH : Slash Commands, BOTH : Both types
  minArgs: 2, //default: 0 [No support slash rn]
  maxArgs: 3, //default: -1 (infinite) [No support slash rn]
  correctSyntax: "Correct syntax: {PREFIX}add <num 1> <num 2> <etc>", //[No support slash rn]

  testOnly: true, //boolean (default: false)
  //We will change this to use interaction once a slash listener is made
  callback: ({ message, args }) => {
    let sum = 0;

    for (const arg of args) sum += parseInt(arg);

    message.reply({
      content: `The sum is ${sum}`,
    });
  },
};
