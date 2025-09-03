import SlashCommand from "../utils/slashCommands";

const {
  ApplicationCommandOptionType,
  ApplicationCommandType
} = require("discord.js");

export default class Tests extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "",
      description: "",
      category: "",
      userPermission: [],
      botPermission: [],
      cooldown: 2,
      development: true,
      type: ApplicationCommandType.ChatInput,
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
          execute: async ({ client, interaction }) => {
            return interaction.reply({
              content: `Test`
            });
          }
        }
      }
    });
  }
}