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
  client.on("badgeComplete", async (interaction, player, badge) => {
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

    if (badge === "100Streak") {
      const hundredStreakBadge = new MessageEmbed()
        .setTitle(`${emojis["100Badge"]} New badge unlocked`)
        .setColor(`#A15C89`)
        .setDescription(
          `Requirements: Complete the "100Streak" achievement\n\nRewards:\n• Profile Badge [${emojis["100Badge"]}]`
        );

      await userData.badges.push("100Streak");
      await userData.save();

      return interaction.channel.send({
        content: `<@${player.id}>`,
        embeds: [hundredStreakBadge]
      });
    }
  });
};
