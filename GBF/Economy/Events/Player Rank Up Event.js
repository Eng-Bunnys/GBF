const { MessageEmbed } = require("discord.js");

const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

const UserProfileSchema = require("../../schemas/Economy Schemas/User Profile Schema");

const {
  checkRank,
  LevelUpReward,
  DunkelCoinsEarned,
  abbreviateNumber
} = require("../../utils/DunkelLuzEngine");

module.exports = (client) => {
  client.on(
    "playerLevelUp",
    async (interaction, player, extraLevels, remainingRP) => {
      const userData = await UserProfileSchema.findOne({
        userId: player.id
      });

      const noData = new MessageEmbed()
        .setTitle(`${emojis.ERROR} Oops`)
        .setColor(colours.ERRORRED)
        .setDescription(
          `We couldn't find any data on you, please contact support if this issue is repeated`
        );

      if (!userData)
        return interaction.followUp({
          embeds: [noData],
          ephemeral: true
        });

      const userRankAfterOneRank = userData.rank + 1;

      const rankedUp = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} Ranked Up`)
        .setColor(colours.DunkelLuzGreen)
        .setDescription(
          `Current Rank: ${(
            userRankAfterOneRank + extraLevels
          ).toLocaleString()} ${
            extraLevels !== 0
              ? `|| Went up ${extraLevels.toLocaleString()} levels`
              : ""
          }`
        )
        .setFooter({
          text: `Carry over RP: ${remainingRP.toLocaleString()} || You get DunkelCoins every 10 levels!`
        });

      const cashEarned = LevelUpReward(userRankAfterOneRank, extraLevels);
      const coinsEarned = DunkelCoinsEarned(userRankAfterOneRank, extraLevels);

      if (
        userRankAfterOneRank + extraLevels === 5000 &&
        !userData.achievements.includes("MaxRank")
      ) {
        const achievementType = {
          type: "MaxRank",
          name: "Max Rank",
          requirements: `Reach Rank 5,000`,
          hasBadge: true
        };
        await client.emit(
          "achievementComplete",
          interaction,
          player,
          achievementType
        );
      }

      if (
        userRankAfterOneRank + extraLevels >= 100 &&
        !userData.achievements.includes("Rank100")
      ) {
        const achievementType = {
          type: "Rank100",
          name: "Rank 100 💯",
          requirements: `Reach Rank 100\n\nRewards:\n• ₲100,000\n• 5,000 RP\n• ${emojis.dunkelCoin}10 DunkelCoins`,
          hasBadge: false
        };
        await client.emit(
          "achievementComplete",
          interaction,
          player,
          achievementType
        );
      }

      rankedUp.addFields({
        name: "Rewards:",
        value: `• ₲${abbreviateNumber(cashEarned, 2, false, false)}${
          coinsEarned !== 0
            ? `\n• ${emojis.dunkelCoin} ${abbreviateNumber(
                coinsEarned,
                2,
                false,
                false
              )} DunkelCoins`
            : ""
        }`
      });

      await userData.updateOne({
        RP: remainingRP,
        rank: userData.rank + 1 + extraLevels,
        bank: userData.bank + cashEarned,
        netWorth: userData.netWorth + cashEarned,
        totalEarned: userData.totalEarned + cashEarned,
        DunkelCoins: userData.DunkelCoins + coinsEarned
      });

      return interaction.channel.send({
        content: `<@${player.id}>`,
        embeds: [rankedUp]
      });
    }
  );
};
