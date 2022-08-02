module.exports = (client) => {
    //Message delete event : https://discord.js.org/#/docs/discord.js/stable/class/Client?scrollTo=e-messageDelete
    client.on("messageDelete", async (message) => {
        //Returning if the author is a bot and if the message is an embed
        if (message.author.bot) return;
        if (message.embeds.length > 0) return;
        //Getting data from the database, for multi-guild bots
        let LogsChannel = await LogSchema.findOne({
            guildId: message.guild.id
        })

        let DeleteData = await DeleteLogsSchemas.findOne({
            guildId: message.guild.id
        })
        //Returning if there's no data
        if (!DeleteData || !LogsChannel || LogsChannel.Channel === null) return;
        //Fetching the channel that was set by the user
        let deleteChannel = message.guild.channels.cache.get(LogsChannel.Channel)

        if (DeleteData.Enabled === true) {
            //Checking if the channel exists, is viewable and the bot can send messages in it
            if (deleteChannel && deleteChannel.viewable && deleteChannel.permissionsFor(message.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
                //Splitting the message if it's larger than 1024 chars 
                if (message.content.length > 1024) message.content = message.content.slice(0, 1021) + '...';
                //If the message contains an attachment 
                if (message.attachments.size) {
                     //Removing the underscores to make the text easier to read
                    const NameWithNoUnderScores = message.attachments.first().name.replace('_', ' ');

                    const FileDeleted = new MessageEmbed()
                        .setAuthor({
                            name: `${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL()
                        })
                        .setColor("#e91e63")
                        .setFooter({
                            text: `User ID: ${message.author.id}`
                        })
                        .setTimestamp()
                    //If the message had contnet with it other than the attachment
                    if (message.content.length > 0) FileDeleted.setDescription(`**A message and file(s) (${message.attachments.size} file(s)) sent by <@${message.author.id}> has been deleted in ${message.channel}**\n\n**Message:** ${message.content}\n**File Name:** ${NameWithNoUnderScores}\n**File Size:** ${(message.attachments.first().size / 1000).toFixed(2)} KB\n**File URL:** [${NameWithNoUnderScores}](${message.attachments.first().url})`)
                    else FileDeleted.setDescription(`**A file(s) (${message.attachments.size} file(s)) sent by <@${message.author.id}> has been deleted in ${message.channel}**\n\nDue to restrictions on the Discord API, I cannot show you the file.\n**File Name:** ${NameWithNoUnderScores}\n**File Size:** ${(message.attachments.first().size / 1000).toFixed(2)} KB\n**File URL:** [${NameWithNoUnderScores}](${message.attachments.first().url})`)
                    //Creating a webhook to send to the logs channel
                    const WebHook = await deleteChannel.createWebhook(`${client.user.username} Logging 🚓`, {
                        avatar: client.user.displayAvatarURL({
                            dynamic: true
                        })
                    })

                    try {
                        await WebHook.send({
                            embeds: [FileDeleted]
                        }).then(() => {
                            //Deleting the webhook after 3 seconds to avoid reaching the limit (10)
                            setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                        })
                        return
                    } catch (err) {
                        const ErrorEmbed = new MessageEmbed()
                            .setTitle("That wasn't supposed to happen")
                            .setColor(colours.ERRORRED)
                            .setDescription(`Something went wrong while running message delete logs 🙁\nJavaScript Error:\n\`\`\`js\n${err}\`\`\``)
                            .setFooter({
                                text: `I've already sent the error to my developers, the issue will be fixed soon!`,
                                iconURL: newMessage.guild.iconURL()
                            })
                            .setTimestamp()
                        deleteChannel.send({
                            embeds: [ErrorEmbed]
                        })
                        setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                        return console.log(`Error while running messageDelete: ${err}`)
                    }

                }
                //Same thing as above but without an attachment, just a normal message delete
                const MessageDeletedEmbed = new MessageEmbed()
                    .setAuthor({
                        name: `${message.author.tag}`,
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setDescription(`**A message sent by <@${message.author.id}> has been deleted in ${message.channel}**\n Message: ${message.content}`)
                    .setColor("#e91e63")
                    .setFooter({
                        text: `User ID: ${message.author.id}`
                    })
                    .setTimestamp()

                const WebHook = await deleteChannel.createWebhook(`${client.user.username} Logging 🚓`, {
                    avatar: client.user.displayAvatarURL({
                        dynamic: true
                    })
                })

                try {
                    await WebHook.send({
                        embeds: [MessageDeletedEmbed]
                    }).then(() => {
                        console.log(`Deleting webhook`)
                        setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                    })
                } catch (err) {
                    const ErrorEmbed = new MessageEmbed()
                        .setTitle("That wasn't supposed to happen")
                        .setColor(colours.ERRORRED)
                        .setDescription(`Something went wrong while running message delete logs 🙁\nJavaScript Error:\n\`\`\`js\n${err}\`\`\``)
                        .setFooter({
                            text: `I've already sent the error to my developers, the issue will be fixed soon!`,
                            iconURL: newMessage.guild.iconURL()
                        })
                    deleteChannel.send({
                        embeds: [ErrorEmbed]
                    })
                    setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                    return console.log(`Error while running messageDelete: ${err}`)
                }

            } else return; //returning if the guild setting is set to false
        } else return; //returning if the channel is not viewable/bot cannot send messages to it/does not exist
    })
}
