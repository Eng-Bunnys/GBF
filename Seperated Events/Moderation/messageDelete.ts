  client.on("messageDelete", async (message) => {
    if (
      message.author?.bot ||
      message.channel.type === "DM" ||
      message.embeds.length > 0 ||
      message.guild!.id !== "439890528583286784"
    )
      return;

    let logsChannel = (message.guild?.channels.cache.find((channel) =>
      channel.name.toLowerCase().includes("logs")
    )) as TextChannel;

    if (!logsChannel) logsChannel = message.channel! as TextChannel;

    const deletedMessageEmbed = new MessageEmbed()
      .setColor("#e91e63")
      .setFooter({
        text: `User ID: ${message.author?.id}`,
      })
      .setTimestamp()
      .setAuthor({
        name: `${message.author?.tag}`,
        iconURL: message.author?.displayAvatarURL({
          format: "png",
          dynamic: true,
        }),
      });

    if (message.content)
      if (message.content.length > 1024)
        message.content = message.content.slice(0, 1021) + "...";

    if (message.attachments.size > 0) {
      const NameWithNoUnderScores = message.attachments
        .first()
        ?.name!.replace("_", " ");

        let fileDisplay = message.attachments.size > 1 ? "files" : "file";

      const attachmentDeletedWithMessage = `**A message and ${
        message.attachments.size
      } ${fileDisplay} sent by ${message.author} in ${
        message.channel
      } have been deleted**\nMessage: ${
        message.content
      }\nFirst File Name: ${NameWithNoUnderScores}\nFirst File Size: ${(
        message.attachments.first()!.size / 1000
      ).toFixed(2)} KB\nFirst File URL: [${NameWithNoUnderScores}](${
        message.attachments.first()!.url
      })`;
      const attachmentDeleted = `**${
        message.attachments.size
      } ${fileDisplay} sent by ${message.author} have been deleted in ${
        message.channel
}**\nFirst File Name: ${NameWithNoUnderScores}\nFirst File Size: ${(
        message.attachments.first()!.size / 1000
      ).toFixed(2)} KB\nFirst File URL: [${NameWithNoUnderScores}](${
        message.attachments.first()!.url
      })`;

      if (message.content!.length > 0)
        deletedMessageEmbed.setDescription(attachmentDeletedWithMessage);
      else deletedMessageEmbed.setDescription(attachmentDeleted);
    } else {
      const messageDeleted = `**A message sent by ${message.author} has been deleted in ${message.channel}**\nMessage: ${message.content}`;
      deletedMessageEmbed.setDescription(messageDeleted);
    }

    const deleteLogsWebhook = await logsChannel.createWebhook(
      `${client.user?.username}`,
      {
        avatar: client.user?.displayAvatarURL({
          format: "png",
          dynamic: true,
        }),
      }
    );

    try {
      await deleteLogsWebhook.send({
        embeds: [deletedMessageEmbed],
      });
      setTimeout(() => {
        return deleteLogsWebhook.delete();
      }, 3000);
    } catch (err) {
      setTimeout(() => {
        deleteLogsWebhook.delete();
      }, 3000);
      await logsChannel.send({
        embeds: [deletedMessageEmbed],
      });
    }
  });
