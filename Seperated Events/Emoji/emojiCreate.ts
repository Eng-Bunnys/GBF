import {
  Client,
  Permissions,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextChannel,
  GuildMemberResolvable,
} from "discord.js";

  client.on("emojiCreate", async (emoji) => {
    const emojiType = emoji.animated ? "Animated" : "Normal";

    const fetchedLogs = await emoji.guild.fetchAuditLogs({
      limit: 1,
      type: "EMOJI_CREATE",
    });

    const emojiLog = fetchedLogs.entries.first();

    const emojiURL = emoji.animated
      ? `https://cdn.discordapp.com/emojis/${emoji.id}.gif`
      : `https://cdn.discordapp.com/emojis/${emoji.id}.png`;

    const newEmojiEmbed = new MessageEmbed()
      .setTitle(`${emoji} A new emoji has been added to ${emoji.guild.name}`)
      .setColor("#e91e63")
      .addFields(
        {
          name: "Emoji Name:",
          value: `${emoji.name}`,
          inline: true,
        },
        {
          name: "Emoji ID:",
          value: `${emoji.id}`,
          inline: true,
        },
        {
          name: "Emoji Type:",
          value: `${emojiType}`,
          inline: true,
        },
        {
          name: "Emoji Created By:",
          value: `${emojiLog!.executor?.tag}`,
          inline: true,
        },
        {
          name: "Emoji Created At:",
          value: `<t:${Math.floor(emoji.createdTimestamp / 1000)}:F>`,
          inline: true,
        },
        {
          name: "Emoji Link:",
          value: `[${emoji} Link](${emojiURL})`,
          inline: true,
        }
      )
      .setFooter({
        text: `${emoji.guild.name} logging powered by GBF`,
        iconURL:
          emoji.guild.iconURL() ||
          "https://external-preview.redd.it/4PE-nlL_PdMD5PrFNLnjurHQ1QKPnCvg368LTDnfM-M.png?auto=webp&s=ff4c3fbc1cce1a1856cff36b5d2a40a6d02cc1c3",
      })
      .setTimestamp();

    const emojiButton = new MessageActionRow().addComponents(
      new MessageButton()
        .setEmoji(emoji)
        .setLabel(`${emoji.name}'s URL`)
        .setStyle("LINK")
        .setURL(emojiURL)
    );

    let logsChannel = emoji.guild?.channels.cache.find((channel) =>
      channel.name.toLowerCase().includes("logs")
    ) as TextChannel;

    if (!logsChannel)
      logsChannel = emoji.guild.channels.cache
        .filter((c) => c.type === "GUILD_TEXT")
        .filter((ch) =>
          ch
            .permissionsFor(emoji.guild.me as GuildMemberResolvable)!
            .has(Permissions.FLAGS.SEND_MESSAGES)
        )
        .first() as TextChannel;

    await logsChannel.send({
      embeds: [newEmojiEmbed],
      components: [emojiButton],
    });
  });
