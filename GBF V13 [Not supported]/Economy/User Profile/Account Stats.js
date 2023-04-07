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
  abbreviateNumber,
  RPRequiredToLevelUp,
  achievementCompletion,
  percentageCompleteTillNextRank
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
                `**Wallet:** \`₲${userData.wallet.toLocaleString()}\`\n**Bank:** \`₲${userData.bank.toLocaleString()}\`\n**Net Worth:** \`₲${userData.netWorth.toLocaleString()}\``
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
              "100Streak": `${emojis["100Badge"]}`,
              "Rank100": "💯",
              "MaxRank": `${emojis.MaxRank}`
            };
            const badges =
              userData.badges.map((flag) => profileBadges[flag]).join(" ") ||
              "None";

            const cashStats = `**Wallet:** \`₲ ${abbreviateNumber(
              userData.wallet,
              2,
              false,
              false
            )}\`\n**Bank:** \`₲ ${abbreviateNumber(
              userData.bank,
              2,
              false,
              false
            )}\`\n**Combined:** \`₲ ${abbreviateNumber(
              userData.wallet + userData.bank,
              2,
              false,
              false
            )}\`\n**Net Worth:** \`₲ ${abbreviateNumber(
              userData.netWorth,
              3,
              false,
              false
            )}\`\n**Total Earned:** \`₲ ${abbreviateNumber(
              userData.totalEarned,
              3,
              false,
              false
            )}\``;

            function casinoWinrate(wins, losses) {
              let totalPlayed = wins + losses;
              if (totalPlayed === 0) return 0;
              return ((wins / totalPlayed) * 100).toFixed(1);
            }

            const casinoStats = `**Games Won:** \`${abbreviateNumber(
              userData.casinoWins,
              2,
              false,
              false
            )}\`\n**Games Lost:** \`${abbreviateNumber(
              userData.casinoLosses,
              2,
              false,
              false
            )}\`\n**WinRate:** \`${casinoWinrate(
              userData.casinoWins,
              userData.casinoLosses
            )}%\`\n**Winnings:** \`₲ ${abbreviateNumber(
              userData.casinoCashWin,
              2,
              false,
              false
            )}\`\n**Total Bet:** \`₲ ${abbreviateNumber(
              userData.casinoBet,
              2,
              false,
              false
            )}\``;

            let rankStats = `**Rank:** \`${userData.rank.toLocaleString()}\`\n**RP:** \`${abbreviateNumber(
              userData.RP,
              2,
              false,
              false
            )}\`\n**Total RP Earned:** \`${abbreviateNumber(
              userData.totalRPEarned,
              2,
              false,
              false
            )}\``;

            if (userData.rank === 5000)
              rankStats += `\n**Max rank obtained:** \`[5,000]\``;
            else
              rankStats += `\n**Rank ${(
                userData.rank + 1
              ).toLocaleString()}:** \`${abbreviateNumber(
                userData.RP,
                3,
                false,
                false
              )} / ${abbreviateNumber(
                RPRequiredToLevelUp(userData.rank, userData.RP),
                3,
                false,
                false
              )} [${percentageCompleteTillNextRank(
                userData.rank + 1,
                userData.RP
              )}%]\``;

            const firstPage = new MessageEmbed()
              .setTitle(`${targetUser.username}'s DunkelLuz profile`)
              .setColor(colours.DEFAULT)
              .setDescription(`Badges: ${badges}`)
              .addFields(
                {
                  name: "💰 Cash:",
                  value: `${cashStats}`,
                  inline: true
                },
                {
                  name: "📩 Rank:",
                  value: `${rankStats}`,
                  inline: true
                },
                {
                  name: "🎰 Casino:",
                  value: `${casinoStats}`,
                  inline: true
                }
              )
              .setFooter({
                text: `The city of saints and sinners || DunkelLuz`
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
