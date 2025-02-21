import GBFClient from "../handler/clienthandler";
import Command from "../utils/command";

import { Message } from "discord.js";

interface LegacyCommandExecute {
  client: GBFClient;
  message: Message;
  args: [string];
}

export default class LegacyCommand extends Command {
  constructor(client: GBFClient) {
    super(client, {
      name: "",
      aliases: [],
      category: "",
      description: "",
      NSFW: false,
      usage: "",
      examples: "",
      cooldown: 0,
      userPermission: [],
      botPermission: [],
      devOnly: false,
      devBypass: false,
      partner: false,
      development: false,
      dmEnabled: false
    });
  }
  async execute({ client, message, args }) {}
}
