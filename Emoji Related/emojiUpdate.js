//A little function that capitalizes the first litter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = (client) => {
    //Emoji Update event : https://discord.js.org/#/docs/discord.js/stable/class/Client?scrollTo=e-emojiUpdate
    client.on("emojiUpdate", async (oldEmoji, newEmoji) => {
        //Getting data from the database, for multi-guild bots
        let LogsModule = await LogsChannel.findOne({
            guildId: newEmoji.guild.id
        })

        let ModuleData = await Settings.findOne({
            guildId: newEmoji.guild.id
        })
        //If the no data was found, for multi-guild bots
        if (!ModuleData || !LogsModule || LogsModule.Channel === null) return;
        //Fetching the logs channel to send the message to, for multi-guild bots
        let logsChannel = newEmoji.guild.channels.cache.get(LogsModule.Channel)

        if (ModuleData.Enabled === true) {
            //If the fetched channel exists, is viewable and the bot has permissions to send messages to
            if (logsChannel && logsChannel.viewable && logsChannel.permissionsFor(newEmoji.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
                //Creating the embed that contains all the information
                const NewEmojiInfoEmbed = new MessageEmbed()
                    //Replacing the _ that discord auto adds for better readability
                    .setTitle(`${newEmoji} The emoji "${capitalizeFirstLetter(oldEmoji.name).replace("_", ' ')}" has been updated`)
                    .setColor(colours.DEFAULT)
                    .setTimestamp()
                    .setFooter({
                        text: `${newEmoji.guild.name} logging powered by GBF™`,
                        iconURL: client.user.avatarURL()
                    })
                //Checking if the emoji name changed
                if (oldEmoji.name !== newEmoji.name) {
                    NewEmojiInfoEmbed.addField("Emoji Name", `**New:** ${capitalizeFirstLetter(newEmoji.name).replace("_", ' ')}\n**Old:** ${capitalizeFirstLetter(oldEmoji.name).replace("_", ' ')}`, true)
                }
                //Adding if the emoji is animated or not, I put this here so it will always be the last field even if the name changed
                NewEmojiInfoEmbed.addFields({
                    name: "Emoji Type",
                    value: `${newEmoji.animated ? 'Animated' : 'Normal'}`,
                    inline: true
                })
                //Creating a webhook to use to send the message with
                const WebHook = await logsChannel.createWebhook(`${client.user.username} Logging 🚓`, {
                    avatar: client.user.displayAvatarURL({
                        format: 'png',
                        dynamic: true
                    })
                })

                try {
                    await WebHook.send({
                        embeds: [NewEmojiInfoEmbed]
                    }).then(() => {
                        //Deleting the webhook after sending the message to avoid the channel limit (10)
                        setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                    })
                } catch (err) {
                    //If an error occured
                    const ErrorEmbed = new MessageEmbed()
                        .setTitle("That wasn't supposed to happen")
                        .setColor(colours.ERRORRED)
                        .setDescription(`Something went wrong while running emoji update logs 🙁\nJavaScript Error:\n\`\`\`js\n${err}\`\`\``)
                        .setFooter({
                            text: `I've already sent the error to my developers, the issue will be fixed soon!`,
                            iconURL: newEmoji.guild.iconURL()
                        })
                    logsChannel.send({
                        embeds: [ErrorEmbed]
                    })
                    setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                    return console.log(`Error while running emojiUpdate: ${err}`)
                }
            } else return;
        } else return;
    })
}
