    //The options that we're going to use : https://discord.js.org/#/docs/main/stable/typedef/ApplicationCommandOption
     options: [{
        name: "amount",
        description: "The number of messages that you want to delete",
        type: "INTEGER",
        minValue: 1,
        maxValue: 99,
        required: true
      }],
    //Getting the number of messages the user wantts to delete
    let count = interaction.options.getInteger("amount");

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

/*
Thanks to @EvolutionX-10 for helping out with the minValue & maxValue
*/
