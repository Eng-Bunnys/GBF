const SlashCommand = require("../../utils/slashCommands");

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Constants
} = require("discord.js");

const title = require("../../gbfembedmessages.json");
const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

const userSchema = require("../../schemas/User Schemas/User Profile Schema");
const timerSchema = require("../../schemas/User Schemas/Timer Schema");

const {
  msToTime,
  chunkAverage,
  twentyFourToTwelve
} = require("../../utils/engine");

const {
  xpRequired,
  xpRequiredAccount,
  hoursRequired,
  loginReward,
  checkRank,
  checkRankAccount
} = require("../../utils/TimerLogic");

const fetch = require("node-fetch");

const next24Hours = Math.round((Date.now() + 24 * 60 * 60 * 1000) / 1000);

module.exports = class DailyClaim extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "daily",
      category: "Economy",
      description: "Login in daily to get cool free prizes",
      devOnly: true,
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: true
    });
  }

  async execute({ client, interaction }) {
    const userData = await userSchema.findOne({
      userID: interaction.user.id
    });

    const timerData = await timerSchema.findOne({
      userID: interaction.user.id
    });

    if (!userData) {
      const newAccount = new MessageEmbed()
        .setTitle(`Daily Collected ${emojis.MaxRank}`)
        .setColor(colours.DEFAULT)
        .setDescription(
          `Hey!\nThanks for logging in GBF today, as a thank you, you'll receive a reward based on the day of the week and your daily streak!\n\nI've given you an extra reward as a welcome gift 😉\n\n• 250 DunkelCoins ${emojis.dunkelCoin}\n• 5,000 Timer XP`
        )
        .setFooter({
          text: `A Timer Account is required to claim the 5,000 XP.`
        });

      const newUserProfile = new userSchema({
        userID: interaction.user.id,
        dailyCooldown: new Date(Date.now()),
        dailyStreak: 1,
        dunkelCoins: 750
      });

      if (timerData) {
        await timerData.updateOne({
          seasonXP: timerData.seasonXP + 5000,
          accountXP: timerData.accountXP + 5000
        });

        const rankUpSeason = checkRank(
          timerData.seasonLevel,
          timerData.seasonXP,
          timerData.seasonXP + 5000
        );

        const rankUpAccount = checkRankAccount(
          timerData.accountLevel,
          timerData.accountXP,
          timerData.accountXP + 5000
        );

        console.log(rankUpAccount);

        if (rankUpSeason[0]) {
          await client.emit(
            "playerLevelUp",
            interaction,
            timerData,
            "seasonLevel",
            rankUpSeason[1],
            rankUpSeason[2]
          );
        }

        if (rankUpAccount[0]) {
          await client.emit(
            "playerLevelUp",
            interaction,
            timerData,
            "accountLevel",
            rankUpAccount[1],
            rankUpAccount[2]
          );
        }
      } else {
        await newUserProfile.updateOne({
          extraTimerXP: 5000
        });
      }

      await newUserProfile.save();

      return interaction.reply({
        embeds: [newAccount]
      });
    }

    const currentStreak = userData.dailyStreak + 1;

    const lostStreak = new MessageEmbed()
      .setTitle(`Daily Collected 💰`)
      .setColor(colours.DEFAULT)
      .setDescription(
        `Collected your daily login reward [Day: ${
          loginReward()[0]
        } / 7]\n\n• ${
          loginReward()[1]
        } Timer XP\n\nYou failed to keep up the daily streak, your last streak was ${(
          currentStreak - 1
        ).toLocaleString()} days.\nYou can collect your next daily: <t:${next24Hours}:F>`
      )
      .setFooter({
        text: `If you think there is a mistake please contact support (/bot invite) || The streak dies after 48 hours of not claiming your reward`,
        iconURL: interaction.user.displayAvatarURL()
      });

    if (Date.parse(userData.dailyCooldown) + 172800000 < Date.now()) {
      await userData.updateOne({
        dailyStreak: 1,
        dailyCooldown: new Date(Date.now())
      });

      if (timerData) {
        await timerData.updateOne({
          seasonXP: timerData.seasonXP + Number(loginReward()[1]),
          accountXP: timerData.accountXP + Number(loginReward()[1])
        });

        const rankUpSeason = checkRank(
          timerData.seasonLevel,
          timerData.seasonXP,
          timerData.seasonXP + Number(loginReward()[1])
        );

        const rankUpAccount = checkRankAccount(
          timerData.accountLevel,
          timerData.accountXP,
          timerData.accountXP + Number(loginReward()[1])
        );

        if (rankUpSeason[0]) {
          await client.emit(
            "playerLevelUp",
            interaction,
            timerData,
            "seasonLevel",
            rankUpSeason[1],
            rankUpSeason[2]
          );
        }

        if (rankUpAccount[0]) {
          await client.emit(
            "playerLevelUp",
            interaction,
            timerData,
            "accountLevel",
            rankUpAccount[1],
            rankUpAccount[2]
          );
        }
      } else {
        await userData.updateOne({
          extraTimerXP: userData.extraTimerXP + Number(loginReward()[1])
        });
      }

      return interaction.reply({
        embeds: [lostStreak]
      });
    }

    const onCooldown = new MessageEmbed()
      .setTitle(`⏰ You can't do that yet`)
      .setColor(colours.DEFAULT)
      .setDescription(
        `You've already collected your daily login reward [Day: ${
          loginReward(currentStreak)[0]
        }]\n\nYou can collect it again <t:${Math.floor(
          userData.dailyCooldown / 1000 + 86400
        )}:R>.`
      )
      .setTimestamp();

    if (Date.parse(userData.dailyCooldown) + 86400000 > Date.now())
      return interaction.reply({
        embeds: [onCooldown],
        ephemeral: true
      });

    const dailyReward =
      loginReward(currentStreak)[1] != 0
        ? `${loginReward(currentStreak)[1].toLocaleString()} Timer XP`
        : `${loginReward(currentStreak)[2].toLocaleString()} DunkelCoins ${
            emojis.dunkelCoin
          }`;

    const collectedReward = new MessageEmbed()
      .setTitle(`Daily Collected 💰`)
      .setColor(colours.DEFAULT)
      .setDescription(
        `Collected your daily login reward [Day: ${
          loginReward(currentStreak)[0]
        } / 7]\n\n• ${dailyReward} , You can collect your next daily: <t:${next24Hours}:F>.`
      )
      .setTimestamp();

    await userData.updateOne({
      dailyCooldown: new Date(Date.now()),
      dailyStreak: userData.dailyStreak + 1,
      dunkelCoins:
        loginReward(currentStreak)[2] != 0
          ? userData.dunkelCoins + loginReward(currentStreak)[2]
          : userData.dunkelCoins
    });

    if (timerData) {
      await timerData.updateOne({
        seasonXP:
          loginReward(currentStreak)[1] != 0
            ? timerData.seasonXP + loginReward(currentStreak)[1]
            : timerData.seasonXP,
        accountXP:
          loginReward(currentStreak)[1] != 0
            ? timerData.accountXP + loginReward(currentStreak)[1]
            : timerData.accountXP
      });

      if (loginReward(currentStreak)[1] != 0) {
        const rankUpSeason = checkRank(
          timerData.seasonLevel,
          timerData.seasonXP,
          timerData.seasonXP + Number(loginReward(currentStreak)[1])
        );

        const rankUpAccount = checkRankAccount(
          timerData.accountLevel,
          timerData.accountXP,
          timerData.accountXP + Number(loginReward(currentStreak)[1])
        );

        if (rankUpSeason[0]) {
          await client.emit(
            "playerLevelUp",
            interaction,
            timerData,
            "seasonLevel",
            rankUpSeason[1],
            rankUpSeason[2]
          );
        }

        if (rankUpAccount[0]) {
          await client.emit(
            "playerLevelUp",
            interaction,
            timerData,
            "accountLevel",
            rankUpAccount[1],
            rankUpAccount[2]
          );
        }
      }
    } else {
      await userData.updateOne({
        extraTimerXP:
          loginReward(currentStreak)[1] != 0
            ? userData.extraTimerXP + loginReward(currentStreak)[1]
            : userData.extraTimerXP
      });
    }

    return interaction.reply({
      embeds: [collectedReward]
    });
  }
};
