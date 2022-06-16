module.exports = client => {
    //Message update event : https://discord.js.org/#/docs/discord.js/stable/class/Client?scrollTo=e-messageUpdate
    client.on('messageUpdate', async (oldMessage, newMessage) => {
           //Returning if the author is a bot, if it's a DM channel, if it's a webhook or if the content is the same
        if (newMessage.author.bot || newMessage.channel.type === 'DM' || newMessage.webhookID || oldMessage.content === newMessage.content) return;
        //Trimming the message if it's too long
        if (newMessage.content.length > 1024) newMessage.content = newMessage.content.slice(0, 1021) + '...';

        if (oldMessage.content.length > 1024) oldMessage.content = oldMessage.content.slice(0, 1021) + '...';
         //Fetching data from the databse, for multi-guild bots
        let EditData = await EditLogsSchema.findOne({
            guildId: oldMessage.guild.id
        })

        let LogsChannel = await LogSchema.findOne({
            guildId: oldMessage.guild.id
        })
        //If there's no data then return
        if (!EditData || !LogsChannel) return;

        if (LogsChannel.Channel === null) return;
        //Fetching the channel set by the user
        let editChannel = oldMessage.guild.channels.cache.get(LogsChannel.Channel)

        if (EditData.Enabled === true) {
            //Checking if the channel exists, is viewable by the bot and the bot has permissions to send messages in 
            if (editChannel && editChannel.viewable && editChannel.permissionsFor(newMessage.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {

                    const MessageEditEmbed = new MessageEmbed()
                        .setAuthor({
                            name: `${oldMessage.author.tag}`,
                            iconURL: oldMessage.author.displayAvatarURL()
                        })
                        .setDescription(`Message edited in <#${oldMessage.channel.id}> [Jump to Message!](${newMessage.url})\n**Before**\n${oldMessage.content || '****'}\n**After**\n${newMessage.content || '****'}`)
                        .setFooter({
                            text: `Author ID: ${oldMessage.author.id} | Message ID: ${newMessage.id}`,
                            iconURL: oldMessage.author.displayAvatarURL()
                        })
                        .setColor("#e91e63")
                        .setTimestamp()
                    //Creating a webhook to send to the channel
                    const WebHook = await editChannel.createWebhook(`${client.user.username} Logging 🚓`, {
                        avatar: client.user.displayAvatarURL({
                            dynamic: true
                        })
                    })

                    try {
                        await WebHook.send({
                            embeds: [MessageEditEmbed]
                        }).then(() => {
                            //Deleting the webhook to avoid limits
                            setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                        })
                    } catch (err) {
                        const ErrorEmbed = new MessageEmbed()
                            .setTitle("That wasn't supposed to happen")
                            .setColor(colours.ERRORRED)
                            .setDescription(`Something went wrong while running message edit logs 🙁\nJavaScript Error:\n\`\`\`js\n${err}\`\`\``)
                            .setFooter({
                                text: `I've already sent the error to my developers, the issue will be fixed soon!`,
                                iconURL: newMessage.guild.iconURL()
                            })
                            .setTimestamp()
                        editChannel.send({
                            embeds: [ErrorEmbed]
                        })
                        setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                        return console.log(`Error while running messageUpdate: ${err}`)
                    }

            } else return; //returning if the setting is set as false 
        } else return; //Returning if the channel doesn't exist/isn't viewable/bot can't send messages to 
    })
}
