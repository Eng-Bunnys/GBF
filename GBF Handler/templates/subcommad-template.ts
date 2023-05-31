import GBFClient from "../handler/clienthandler";
import SlashCommand from "../utils/slashCommands";

import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";

interface IExecute {
  client: GBFClient;
  interaction: CommandInteraction;
}

export default class Tests extends SlashCommand {
  constructor(client: GBFClient) {
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
