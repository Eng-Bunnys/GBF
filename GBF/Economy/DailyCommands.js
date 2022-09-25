const SlashCommand = require("../../utils/slashCommands");

const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");
const title = require("../../gbfembedmessages.json");

const userSchema = require("../../schemas/Economy Schemas/User Profile Schema");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

const { delay } = require("../../utils/engine");

const {
  accountRequired,
  incompleteTutorial,
  DailyMoney,
  DailyRP,
  checkRank
} = require("../../utils/DunkelLuzEngine");

module.exports = class DailyCommands extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "daily",
      description: "DunkelLuz daily collectable commands",
      category: "Economy",
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: true,
      subcommands: {
        collect: {
          description: "Collect your DunkelLuz login daily reward",
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

            const CurrentStreak = userData.dailyStreak;

            const onCooldown = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You cannot use that yet`)
              .setDescription(
                `You have already collected your daily reward!\n\nYou can collect it again **<t:${Math.floor(
                  userData.dailyCooldown / 1000 + 86400
                )}:R>**\n\nCurrent streak: **${CurrentStreak.toLocaleString()} day(s) 🔥**`
              )
              .setColor(colours.ERRORRED)
              .setTimestamp();

            if (Date.parse(userData.dailyCooldown) + 86400000 > Date.now())
              return interaction.reply({
                embeds: [onCooldown],
                ephemeral: true
              });

            const next24Hours = Math.round(
              (Date.now() + 24 * 60 * 60 * 1000) / 1000
            );

            const lastCollected = Math.round(userData.dailyCooldown / 1000);

            const lostStreak = new MessageEmbed()
              .setTitle("Collected 💰")
              .setColor(colours.DEFAULT)
              .setDescription(
                `Looks like you failed to keep up the streak up 🙊\nLast time collected: <t:${lastCollected}:F>\nYour last streak was: ${CurrentStreak} day(s) 🔥\n\n• ₲300\n• 100 RP\n\nYou can collect your next daily: <t:${next24Hours}:F>`
              )
              .setFooter({
                text: `If you think there is a mistake please contact support (/bot invite) || The streak dies after 48 hours of not claiming your reward`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (Date.parse(userData.dailyCooldown) + 172800000 < Date.now()) {
              await userData.updateOne({
                dailyStreak: 1,
                bank: userData.bank + 300,
                netWorth: userData.netWorth + 300,
                totalEarned: userData.totalEarned + 300,
                RP: userData.RP + 100,
                totalRPEarned: userData.totalRPEarned + 100,
                dailyCooldown: new Date(Date.now())
              });

              if (checkRank(userData.rank, userData.RP + 100))
                await client.emit(
                  "playerLevelUp",
                  interaction,
                  interaction.user
                );

              return interaction.reply({
                embeds: [lostStreak]
              });
            }

            if (CurrentStreak + 1 === 100) {
              const achievementType = {
                type: "100Streak",
                hasBadge: true
              };
              await client.emit(
                "achievementComplete",
                interaction,
                interaction.user,
                achievementType
              );
            }

            const EarnedMoney = DailyMoney(CurrentStreak + 1);
            const EarnedRP = DailyRP(CurrentStreak + 1);

            const dailyCollected = new MessageEmbed()
              .setTitle("Collected 💰")
              .setColor(colours.DEFAULT)
              .setDescription(
                `**Collected your daily reward!**\n\n• ₲${EarnedMoney.toLocaleString()}\n• ${EarnedRP.toLocaleString()} RP\n• Daily Streak: ${(
                  CurrentStreak + 1
                ).toLocaleString()} day(s) 🔥\n\nYou can collect your next daily: <t:${next24Hours}:F>`
              )
              .setFooter({
                text: `Keep the streak up for better rewards! || The streak dies after 48 hours of not claiming your reward`,
                iconURL: interaction.user.displayAvatarURL()
              });

            await userData.updateOne({
              dailyStreak: userData.dailyStreak + 1,
              bank: userData.bank + EarnedMoney,
              netWorth: userData.netWorth + EarnedMoney,
              totalEarned: userData.totalEarned + EarnedMoney,
              RP: userData.RP + EarnedRP,
              totalRPEarned: userData.totalRPEarned + EarnedRP,
              dailyCooldown: new Date(Date.now())
            });

            if (checkRank(userData.rank, userData.RP + EarnedRP))
              await client.emit("playerLevelUp", interaction, interaction.user);

            return interaction.reply({
              embeds: [dailyCollected]
            });
          }
        }
      }
    });
  }
};
