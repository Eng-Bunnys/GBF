const SlashCommand = require("../utils/slashCommands");

const {
  ApplicationCommandOptionType,
  PermissionFlagsBits
} = require("discord.js");

module.exports = class Tests extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "command_name", //Main Command name
      description: "command_description", // Command description
      category: "command_category [For help menu]", //Categroy
      userPermission: [PermissionFlagsBits.Administrator], //The required user permissions to run this command
      botPermission: [PermissionFlagsBits.Administrator], //The required bot permissions to run this command
      cooldown: 2, //Cooldown in seconds
      development: true, //Test only or not
      subcommands: {
        comamndname: {
          // Actual command name
          description: "command_description",
          args: [
            {
              name: "test",
              description: "test",
              type: ApplicationCommandOptionType.String,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {}
        }
      }
    });
  }
};
