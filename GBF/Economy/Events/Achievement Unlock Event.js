const { MessageEmbed } = require("discord.js");

const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

const UserProfileSchema = require("../../schemas/Economy Schemas/User Profile Schema");

const {
  checkRank,
  LevelUpReward,
  DunkelCoinsEarned,
  achievementCompletion
} = require("../../utils/DunkelLuzEngine");

module.exports = (client) => {
  client.on("achievementComplete", async (interaction, player, achievement) => {
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

    if (achievement.type === "100Streak") {
      const hundredStreak = new MessageEmbed()
        .setTitle(`Achievement Unlocked: 100 Days 💯🔥`)
        .setColor(colours.DEFAULT)
        .setDescription(
          `Requirements: Reach a hundred day daily login streak\n\nRewards:\n• ₲500,000\n• 1 Rank\n• ${emojis.dunkelCoin}100 DunkelCoins`
        )
        .setFooter({
          text: `${achievement(
            userData.achievements.length + 1
          )}% of achievements earned`
        });

      const requiredRP = RPRequiredToLevelUp(userData.rank);
      const rewardedRP = requiredRP - userData.RP + 1;

      await userData.updateOne({
        DunkelCoins: userData.DunkelCoins + 100,
        bank: userData.bank + 500000,
        netWorth: userData.netWorth + 500000,
        totalEarned: userData.totalEarned + 500000,
        RP: userData.RP + rewardedRP,
        totalRPEarned: userData.totalRPEarned + rewardedRP
      });

      await userData.achievements.push("100Streak");

      await userData.save();

      await client.emit("playerLevelUp", interaction, interaction.user);

      if (achievement.hasBadge)
        await client.emit("badgeComplete", interaction, player, "100Streak");

      return interaction.channel.send({
        content: `<@${player.id}>`,
        embeds: [hundredStreak]
      });
    }
  });
};
