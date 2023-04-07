const SlashCommand = require("../utils/slashCommands");

module.exports = class Tests extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "",
      description: "",
      category: "",
      userPermission: [],
      botPermission: [""],
      cooldown: 2,
      development: true,
      subcommands: {
        comamndname: {
          description: "",
          args: [
            {
              name: "",
              description: "",
              type: "STRING/CHANNEL/ETC",
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {}
        },
        comamndname2: {
          description: "",
          args: [
            {
              name: "",
              description: "",
              type: "STRING/CHANNEL/ETC",
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {}
        }
      }
    });
  }
};
