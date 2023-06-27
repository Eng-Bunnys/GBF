import GBFClient from "../handler/clienthandler";
import SlashCommand from "../utils/slashCommands";

import {
  ApplicationCommandType,
  UserContextMenuCommandInteraction
} from "discord.js";

interface IExecute {
  client: GBFClient;
  interaction: UserContextMenuCommandInteraction;
}

export default class Name extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "name",
      category: "category",
      usage: "usage",
      examples: "example",
      type: ApplicationCommandType.User, //You can also use ApplicationCommandType.Message

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
