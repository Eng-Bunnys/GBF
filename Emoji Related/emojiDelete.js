module.exports = (client) => {
    //emojiDelete event : https://discord.js.org/#/docs/discord.js/stable/class/Client?scrollTo=e-emojiDelete
    client.on("emojiDelete", async (emoji) => {
        //Getting information from the database for multi-server bots
        let LogsSettings = await LogsChannel.findOne({
            guildId: emoji.guild.id
        })
    
        let CreateData = await Settings.findOne({
            guildId: emoji.guild.id
        })
        //If no data was found return, for multi-server bots
        if (!CreateData || !LogsSettings || LogsSettings.Channel === null) return;
        //Fetching the user set logs channel
        let logsChannel = emoji.guild.channels.cache.get(LogsSettings.Channel)

        if (CreateData.Enabled === true) {
            //If the channel exists, is viewable and the bot has permissions to send messages in
            if (logsChannel && logsChannel.viewable && logsChannel.permissionsFor(emoji.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
                //Getting the emojis name
                const name = emoji.name
                //Getting the time the emoji was created at, using UNIX timestamp
                const CreatedAt = `<t:${Math.floor(new Date(emoji.createdTimestamp) / 1000)}:F>`
                //Creating the embed that will store all of the information
                const EmojiInfoEmbed = new MessageEmbed()
                    .setTitle(`${emojis.ERROR} An emoji has been deleted in **${emoji.guild.name}**`)
                    .setColor(colours.DEFAULT)
                    .setTimestamp()
                    .addFields({
                        name: "Emoji Name:",
                        value: `${name.replace("_", ' ')}`,
                        inline: true
                    }, {
                        name: "Emoji Type:",
                        value: `${emoji.animated ? 'Animated' : 'Normal'}`,
                        inline: true
                    }, {
                        name: "Emoji Added At:",
                        value: `${CreatedAt}`,
                        inline: true
                    })
                    .setFooter({
                        text: `${emoji.guild.name} logging powered by GBF™`,
                        iconURL: client.user.avatarURL()
                    })
                //Creating a webhook to send the embed to 
                const WebHook = await logsChannel.createWebhook(`${client.user.username} Logging 🚓`, {
                    avatar: client.user.displayAvatarURL({
                        dynamic: true
                    })
                })

                try {
                    await WebHook.send({
                        embeds: [EmojiInfoEmbed]
                    }).then(() => {
                        //Deleting the webhook to not reach the channel limit (10)
                        setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                    })
                } catch (err) {
                    //If an error occured
                    const ErrorEmbed = new MessageEmbed()
                        .setTitle("That wasn't supposed to happen")
                        .setColor(colours.ERRORRED)
                        .setDescription(`Something went wrong while running emoji delete logs 🙁\nJavaScript Error:\n\`\`\`js\n${err}\`\`\``)
                        .setFooter({
                            text: `I've already sent the error to my developers, the issue will be fixed soon!`,
                            iconURL: emoji.guild.iconURL()
                        })
                    logsChannel.send({
                        embeds: [ErrorEmbed]
                    })
                    setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                    return console.log(`Error while running emojiDelete: ${err}`)
                }
            } else return;
        } else return;

    })
}
