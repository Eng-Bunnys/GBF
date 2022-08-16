options: [
    {
      name: "module-setting",
      description:
        "Choose whether to enable or disable GBF Logging (Will not delete data)",
      type: "BOOLEAN",
      required: true,
    },
    {
      name: "channel",
      description:
        "The logging channel where all of the logged events will be sent to",
      type: "CHANNEL",
      channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
    },
  ],
            
const optionBool = interaction.options.getBoolean("module-setting");
const logsChannel = interaction.options.getChannel("channel");

const serverData = await LogsSchema.findOne({
  guildId: interaction.guild.id,
});

const newLogsSettings = new MessageEmbed()
  .setTitle(`${emojis.VERIFY} Logs Settings Saved`)
  .setColor(colours.DEFAULT)
  .setDescription(
    `Welcome to GBF Logging || Now that you've enabled logs you can use all of it's modules ${emojis.VERIFY}`
  )
  .addFields(
    {
      name: "Module Setting:",
      value: `${optionBool ? "Enabled" : "Disabled"}`,
    },
    {
      name: "Logs Channel:",
      value: `${logsChannel ? logsChannel : "No new Logs Channel"}`,
    },
    {
      name: "Need Help?",
      value: `[Check out the documentation](${DocsLink}) or [contact support](${SupportServer})`,
    }
  )
  .setFooter({
    text: `${interaction.guild.name} Logging powered by GBF™`,
    iconURL: interaction.guild.iconURL(),
  })
  .setTimestamp();

if (!serverData) {
  const newServerData = new LogsSchema({
    guildId: interaction.guild.id,
    Enabled: optionBool,
    Channel: logsChannel ? logsChannel.id : null,
  });

  return newServerData.save();
}

await serverData.updateOne({
  Enabled: optionBool,
  Channel: logsChannel ? logsChannel.id : serverData.Channel,
});

return interaction.reply({
  embeds: [newLogsSettings],
});
