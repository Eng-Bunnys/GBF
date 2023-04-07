    options: [{
        name: "amount",
        description: "The number of messages that you want to delete",
        type: "INTEGER",
        minValue: 1,
        maxValue: 100,
        required: true
      }],
          
  const count = interaction.options.getInteger("amount");

    const messages = await interaction.channel.messages.fetch({
      limit: count
    })

    await interaction.channel.bulkDelete(messages, true)

    const successEmbed = new MessageEmbed()
      .setTitle(`${emojis.VERIFY} Success!`)
      .setColor(colours.DEFAULT)
      .setDescription(`Successfully deleted **${count}** messages`)
      .setFooter({
        text: `This message auto-deletes in 5 seconds`,
        iconURL: interaction.user.displayAvatarURL()
      })

    await interaction.reply({
      embeds: [successEmbed]
    })

    setTimeout(() => interaction.deleteReply(), 5000);
