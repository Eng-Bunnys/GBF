import {
  Client,
  ColorResolvable,
  EmbedBuilder,
  Events,
  Guild,
  TextChannel
} from "discord.js";

import colors from "../../GBF/GBFColor.json";
import { Developers, LogChannel } from "../../config/GBFconfig.json";

import { redBright } from "chalk";

export default function guildLeave(client: Client) {
  client.on(Events.GuildDelete, async (guild: Guild) => {
    const GBFLogger: TextChannel = await client.channels
      .fetch(LogChannel)
      .catch(() => null);

    const GuildLeave = new EmbedBuilder()
      .setColor(colors.DEFAULT as ColorResolvable)
      .setDescription(`I have been removed from ${guild.name}`);

    let GBFDevelopers: string = ``;

    for (let i = 0; i < Developers.length; i++)
      GBFDevelopers += `<@${Developers[i]}> `;

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
