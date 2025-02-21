import {
  ColorResolvable,
  EmbedBuilder,
  Events,
  Guild,
  TextChannel
} from "discord.js";

import colors from "../../GBF/GBFColor.json";

import { redBright } from "chalk";
import GBFClient from "../../handler/clienthandler";

export default function guildLeave(client: GBFClient) {
  client.on(Events.GuildDelete, async (guild: Guild) => {
    const GBFLogger = client.channels.cache.get(this.LogChannel) as TextChannel;

    const GuildLeave = new EmbedBuilder()
      .setColor(colors.DEFAULT as ColorResolvable)
      .setDescription(`I have been removed from ${guild.name}`);

    let GBFDevelopers: string = ``;
    
    if (client.Developers)
      for (let i = 0; i < client.Developers.length; i++)
        GBFDevelopers += `<@${client.Developers[i]}> `;

    if (GBFLogger) {
      GBFLogger.send({
        embeds: [GuildLeave]
      });
      GBFLogger.send({
        content: `${GBFDevelopers} I have been removed from ${guild.name}`
      });
    }

    console.log(
      redBright(
        `I have been removed from ${
          guild.name
        } - ${guild.memberCount.toLocaleString()} members`
      )
    );
  });
}
