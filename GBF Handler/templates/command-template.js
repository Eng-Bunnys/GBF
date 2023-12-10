const Command = require("../handler/commandhandler");

module.exports = class LegacyCommand extends Command {
  constructor(client) {
    super(client, {
      name: "template", // Command name
      aliases: [], // Command aliases
      category: "General", // Command category
      description: "A template command", // Command description
      NSFW: false, // Set to true if the command should only be used in NSFW channels
      usage: "!template", // Command usage
      examples: "!template", // Command examples
      cooldown: 0, // Command cooldown in seconds
      userPermission: [], // User permissions required to use the command
      botPermission: [], // Bot permissions required to execute the command
      devOnly: false, // Set to true if the command should only be available to developers
      devBypass: false, // Developers bypass the cooldown
      partner: false, // Set to true if the command should only be available to partners
      development: false, // Test Server Only command
      dmEnabled: false, // Set to true if the command can be used in DMs
    });
  }

  async execute({ client, message, args }) {}
};
