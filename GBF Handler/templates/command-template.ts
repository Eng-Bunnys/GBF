const Command = require("../utils/command").default;

import { Client } from "discord.js";

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
      Partner: false,
      development: false,
      dmEnabled: false,
      canNotDisable: false
    });
  }
  async execute({ client, message, args }) {
    return message.reply({
      content: `Test`
    });
  }
}
