import {
  Client,
  ColorResolvable,
  EmbedBuilder,
} from "discord.js";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import { getTasksCompleted } from "../../utils/SueLuz Engine";
import UserProfileSchema from "../../schemas/User Schemas/User Profile Schema";

export default function missionPassed(client: Client) {
  client.on(
    "missionComplete",
    async (interaction, player, tasksCompleted, missionType) => {
      const userData = await UserProfileSchema.findOne({
        userID: player.id
      });

      if (!userData) return;

      const { taskList, totalPercentage } = getTasksCompleted(tasksCompleted);

      const missionCompleteEmbed = new EmbedBuilder()
        .setTitle(`${emojis.VERIFY} Mission Passed`)
        .addFields({
          name: `Completion ${totalPercentage}%:`,
          value: `${taskList}`
        })
        .setColor(colors.DEFAULT as ColorResolvable);

      if (missionType === "intro") {
        missionCompleteEmbed.setDescription(`Mission: \`Welcome to SueLuz\``);
        await interaction.channel.send({
          embeds: [missionCompleteEmbed]
        });
        if (!userData.achievements.welcomeToSueLuz)
          client.emit("achievementGet", interaction, player, "welcomeToSueLuz");
      }
    }
  );
}
