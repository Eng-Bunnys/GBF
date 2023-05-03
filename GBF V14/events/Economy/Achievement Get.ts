import { Client, ColorResolvable, EmbedBuilder } from "discord.js";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import UserProfileSchema from "../../schemas/User Schemas/User Profile Schema";

export default function achievementGet(client: Client) {
  client.on("missionComplete", async (interaction, player, achievement) => {
    const userData = await UserProfileSchema.findOne({
      userID: player.id
    });

    if (!userData) return;

    const achievementUnlocked = new EmbedBuilder()
      .setTitle(`${emojis.trophy} Achievement Unlocked`)
      .setColor(colors.DEFAULT as ColorResolvable);

    if (achievement["Welcome To SueLuz"]) {
      achievementUnlocked.setDescription(`Earned: Welcome To SueLuz ✈️`);
      await userData.updateOne({
        achievements: {
          welcomeToSueLuz: true
        }
      });
      interaction.channel.send({
        embeds: [achievementUnlocked]
      });
    }
  });
}
