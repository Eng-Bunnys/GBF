import GBFClient from "../handler/clienthandler";
import SlashCommand from "../utils/slashCommands";

import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";

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
