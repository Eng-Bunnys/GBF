import Command from "../utils/command";

import { Client, Message } from "discord.js";

interface LegacyCommandExecute {
  client: Client;
  message: Message;
  args: [string];
}

export default class LegacyCommand extends Command {
  constructor(client: Client) {
    super(client, {
      name: "",
      aliases: [],
      category: "",
      description: "",
      usage: "",
      examples: "",
      cooldown: 0,
      userPermission: [],
      botPermission: [],
      devOnly: false,
      devBypass: false,
      partner: false,
      development: false,
      dmEnabled: false,
      canNotDisable: false
    });
  }
  async execute({ client, message, args }: LegacyCommandExecute) {
    return message.reply({
      content: `Test`
    });
  }
}
