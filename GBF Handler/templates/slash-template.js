const SlashCommand = require("../utils/slashCommands"); //Import the handler

const {
  ApplicationCommandOptionType,
  PermissionFlagsBits
} = require("discord.js"); //Common requirements from Discord.JS

module.exports = class Name extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "name", //The command name, can't have upper case chars or spaces [Required]
      category: "category", //Command categroy for help menu [Optional]
      description: "description", // The command description [Required]
      usage: "usage", // Usage & Example for help menu [Optional]
      examples: "example",
      // Command options for slash commands
      options: [
        {
          name: "text", //Same rules as command name [Required]
          description: "Hello World", // Option description [Required]
          type: ApplicationCommandOptionType.String, // Option type [Required]
          required: true // Force the user to provide this argument [Default: false] 
        }
      ],

      devOnly: true, //Only devs can use this command, specify devs in the config
      devBypass: true, //Allow devs to bypass the command cooldown
      userPermission: [], //Permissions required for the user
      botPermission: [], //Permissions required for the bot
      cooldown: 0, //Command cooldown in seconds
      development: true, //If this command is a test server only command
      Partner: true //Allow only partners to use this command
    });
  }

  async execute({ client, interaction }) {}
};
