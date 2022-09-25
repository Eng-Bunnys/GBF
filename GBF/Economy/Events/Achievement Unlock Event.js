const { MessageEmbed } = require("discord.js");

const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

const UserProfileSchema = require("../../schemas/Economy Schemas/User Profile Schema");

const {
  checkRank,
  LevelUpReward,
  DunkelCoinsEarned,
  achievementCompletion,
  RPRequiredToLevelUp
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

    const achievementScreen = new MessageEmbed()
      .setTitle(`Achievement Unlocked: ${achievement.name}`)
      .setColor(colours.DEFAULT)
      .setDescription(`Requirements: ${achievement.requirements}`)
      .setFooter({
        text: `${achievementCompletion(
          userData.achievements.length + 1
        )}% of achievements earned`
      });

    if (achievement.hasBadge)
      await client.emit("badgeComplete", interaction, player, achievement.type);

    if (achievement.type === "100Streak") {
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
        await client.emit(
          "badgeComplete",
          interaction,
          player,
          achievement.type
        );

      return interaction.channel.send({
        content: `<@${player.id}>`,
        embeds: [achievementScreen]
      });
    } else if (achievement.type === "Rank100") {
      await userData.updateOne({
        DunkelCoins: userData.DunkelCoins + 10,
        bank: userData.bank + 100000,
        netWorth: userData.netWorth + 100000,
        totalEarned: userData.totalEarned + 100000,
        RP: userData.RP + 5000,
        totalRPEarned: userData.totalRPEarned + 5000
      });

      await userData.achievements.push("Rank100");

      await userData.save();

      if (checkRank(userData.rank, userData.RP + 5000))
        await client.emit("playerLevelUp", interaction, interaction.user);

      return interaction.channel.send({
        content: `<@${player.id}>`,
        embeds: [achievementScreen]
      });
    } else if (achievement.type === "TutorialComplete") {
      await userData.achievements.push("TutorialComplete");

      await userData.save();

      return interaction.channel.send({
        content: `<@${player.id}>`,
        embeds: [achievementScreen]
      });
    } else if (achievement.type === "JackpotPrize") {
      await userData.achievements.push("JackpotPrize");

      await userData.save();

      return interaction.channel.send({
        content: `<@${player.id}>`,
        embeds: [achievementScreen]
      });
    }
  });
};
