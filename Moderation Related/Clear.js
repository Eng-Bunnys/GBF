    //Getting the number of messages the user wantts to delete
    let count = interaction.options.getInteger("amount");
    
    const InvalidNumber = new MessageEmbed()
      .setTitle(`${emojis.ERROR} I can't do that`)
      .setDescription(`Please provide a valid integer between 1 and 100`)
      .setColor(colours.ERRORRED)
    //If the user specified a negative number or 0
    if (count <= 0) return interaction.reply({
      embeds: [InvalidNumber],
      ephemeral: true
    })

    let text
    //Telling the user that the bot can only delete 100 messages in one go, if higher than 100 auto set the limit to 100
    if (count > 100) {
      count = 100;
      text = `I can only delete up to 100 messages in one go`
    } else text = `Requested by: ${interaction.user.username}`
    //Fetching the messages
    //You can add other options here like from user, etc : https://discord.js.org/#/docs/discord.js/stable/class/MessageManager?scrollTo=fetch
    const messages = await interaction.channel.messages.fetch({
      limit: count
    })
    //Bulk deleting the messages, the true means to skip everything over 14 days old, this avoids errors and stops us from having to add code to tell the user that
    //the bot can't delete messages over 14 days old
    interaction.channel.bulkDelete(messages, true)

    const successEmbed = new MessageEmbed()
      .setTitle(`${emojis.VERIFY} Success!`)
      .setColor("#e91e63")
      .setDescription(`Successfully deleted **${count}** messages`)
      .setFooter({
        text: `This message auto-deletes in 5 seconds`,
        iconURL: interaction.user.displayAvatarURL()
      })

    await interaction.reply({
      embeds: [successEmbed]
    })
    //Deleting the reply 
    setTimeout(() => interaction.deleteReply(), 5000);
