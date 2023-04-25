import {
  ColorResolvable,
  EmbedBuilder,
  Events,
  Guild,
  GuildChannel,
  TextChannel
} from "discord.js";

import colours from "../GBF/GBFColor.json";
import { Developers, LogChannel } from "../config/GBFconfig.json";

import { redBright } from "chalk";

import { guildChannels } from "../utils/Engine";

module.exports = (client) => {
  client.on(Events.GuildCreate, async (guild: Guild) => {
    const channel = guildChannels(guild, "general");
    if (!channel) return;

    const arrowEmoji = `<a:arrow:819986651208089640>`;

    const joinMessage = new EmbedBuilder()
      .setTitle(`Thank you for choosing ${client.user.username}`)
      .setDescription(
        `${
          client.user.username
        } is here!\n\n${arrowEmoji} Register as a freebie server using </freebie register:1007317538281107506>\n${arrowEmoji} Check out my commands by typing / and choosing GBF\n\nIf you'd like to request a feature or report a bug please do so in the [support server](${"https://discord.gg/PuZMhvhRyX"} "Hello Peter")`
      )
      .setColor(colours.DEFAULT as ColorResolvable)
      .setFooter({
        text: `${client.user.tag}`,
        iconURL: guild.iconURL()
      });

    channel.send({
      embeds: [joinMessage]
    });

    const GBFLogger: TextChannel = await client.channels
      .fetch(LogChannel)
      .catch(() => null);

    const newGuildJoin = new EmbedBuilder()
      .setTitle(`I have been added to ${guild.name}`)
      .setColor(colours.DEFAULT as ColorResolvable)
      .setDescription(
        `${guild.name} has ${guild.memberCount.toLocaleString()} members`
      );

    let GBFDevelopers: string = ``;

    for (let i = 0; i < Developers.length; i++)
      GBFDevelopers += `<@${Developers[i]}> `;

    if (GBFLogger) {
      GBFLogger.send({
        embeds: [newGuildJoin]
      });
      GBFLogger.send({
        content: `${GBFDevelopers} I have been added to ${guild.name}`
      });
    }

    console.log(
      redBright(
        `I have been added to ${
          guild.name
        } and has ${guild.memberCount.toLocaleString()} members`
      )
    );
  });
};
