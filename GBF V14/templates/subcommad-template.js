const SlashCommand = require("../utils/slashCommands");

const {
  ApplicationCommandOptionType,
  PermissionFlagsBits
} = require("discord.js");

module.exports = class Tests extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "",
      description: "",
      category: "",
      userPermission: [],
      botPermission: [],
      cooldown: 2,
      development: true,
      subcommands: {
        comamndname: {
          description: "",
          args: [
            {
              name: "",
              description: "",
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
