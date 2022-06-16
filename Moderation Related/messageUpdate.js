module.exports = client => {
    client.on('messageUpdate', async (oldMessage, newMessage) => {

        if (newMessage.author.bot || newMessage.channel.type === 'dm' || newMessage.webhookID || oldMessage.content === newMessage.content) return;

        if (newMessage.content.length > 1024) newMessage.content = newMessage.content.slice(0, 1021) + '...';

        if (oldMessage.content.length > 1024) oldMessage.content = oldMessage.content.slice(0, 1021) + '...';

        let EditData = await EditLogsSchema.findOne({
            guildId: oldMessage.guild.id
        })

        let LogsChannel = await LogSchema.findOne({
            guildId: oldMessage.guild.id
        })

        if (!EditData || !LogsChannel) return;

        if (LogsChannel.Channel === null) return;

        let editChannel = oldMessage.guild.channels.cache.get(LogsChannel.Channel)

        if (EditData.Enabled === true) {
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

                    const WebHook = await editChannel.createWebhook(`${client.user.username} Logging 🚓`, {
                        avatar: client.user.displayAvatarURL({
                            dynamic: true
                        })
                    })

                    try {
                        await WebHook.send({
                            embeds: [MessageEditEmbed]
                        }).then(() => {
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

            } else return;
        } else return;
    })
}
