const SlashCommand = require("../../utils/slashCommands");

const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");
const title = require("../../gbfembedmessages.json");

const userSchema = require("../../schemas/Economy Schemas/User Profile Schema");
const { MessageEmbed } = require("discord.js");

module.exports = class DunkelLuzProfile extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "account",
      description: "Economy account related commands",
      category: "Economy",
      userPermission: [],
      botPermission: [],
      cooldown: 5,
      development: true,
      subcommands: {
        login: {
          description:
            "Login to an existing DunkelLuz account or register a new account",
          args: [
            {
              name: "username",
              description: "The username of your DunkelLuz account",
              type: "STRING",
              minLength: 2,
              maxLength: 16,
              required: true,
            },
            {
              name: "password",
              description: "The password of your DunkelLuz account",
              type: "STRING",
              minLength: 6,
              maxLength: 32,
              required: true,
            },
          ],
          execute: async ({ client, interaction }) => {
            const accountName = interaction.options.getString("username");
            const accountPassword = interaction.options.getString("password");

            const userData = await userSchema.findOne({
              userName: accountName,
              accountPassword: accountPassword,
            });

            const alreadyLoggedIn = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You cannot do that!`)
              .setDescription(`You're already logged into this account`)
              .setColor(colours.ERRORRED)
              .setTimestamp()
              .setFooter({
                text: `DunkelLuz`,
              });

            if (userData && userData.userId === interaction.user.id)
              return interaction.reply({
                embeds: [alreadyLoggedIn],
                ephemeral: true,
              });
          },
        },
      },
    });
  }
};
