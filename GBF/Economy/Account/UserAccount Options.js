const {
  Constants,
  MessageEmbed,
  MessageActionRow,
  MessageButton
} = require("discord.js");
const SlashCommand = require("../utils/slashCommands");

const userDataSchema = require("../../../schemas/Economy Schemas/User Profile Schema");

const {
  accountRequired,
  incompleteTutorial,
  checkRank,
  guessReward,
  slotMachine,
  abbreviateNumber,
  horseRacing
} = require("../../../utils/DunkelLuzEngine");

const colours = require("../../../GBFColor.json");
const emojis = require("../../../GBFEmojis.json");
const title = require("../../../gbfembedmessages.json");

module.exports = class Tests extends SlashCommand {
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
          description: "Log into your DunkeLuz GBF account or create one!",
          args: [
            {
              name: "username",
              description: "The account's username [case-insensitive]",
              type: Constants.ApplicationCommandOptionTypes.STRING,
              maxLength: 16,
              minLength: 6,
              required: true
            },
            {
              name: "password",
              description: "Your account's password [case-sensitive]",
              type: Constants.ApplicationCommandOptionTypes.STRING,
              minLength: 8,
              maxLength: 32,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const accountName = interaction.options.getString("username");
            const accountPassword = interaction.options.getString("password");

            const userData = await userDataSchema.findOne({
              userNameInsensitive: accountName.toLowerCase(),
              accountPassword: accountPassword
            });

            if (userData) {
              const authorsAccount = await userDataSchema.findOne({
                userId: interaction.user.id
              });

              const safetyTips = [
                "Always keep your login details somewhere safe",
                `Never give your login details to anyone`,
                `Support will never ask you for your login details`
              ];

              const transferAccount = new MessageEmbed()
                .setTitle(`⚠️ Warning`)
                .setColor(colours.ERRORRED)
                .setDescription(
                  `By logging into ${userData.userName} ${authorsAccount?.userName} will be logged out and will have no active user.\n\nYou have 5 minutes to confirm.`
                )
                .setFooter({
                  text: `${
                    safetyTips[Math.floor(Math.random() * safetyTips.length)]
                  }`
                });

              const confirmTransferButtons =
                new MessageActionRow().addComponents([
                  new MessageButton()
                    .setStyle("DANGER")
                    .setCustomId("transferAccount")
                    .setLabel("Transfer account"),
                  new MessageButton()
                    .setCustomId("denyTransfer")
                    .setStyle("SUCCESS")
                    .setLabel("Deny transfer")
                ]);

              if (authorsAccount) {
                await interaction.reply({
                  embeds: [transferAccount],
                  components: [confirmTransferButtons],
                  ephemeral: true,
                  fetchReply: true
                });

                const filter = (i) => {
                  return i.user.id === interaction.user.id;
                };

                const collector =
                  interaction.channel.createMessageComponentCollector({
                    filter,
                    time: 300000
                  });

                collector.on("collect", async (i) => {

                    if (i.customId === 'transferAccount') {
                        //
                    }

                });
              }
            }
          }
        }
      }
    });
  }
};
