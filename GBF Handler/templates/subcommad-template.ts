const SlashCommand = require("../utils/slashCommands").default;

import { ApplicationCommandOptionType, Client } from "discord.js";

export default class Tests extends SlashCommand {
  constructor(client: Client) {
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
}
