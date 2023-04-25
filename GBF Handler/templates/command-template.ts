import { PermissionFlagsBits } from "discord.js";
import Command from "../utils/command";

module.exports = class LegacyCommand extends Command {
  constructor(client) {
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
      canNotDisable: false
    });
  }
  async execute({ client, message, args }) {
    return message.reply({
      content: `Test`
    });
  }
};
