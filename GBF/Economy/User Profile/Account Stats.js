const SlashCommand = require("../../../utils/slashCommands");

const colours = require("../../../GBFColor.json");
const emojis = require("../../../GBFEmojis.json");
const title = require("../../../gbfembedmessages.json");

const userSchema = require("../../../schemas/Economy Schemas/User Profile Schema");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

const { delay } = require("../../../utils/engine");

const {
  accountRequired,
  incompleteTutorial,
  targetNoAccount,
  targetNoTutorial,
  DailyMoney,
  DailyRP,
  checkRank
} = require("../../../utils/DunkelLuzEngine");

module.exports = class DunkelLuzProfileCommands extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "profile",
      description: "Check out your other's profiles",
      category: "",
      userPermission: [],
      botPermission: [],
      cooldown: 2,
      development: true,
      subcommands: {
        balance: {
          description: "Check your DunkelLuz bank balance",
          execute: async ({ client, interaction }) => {
            const userData = await userSchema.findOne({
              userId: interaction.user.id
            });

            if (!userData)
              return interaction.reply({
                embeds: [accountRequired],
                ephemeral: true
              });

            if (!userData.introComplete)
              return interaction.reply({
                embeds: [incompleteTutorial],
                ephemeral: true
              });

            const bankBalance = new MessageEmbed()
              .setTitle(`${interaction.user.username}'s DunkelLuz bank balance`)
              .setColor(colours.DEFAULT)
              .setDescription(
                `**Wallet:** ₲ ${userData.wallet.toLocaleString()}\n**Bank:** ₲ ${userData.bank.toLocaleString()}\n**Net Worth:** ₲ ${userData.netWorth.toLocaleString()}`
              );

            return interaction.reply({
              embeds: [bankBalance]
            });
          }
        },
        stats: {
          description: "Check your or a user's DunkelLuz game stats",
          args: [
            {
              name: "user",
              description: "The user's stats that you want to check",
              type: "USER"
            }
          ],
          execute: async ({ client, interaction }) => {
            const targetUser =
              interaction.options.getUser("user") || interaction.user;

            const userData = await userSchema.findOne({
              userId: targetUser.id
            });

            if (!userData)
              return interaction.reply({
                embeds: [targetNoAccount],
                ephemeral: true
              });

            if (!userData.introComplete)
              return interaction.reply({
                embeds: [targetNoTutorial],
                ephemeral: true
              });

            const userPrivateProfile = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't use that`)
              .setColor(colours.ERRORRED)
              .setDescription(`The specified user's profile is private.`);

            if (
              targetUser.id !== interaction.user.id &&
              userData.privateProfile
            )
              return interaction.reply({
                embeds: [userPrivateProfile],
                ephemeral: true
              });

            const profileBadges = {
              "": "None",
              "100Streak": `${emojis["100Badge"]}`
            };
            const badges =
              userData.badges.map((flag) => profileBadges[flag]).join(" ") ||
              "None";

            const firstPage = new MessageEmbed()
              .setTitle(`${targetUser.username}'s DunkelLuz profile`)
              .setColor(colours.DEFAULT)
              .setDescription(`Badges: ${badges}`)
              .addFields({
                name: "💰 Cash:",
                value: `**Wallet:** \`₲ ${userData.wallet.toLocaleString()}\`\n**Bank:** \`₲ ${userData.bank.toLocaleString()}\`\n**Combined:** \`₲ ${(
                  userData.bank + userData.wallet
                ).toLocaleString()}\`\n**Net Worth:** \`₲ ${userData.netWorth.toLocaleString()}\`\n**Total Earned:** \`₲ ${userData.totalEarned.toLocaleString()}\``
              })
              .setTimestamp();

            return interaction.reply({
              embeds: [firstPage]
            });
          }
        }
      }
    });
  }
};
