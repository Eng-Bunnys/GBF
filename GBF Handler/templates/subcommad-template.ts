import SlashCommand from "../utils/slashCommands";

import {
  ApplicationCommandOptionType,
  Client,
  CommandInteraction
} from "discord.js";

interface IExecute {
  client: Client;
  interaction: CommandInteraction;
}

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
          execute: async ({ client, interaction }: IExecute) => {}
        }
      }
    });
  }
}
