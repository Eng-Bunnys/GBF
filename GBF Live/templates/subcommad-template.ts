import GBFClient from "../handler/clienthandler";
import SlashCommand from "../utils/slashCommands";

import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  CommandInteraction
} from "discord.js";

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
          execute: async ({ client, interaction }: IExecute) => {
            return interaction.reply({
              content: `Test`
            });
          }
        }
      }
    });
  }
}
