import { Client, ColorResolvable, EmbedBuilder } from "discord.js";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import { getTasksCompleted } from "../../API/Economy/SueLuz Engine";
import { GBFUserProfileModel } from "../../schemas/User Schemas/User Profile Schema";

export default function missionPassed(client: Client) {
  client.on(
    "missionComplete",
    async (interaction, player, tasksCompleted, missionType) => {
      const userData = await GBFUserProfileModel.findOne({
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
      if (missionType === "Meet Robin") {
        missionCompleteEmbed.setDescription(`Mission: \`Meet Robin\``);
        await interaction.channel.send({
          embeds: [missionCompleteEmbed]
        });
        await userData.updateOne({
          completedMissions: {
            intro: true,
            MeetRobin: true,
            MojaveJob: false
          }
        });
      }
      console.log(missionType);
      if (missionType === "The Mojave One") {
        missionCompleteEmbed.setDescription(`Mission: \`The Mojave One\``);
        await interaction.channel.send({
          embeds: [missionCompleteEmbed]
        });
        await userData.updateOne({
          completedMissions: {
            intro: true,
            MeetRobin: true,
            MojaveJob: false
          }
        });

        const passedDia = new EmbedBuilder()
          .setDescription(
            `\`Robin:\` Not bad tough guy, this will be our base and Jerald will setup some washers here if you know what I'm talking about, will give us some money on the side but we'll need someone to get us supplies and deliver the prodcut, you can of course hire someone to do that but it will set you back a bit.`
          )
          .setColor(colors.DEFAULT as ColorResolvable);

        interaction.channel.send({
          embeds: [passedDia]
        });
      }
    }
  );
}
