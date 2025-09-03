import { Client, ColorResolvable, EmbedBuilder } from "discord.js";

import colours from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";
import CommandLinks from "../../GBF/GBFCommands.json";

import timerSchema from "../../schemas/User Schemas/Timer Schema";
import { GBFUserProfileModel } from "../../schemas/User Schemas/User Profile Schema";

import { xpRequired, xpRequiredAccount } from "../../utils/TimerLogic";

import { levelUpReward } from "../../utils/Engine";

export default function playerLevelUp(client: Client) {
  client.on(
    "playerLevelUp",
    async (interaction, player, type, extraLevels, remainingRP) => {
      const userProfile = await GBFUserProfileModel.findOne({
        userID: player.id,
      });

      const timerProfile = await timerSchema.findOne({
        userID: player.id,
      });

      const noData = new EmbedBuilder()
        .setTitle(`${emojis.ERROR} Oops`)
        .setColor(colours.ERRORRED as ColorResolvable)
        .setDescription(
          `No data related to your user ID [${player.id}] could be found.\nCreate a free account using ${CommandLinks.TimerRegister}`
        );

      if (!userProfile || !timerProfile)
        return interaction.channel.send({
          embeds: [noData],
          ephemeral: true,
        });

      function rankUpEmoji(level: number) {
        let rankUpEmoji: string;
        switch (true) {
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
        let seasonProgressBar: string;

        const percentageSeasonComplete: number =
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

          console.log(timerProfile.seasonLevel);
          console.log(extraLevels);

        const levelUpMessage = `• New Season Level: ${
          timerProfile.seasonLevel + Number(extraLevels != 0 ? extraLevels : 1)
        }\n• Season XP: \`${remainingRP.toLocaleString()}\`\n• XP required to reach level ${
          !(extraLevels < 1) ? timerProfile.seasonLevel + extraLevels : 2
        }: \`${xpRequired(
          !(extraLevels < 1) ? timerProfile.seasonLevel + extraLevels : 2
        ).toLocaleString()}\`\n• Season Level Progress: ${seasonProgressBar} \`[${percentageSeasonComplete.toFixed(
          2
        )} %]\`\n• Cash Earned: \`₲${rankUpReward.toLocaleString()}\``;

        const rankedUp = new EmbedBuilder()
          .setTitle(
            `${rankUpEmoji(
              timerProfile.seasonLevel +
                Number(extraLevels != 0 ? extraLevels : 1)
            )} Ranked Up [Season]`
          )
          .setColor(colours.DEFAULT as ColorResolvable)
          .setDescription(`${levelUpMessage}`)
          .setFooter({
            text: `Number of rank ups: ${extraLevels != 0 ? extraLevels : 1}`,
          });

        await userProfile.updateOne({
          bank: userProfile.bank + rankUpReward,
          totalEarned: userProfile.totalEarned + rankUpReward,
        });

        await timerProfile.updateOne({
          seasonLevel:
            timerProfile.seasonLevel +
            Number(extraLevels != 0 ? extraLevels : 1),
          seasonXP: Number(remainingRP),
        });

        return interaction.channel.send({
          content: `${player}`,
          embeds: [rankedUp],
        });
      } else if (type === "accountLevel") {
        let accountProgressBar: string;

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

        const levelUpMessage = `• New Rank: ${
          userProfile.Rank + Number(extraLevels != 0 ? extraLevels : 1)
        }\n• RP: \`${remainingRP.toLocaleString()}\`\n• RP required to reach rank ${
          !(extraLevels < 1) ? userProfile.Rank + extraLevels : 2
        }: \`${xpRequiredAccount(
          !(extraLevels < 1) ? userProfile.Rank + extraLevels : 2
        ).toLocaleString()}\`\n•Account Rank Progress: ${accountProgressBar} \`[${percentageAccountComplete.toFixed(
          2
        )} %]\`\n• Cash Earned: \`₲${rankUpReward.toLocaleString()}\``;

        const rankedUp = new EmbedBuilder()
          .setTitle(
            `${rankUpEmoji(
              userProfile.Rank + Number(extraLevels != 0 ? extraLevels : 1)
            )} Ranked Up [Account]`
          )
          .setColor(colours.DEFAULT as ColorResolvable)
          .setDescription(`${levelUpMessage}`)
          .setFooter({
            text: `Number of rank ups: ${extraLevels != 0 ? extraLevels : 1}`,
          });

        await userProfile.updateOne({
          Rank: userProfile.Rank + Number(extraLevels != 0 ? extraLevels : 1),
          RP: Number(remainingRP),
          bank: userProfile.bank + rankUpReward,
          totalEarned: userProfile.totalEarned + rankUpReward,
        });

        return interaction.channel.send({
          content: `${player}`,
          embeds: [rankedUp],
        });
      }
    }
  );
}
