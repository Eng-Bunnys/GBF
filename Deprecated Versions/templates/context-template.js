import SlashCommand from "../utils/slashCommands";

const { ApplicationCommandType } = require("discord.js");

export default class Name extends SlashCommand {
  constructor(client) {
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

  async execute({ client, interaction }) {}
}