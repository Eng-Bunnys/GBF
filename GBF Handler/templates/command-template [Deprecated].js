const Command = require("../utils/command");

module.exports = class Template extends Command {
  constructor(client) {
    super(client, {
      name: "template",
      aliases: [],
      category: "Utility",
      description: "",
      usage: "",
      examples: "",
      cooldown: 0,
      userPermission: [],
      botPermission: [],
      devOnly: true,
      Partner: false,
      canNotDisable: false
    });
  }
  async execute({ client, message, args }) {}
};
