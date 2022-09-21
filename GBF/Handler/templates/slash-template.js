const SlashCommand = require('../utils/slashCommands');

module.exports = class Name extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "name",
      category: "category",
      description: "description",
      usage: "usage",
      examples: "example",

      options: [{
        name: "text",
        description: "Hello World",
        type: "STRING",
        required: true
      }],

      devOnly: true,
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: true,
      Partner: true,
    });
  }

  async execute({
    client,
    interaction
  }) {

  }
}
