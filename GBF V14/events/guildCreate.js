const { EmbedBuilder, Events } = require("discord.js");

const colours = require("../GBF/GBFColor.json");

const { redBright } = require("chalk");

const { guildChannels } = require("../utils/Engine");

module.exports = (client) => {
  client.on(Events.GuildCreate, async (guild) => {
    const channel = guildChannels(guild);
    if (!channel) return;

    const arrowEmoji = `<a:arrow:819986651208089640>`;

    const welcomemessage = new EmbedBuilder()
      .setTitle(`Thank you for choosing ${client.user.username}`)
      .setDescription(
        `${
          client.user.username
        } is here!\n\n${arrowEmoji} Register as a freebie server using </freebie register:1007317538281107506>\n${arrowEmoji} Check out my commands by typing / and choosing GBF\n\nIf you'd like to request a feature or report a bug please do so in the [support server](${"https://discord.gg/PuZMhvhRyX"} "Hello Peter")`
      )
      .setColor(colours.DEFAULT)
      .setFooter({
        text: `${client.user.tag}`,
        iconURL: guild.iconURL()
      });

    channel
      .send({
        embeds: [welcomemessage]
      })
      .catch(() => {});

    const GBFLogger = await client.channels
      .fetch("862108928165937172")
      .catch(() => null);

    const newGuild = new EmbedBuilder()
      .setTitle(`I have been added to ${guild.name}`)
      .setColor(colours.DEFAULT)
      .setDescription(
        `${guild.name} has ${guild.memberCount.toLocaleString()} members`
      );

    GBFLogger.send({
      embeds: [newGuild]
    });
    GBFLogger.send({
      content: `<@333644367539470337> I have been added to ${guild.name}`
    });

    console.log(
      redBright(
        `I have been added to ${
          guild.name
        } and has ${guild.memberCount.toLocaleString()} members`
      )
    );
  });
};
