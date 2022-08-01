const { ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: "add", //Will always be lowercase, this feature is here to avoid slash command errors
  aliases: ['calc'], //These are the names that will trigger the **legacy** command, if the name is too long the user can use whatever is inside of the aliases array and it will run the command like normal
  description: "Adds two numbers together!", //The command description, used for slash commands
  type: "BOTH", //LEGACY, SLASH, BOTH

  minArgs: 2, //default: 0
  maxArgs: 2, //default: -1 (infinite)

  correctSyntax: "Correct syntax: {PREFIX}add {ARGS}",
  //expectedArgs will create slash command options but they will be alot less descriptive than if you specified
  //with options as shown in line below, it is recommended to use options instead of expectedArgs
  //so this should only be used in small commands and will always be type: STRING
  expectedArgs: "<number> <number 2>", //Must be matching syntax of <> or [], will not work if <number] etc.
  //expectedArgs will look something like this:
  /*
  expectedArgs: '<option> <option 2>',
  what will be displayed: 
  name: 'option',
  description: option,
  type: STRING,
  required: option index < minArgs
  */

  //The options used in the **slash** command
  options: [
    {
      name: "first-number",
      description: "The first number to add",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
    {
      name: "second-number",
      description: "The second number to add",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],

  testOnly: false, //boolean (default: false) || development only, will only work in test servers
  devOnly: true, //boolean (default: false) || will only work with bot owners
  
  disabled: false, //This will delete/disable the command if true (default: false) so it won't show in slash or legacy

  //This will run the command once, good for API requests/fetching data from a DB, this will run the command once it registers 
  init: async (client, instance) => {
    console.log(`Hello World`);
  },

  callback: async ({ interaction, message, args }) => {
    let sum = 0;

    for (const arg of args) sum += parseInt(arg);

    if (message) {
      message.reply({
        content: `Message: The sum is ${sum}`,
      });
    } else {
      interaction.reply({
        content: `Interaction: The sum is ${sum}`,
      });
    }

    // return `The sum is ${sum}`; //This makes it so the handler handles the return and we don't have to
    //check if it's a message or interaction, you don't even have to define them
  },
};
