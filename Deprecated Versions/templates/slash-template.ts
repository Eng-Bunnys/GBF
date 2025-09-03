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

export default class Name extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "name",
      category: "category",
      description: "description",
      usage: "usage",
      examples: "example",
      type: ApplicationCommandType.ChatInput,

      options: [
        {
          name: "text",
          description: "Hello World",
          type: ApplicationCommandOptionType.String,
          required: true
        }
      ],

      devOnly: true,
      NSFW: false,
      devBypass: true,
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: true,
      dmEnabled: false,
      partner: true
    });
  }

  async execute({ client, interaction }: IExecute) {}
}
