const { EmbedBuilder } = require("discord.js");

const colours = require("../../GBF/GBFColor.json");
const emojis = require("../../GBF/GBFEmojis.json");
const CommandLinks = require("../../GBF/GBFCommands.json");

const timerSchema = require("../../schemas/User Schemas/Timer Schema");
const bankSchema = require("../../schemas/User Schemas/User Profile Schema");

const { xpRequired, xpRequiredAccount } = require("../../utils/TimerLogic");

const { levelUpReward } = require("../../utils/Engine");

module.exports = (client) => {
  client.on(
    "playerLevelUp",
    async (interaction, player, type, extraLevels, remainingRP) => {
      const userProfile = await bankSchema.findOne({
        userID: player.id
      });

      const timerProfile = await timerSchema.findOne({
        userID: player.id
      });

      const noData = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} Oops`)
        .setColor(colours.ERRORRED)
        .setDescription(
          `No data related to your user ID [${player.id}] could be found.\nCreate a free account using ${CommandLinks.TimerRegister}`
        );

      if (!userProfile || !timerProfile)
        return interaction.reply({
          embeds: [noData],
          ephemeral: true
        });

      function rankUpEmoji(level) {
        let rankUpEmoji;
        switch (level) {
          case level <= 25:
            rankUpEmoji = `<a:W_:805604232354332704>`;
          case level > 25 && level <= 50:
            rankUpEmoji = `<a:blackSpin:1025851052442005594>`;
          case level > 50 && level <= 75:
            rankUpEmoji = `<a:redSpin:1025851361583173773>`;
          case level > 75 && level < 100:
            rankUpEmoji = `<a:pinkSpin:1025851222068052101>`;
          case level === 100:
            rankUpEmoji = `<a:100_Streak_Badge:963696947015864340>`;
          case level > 100:
            rankUpEmoji = `<a:donutSpin:1025851417421955204>`;
          default:
            rankUpEmoji = `<a:W_:805604232354332704>`;
        }
        return rankUpEmoji;
      }

      if (type === "seasonLevel") {
        let seasonProgressBar;

        const percentageSeasonComplete =
          (remainingRP / xpRequired(timerProfile.seasonLevel + 2)) * 100;

        if (percentageSeasonComplete >= 50 && percentageSeasonComplete < 90)
          seasonProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.rightEmpty}`;
        else if (
          percentageSeasonComplete >= 25 &&
          percentageSeasonComplete < 50
        )
          seasonProgressBar = `${emojis.leftFull}${emojis.middleEmpty}${emojis.rightEmpty}`;
        else if (percentageSeasonComplete >= 99)
          seasonProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.rightFull}`;
        else if (percentageSeasonComplete < 25)
          seasonProgressBar = `${emojis.leftEmpty}${emojis.middleEmpty}${emojis.rightEmpty}`;

        const rankUpReward = Number(
          levelUpReward(timerProfile.seasonLevel + 1)
        );

        const levelUpMessage = `• New Season Level: \`${
          timerProfile.seasonLevel + extraLevels != 0 ? extraLevels : 1
        } ${
          extraLevels != 0 ? "[Number of level ups: " + extraLevels : ""
        }\`\n• Season XP: \`${remainingRP.toLocaleString()}\`\n• XP required to reach level ${
          timerProfile.seasonLevel + extraLevels != 0 ? extraLevels : 2
        }: \`${xpRequired(
          timerProfile.seasonLevel + extraLevels != 0 ? extraLevels : 2
        ).toLocaleString()}\`\n• Season Level Progress: ${seasonProgressBar} \`[${percentageSeasonComplete.toFixed(
          2
        )} %]\n• Cash Earned: ${rankUpReward}`;

        const rankedUp = new EmbedBuilder()
          .setTitle(
            `${rankUpEmoji(
              timerProfile.seasonLevel +
                Number(extraLevels != 0 ? extraLevels : 1)
            )} Ranked Up [Season]`
          )
          .setColor(colours.DEFAULT)
          .setDescription(`${levelUpMessage}`);

        await userProfile.updateOne({
          bank: userProfile.bank + rankUpReward,
          totalEarned: userProfile.totalEarned + rankUpReward
        });

        await timerProfile.updateOne({
          seasonLevel:
            timerProfile.seasonLevel +
            Number(extraLevels != 0 ? extraLevels : 1),
          seasonXP: Number(remainingRP)
        });

        return interaction.reply({
          content: `${player}`,
          embeds: [rankedUp]
        });
      } else if (type === "accountLevel") {
        let accountProgressBar;

        const percentageAccountComplete =
          (remainingRP / xpRequiredAccount(userProfile.Rank + 2)) * 100;

        if (percentageAccountComplete >= 50 && percentageAccountComplete < 90)
          accountProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.rightEmpty}`;
        else if (
          percentageAccountComplete >= 25 &&
          percentageAccountComplete < 50
        )
          accountProgressBar = `${emojis.leftFull}${emojis.middleEmpty}${emojis.rightEmpty}`;
        else if (percentageAccountComplete >= 99)
          accountProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.rightFull}`;
        else if (percentageAccountComplete < 25)
          accountProgressBar = `${emojis.leftEmpty}${emojis.middleEmpty}${emojis.rightEmpty}`;

        const rankUpReward = Number(levelUpReward(userProfile.Rank + 1)) * 2;

        const levelUpMessage = `• New Rank: \`${
          userProfile.Rank + extraLevels != 0 ? extraLevels : 1
        } ${
          extraLevels != 0 ? "[Number of rank ups: " + extraLevels : ""
        }\`\n• RP: \`${remainingRP.toLocaleString()}\`\n• RP required to reach rank ${
          userProfile.Rank + extraLevels != 0 ? extraLevels : 2
        }: \`${xpRequiredAccount(
          userProfile.Rank + extraLevels != 0 ? extraLevels : 2
        ).toLocaleString()}\`\n•Account Rank Progress: ${accountProgressBar} \`[${percentageAccountComplete.toFixed(
          2
        )} %]\n• Cash Earned: ${rankUpReward}`;

        const rankedUp = new EmbedBuilder()
          .setTitle(
            `${rankUpEmoji(
              userProfile.Rank + Number(extraLevels != 0 ? extraLevels : 1)
            )} Ranked Up [Account]`
          )
          .setColor(colours.DEFAULT)
          .setDescription(`${levelUpMessage}`);

        await userProfile.updateOne({
          Rank: userProfile.Rank + Number(extraLevels != 0 ? extraLevels : 1),
          RP: Number(remainingRP),
          bank: userProfile.bank + rankUpReward,
          totalEarned: userProfile.totalEarned + rankUpReward
        });

        return interaction.reply({
          content: `${player}`,
          embeds: [rankedUp]
        });
      }
    }
  );
};
