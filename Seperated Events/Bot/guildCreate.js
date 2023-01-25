const { MessageEmbed, Permissions } = require("discord.js");

const { PREFIX } = require("../config/GBFconfig.json");

const colours = require("../GBFColor.json");

const { redBright } = require("chalk");

const guildChannels = (guild) => {
  let channel;
  if (guild.channels.cache.has(guild.id)) {
    channel = guild.channels.cache.get(guild.id);
    if (
      channel
        .permissionsFor(guild.client.user)
        .has(Permissions.FLAGS.SEND_MESSAGES)
    ) {
      return guild.channels.cache.get(guild.id);
    }
  }

  channel = guild.channels.cache.find(
    (channel) =>
      channel.name === "general" &&
      channel
        .permissionsFor(guild.client.user)
        .has(Permissions.FLAGS.SEND_MESSAGES) &&
      channel.type === "GUILD_TEXT"
  );
  if (channel) return channel;

  return guild.channels.cache
    .filter(
      (c) =>
        c.type === "GUILD_TEXT" &&
        c.permissionsFor(guild.client.user).has(Permissions.FLAGS.SEND_MESSAGES)
    )
    .sort((a, b) => a.position - b.position)
    .first();
};

module.exports = (client) => {
  client.on("guildCreate", async (guild) => {
    const channel = guildChannels(guild);
    if (!channel) return;

    const arrowEmoji = `<a:arrow:819986651208089640>`;

    const welcomemessage = new MessageEmbed()
      .setTitle(`Thank you for choosing ${client.user.username}`)
      .setDescription(
        `${
          client.user.username
        } is here!\n\n${arrowEmoji} Register as a freebie server using </freebie register:1007317538281107506>\n${arrowEmoji} Check out my commands by typing / and choosing GBF\n\nIf you'd like to request a feature or report a bug please do so in the [support server](${"https://discord.gg/PuZMhvhRyX"} "Not an easter egg")`
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

    const saver2 = await client.channels
      .fetch("862108928165937172")
      .catch(() => null);

    const newserver = new MessageEmbed()

      .setTitle(`I have been added to ${guild.name}`)
      .setColor(colours.DEFAULT)
      .setDescription(
        `${guild.name} has ${guild.memberCount.toLocaleString()} members`
      );

    saver2.send({
      embeds: [newserver]
    });
    saver2.send({
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
