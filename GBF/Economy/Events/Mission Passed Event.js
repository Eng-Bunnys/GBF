const { MessageEmbed } = require("discord.js");

const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

const UserProfileSchema = require("../../schemas/Economy Schemas/User Profile Schema");

const { checkRank, LevelUpReward } = require("../../utils/DunkelLuzEngine");

module.exports = (client) => {
  client.on("dunkelMissionPassed", async (interaction, player, mission) => {
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

    const missionCompleteMessage = new MessageEmbed()
      .setTitle(`${emojis.VERIFY} Mission Complete`)
      .setColor(colours.DunkelLuzGreen)
      .setDescription(`Mission: ${mission.missionName}`)
      .setFooter({
        text: `The harder the mission the better the rewards get`
      });

    if (mission.missionName === "Tutorial") {
      missionCompleteMessage.addFields({
        name: `Rewards:`,
        value: `• ${emojis.dunkelCoin}10 DunkelCoins\n• ₲250 Cash\n• 1000 RP`
      });

      await userData.updateOne({
        characterName: mission.userSetCharacterName,
        introComplete: true,
        DunkelCoins: userData.DunkelCoins + 10,
        bank: userData.bank + 250,
        totalEarned: userData.totalEarned + 250,
        netWorth: userData.netWorth + 250,
        RP: userData.RP + 1000,
        totalRPEarned: userData.totalRPEarned + 1000
      });

      if (checkRank(userData.rank, userData.RP + 1000))
        await client.emit("playerLevelUp", interaction, player);

      return interaction.followUp({
        content: `<@${player.id}>`,
        embeds: [missionCompleteMessage]
      });
    }
  });
};
