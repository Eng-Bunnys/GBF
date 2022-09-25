const { MessageEmbed } = require("discord.js");

const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

const UserProfileSchema = require("../../schemas/Economy Schemas/User Profile Schema");

const {
  checkRank,
  LevelUpReward,
  DunkelCoinsEarned
} = require("../../utils/DunkelLuzEngine");

module.exports = (client) => {
  client.on("playerLevelUp", async (interaction, player) => {
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

    const rankedUp = new MessageEmbed()
      .setTitle(`${emojis.VERIFY} Ranked Up`)
      .setColor(colours.DunkelLuzGreen)
      .setDescription(`Current Rank: ${(userData.rank + 1).toLocaleString()}`)
      .setFooter({
        text: `The higher your rank, the better the rewards you get`
      });

    const cashEarned = LevelUpReward(userData.rank + 1);
    const coinsEarned = DunkelCoinsEarned(userData.rank + 1);

    if (userData.rank + 1 === 5000) {
      const achievementType = {
        type: "MaxRank",
        hasBadge: true
      };
      await client.emit(
        "achievementComplete",
        interaction,
        player,
        achievementType
      );
    }

    if (userData.rank + 1 === 100) {
      const achievementType = {
        type: "Rank100",
        hasBadge: false
      };
      await client.emit(
        "achievementComplete",
        interaction,
        player,
        achievementType
      );
    }

    if (checkRank(userData.rank, userData.RP)) {
      rankedUp.addFields({
        name: "Rewards:",
        value: `• ₲${cashEarned.toLocaleString()}${
          coinsEarned !== 0
            ? `\n• ${
                emojis.DunkelCoins
              } ${coinsEarned.toLocaleString()} DunkelCoins`
            : ""
        }`
      });

      await userData.updateOne({
        RP: 0,
        rank: userData.rank + 1,
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
  });
};
