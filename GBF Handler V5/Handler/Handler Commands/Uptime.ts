import { EmbedBuilder } from "discord.js";
import { SlashCommand } from "../Command Handlers/Slash Handler";
import { GBF } from "../GBF";
import { msToTime } from "../../Utils/Utils";
import { ColorCodes } from "../../Utils/GBF Features";

export class Uptime extends SlashCommand {
  constructor(client: GBF) {
    super(client, {
      name: "uptime",
      description: `${client.user.username}'s uptime`,
      cooldown: 5,
      async execute({ client, interaction }) {
        const UptimeEmbed = new EmbedBuilder()
          .setTitle(`${client.user.username}'s Uptime`)
          .setDescription(`${msToTime(client.uptime)}`)
          .setColor(ColorCodes.Default);

        return interaction.reply({
          embeds: [UptimeEmbed],
        });
      },
    });
  }
}
