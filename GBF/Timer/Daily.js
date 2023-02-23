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
      devOnly: false,
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: true
    });
  }

  async execute({ client, interaction }) {
    // Checking if the user has a profile

    // Checking for certain category completion such as semester start etc. is bad since this is a multi-category command

    const userData = await userSchema.findOne({
      userID: interaction.user.id
    });

    const timerData = await timerSchema.find({
      userID: interaction.user.id
    });

    // There is a possibility of the user not having a timer account, so we need to check which one we use first

    let usedTimerData;

    // If the user does not have an account, we register one with no category based settings

    const newAccount = new MessageEmbed()
      .setTitle(`${emojis.MaxRank} Collected`)
      .setColor(colours.DEFAULT)
      .setDescription(
        `Hey!\nThanks for logging in GBF today, as a thank you, you'll receive a reward based on the day of the week and your daily streak!\n\nI've given you an extra reward as a welcome gift 😉\n\n• 250 DunkelCoins ${emojis.dunkelCoin}\n• 5,000 Timer XP`
      )
      .setFooter({
        text: `A Timer Account is required to claim the 5,000 XP, if you already own one, you won't get a level up message until a session ends.`
      });

    if (!userData) {
      const newData = new userSchema({
        userID: interaction.user.id,
        dunkelCoins: 750,
        dailyCooldown: new Date(Date.now()),
        dailyStreak: 1
      });

      await newData.save();

      return interaction.reply({
        embeds: [newAccount]
      });
    }

    if (!timerData) {
      const newTimerData = new timerSchema({
        userID: interaction.user.id,
        seasonXP: 5000,
        accountXP: 5000
      });

      await newTimerData.save();

      usedTimerData = newTimerData;
    }

    if (timerData) {
      await timerData.updateOne({
        seasonXP: timerData.seasonXP + 5000,
        accountXP: timerData.accountXP + 5000
      });
      usedTimerData = timerData;
    }

    if (userData && !userData.dailyCooldown) {
      await userData.updateOne({
        dailyCooldown: new Date(Date.now()),
        dailyStreak: 1,
        dunkelCoins: userData.dunkelCoins + 250
      });

      await usedTimerData.updateOne({
        seasonXP: timerData.seasonXP + 5000,
        accountXP: timerData.accountXP + 5000
      });

      return interaction.reply({
        embeds: [newAccount]
      });
    }

    const rankUpSeason = checkRank(
      usedTimerData.seasonLevel,
      usedTimerData.seasonXP,
      usedTimerData.seasonXP + 5000
    );

    const rankUpAccount = checkRankAccount(
      usedTimerData.accountLevel,
      usedTimerData.accountXP,
      usedTimerData.accountXP + 5000
    );

    if (rankUpSeason[0])
      await client.emit(
        "playerLevelUp",
        interaction,
        usedTimerData,
        "seasonLevel",
        rankUpSeason[1],
        rankUpSeason[2]
      );

    if (rankUpAccount[0])
      await client.emit(
        "playerLevelUp",
        interaction,
        usedTimerData,
        "accountLevel",
        rankUpAccount[1],
        rankUpAccount[2]
      );
    // Checking if the user is on cooldown

    const onCooldown = new MessageEmbed()
      .setTitle(`⏰ You can't do that yet`)
      .setColor(colours.DEFAULT)
      .setDescription(
        `You've already collected your daily login reward\n\nYou can collect it again <t:${Math.floor(
          userData.dailyCooldown / 1000 + 86400
        )}:R>.`
      )
      .setTimestamp();

    if (Date.parse(userData.dailyCooldown) + 86400000 > Date.now())
      return interaction.reply({
        embeds: [onCooldown],
        ephemeral: true
      });

    const currentStreak = userData.dailyStreak;

    const lostStreak = new MessageEmbed()
      .setTitle(`Daily Collected 💰`)
      .setColor(colours.DEFAULT)
      .setDescription(
        `Collected your daily login reward [Day: ${
          loginReward()[0]
        } / 7]\n\n• ${
          loginReward()[1]
        } Timer XP\n\nYou failed to keep up the daily streak, your last streak was ${currentStreak.toLocaleString()} days.\nYou can collect your next daily: <t:${next24Hours}:F>`
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

      await usedTimerData.updateOne({
        seasonXP: usedTimerData.seasonXP + Number(loginReward()[1]),
        accountXP: usedTimerData.accountXP + Number(loginReward()[1])
      });
    }
  }
};
