      options: [{
        name: "amount",
        description: "The number of messages that you want to delete",
        type: Constants.ApplicationCommandOptionTypes.INTEGER, //This is here to stop the user from inputting a non-real number which might cause the bot to break
        minValue: 1, //This is here to avoid the user from entering negative/0, and to reduce the code size by not having to add our own validation and letting discord handle it
        maxValue: 100,
        required: true
      }],
        
    const count = interaction.options.getInteger("amount"); //Getting the user's input by slash

    const messagesToBeDeleted = await interaction.channel.messages.fetch({
      limit: count
    }); //Fetching the messages that will be deleted

    await interaction.channel.bulkDelete(messagesToBeDeleted, true); //Using the .bulkDelete to delete the messages, true is there to avoid errors with old messages

    const successEmbed = new MessageEmbed()
      .setTitle(`${emojis.VERIFY} Success!`)
      .setColor(colours.DEFAULT)
      .setDescription(`Successfully deleted **${count}** messages`)
      .setFooter({
        text: `This message auto-deletes in 5 seconds`,
        iconURL: interaction.user.displayAvatarURL()
      })
    //Sending a confirmation message to the user
    await interaction.reply({
      embeds: [successEmbed]
    })
    //Deleting the reply 
    setTimeout(() => interaction.deleteReply(), 5000);
