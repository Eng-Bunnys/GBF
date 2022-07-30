module.exports = {
  name: "add", //Will always be lowercase, this feature is here to avoid slash command errors
  description: "Adds two numbers together",
  type: "BOTH", //LEGACY, SLASH, BOTH
  minArgs: 2, //default: 0
  maxArgs: 3, //default: -1 (infinite)
  correctSyntax: "Correct syntax: {PREFIX}add <num 1> <num 2>",

  testOnly: true, //boolean (default: false) || development only
  disabled: false, //This will delete/disable the command if true (default: false) so it won't show in slash or legacy 

  callback: ({ interaction, message, args }) => {
    let sum = 0;

    for (const arg of args) sum += parseInt(arg);

    if (message) {
       message.reply({
          content: `Message: The sum is ${sum}`,
      })
    } else {
      interaction.reply({
          content: `Interaction: The sum is ${sum}`,
      })
    }

   // return `The sum is ${sum}`; //This makes it so the handler handles the return and we don't have to
   //check if it's a message or interaction, you don't even have to define them
  },
};
