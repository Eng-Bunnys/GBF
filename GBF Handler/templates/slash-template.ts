const SlashCommand = require("../utils/slashCommands").default;

import {
  ApplicationCommandOptionType,
  Client,
  CommandInteraction
} from "discord.js";

interface IExecute {
  client: Client;
  interaction: CommandInteraction;
}

export default class Name extends SlashCommand {
  constructor(client: Client) {
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
      devBypass: true,
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: true,
      dmEnabled: false,
      Partner: true
    });
  }

  async execute({ client, interaction }: IExecute) {}
}
