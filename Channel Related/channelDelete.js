//Have this function in your utils file, this is just to have better readable names since even if we use a function to change GUILD_TEXT to Guild Text, it's still
//not as good looking/understanable as "Text Channel" to the average discord user
function channelType(channel) {
    let DisplayType
    if (channel.type === "GUILD_TEXT") DisplayType = "Text Channel"
    else if (channel.type === 'GUILD_VOICE') DisplayType = "Voice Channel"
    else if (channel.type === 'GUILD_CATEGORY') DisplayType = "Category Channel"
    else if (channel.type === 'GUILD_NEWS') DisplayType = "News Channel"
    else if (channel.type === 'GUILD_NEWS_THREAD') DisplayType = "News Channel Thread"
    else if (channel.type === 'GUILD_PUBLIC_THREAD') DisplayType = "Public Channel Thread"
    else if (channel.type === 'GUILD_PRIVATE_THREAD') DisplayType = "Private Channel Thread"
    else if (channel.type === 'GUILD_STAGE_VOICE') DisplayType = "Stage Voice Channel"
    else if (channel.type === 'UNKNOWN') DisplayType = "⚠ Unknown Channel Type ⚠"
    return DisplayType
}
//You can juse use an actual function for this, can be found in slowmode.js
function channelSlowMode(channel) {
    let SlowModeTimer
    if (channel.rateLimitPerUser === 0) SlowModeTimer = "No Slowmode"
    else if (channel.rateLimitPerUser === 5) SlowModeTimer = "5s"
    else if (channel.rateLimitPerUser === 10) SlowModeTimer = "10s"
    else if (channel.rateLimitPerUser === 15) SlowModeTimer = "15s"
    else if (channel.rateLimitPerUser === 30) SlowModeTimer = "30s"
    else if (channel.rateLimitPerUser === 60) SlowModeTimer = "1m"
    else if (channel.rateLimitPerUser === 120) SlowModeTimer = "2m"
    else if (channel.rateLimitPerUser === 300) SlowModeTimer = "5m"
    else if (channel.rateLimitPerUser === 600) SlowModeTimer = "10m"
    else if (channel.rateLimitPerUser === 900) SlowModeTimer = "15m"
    else if (channel.rateLimitPerUser === 1800) SlowModeTimer = "30m"
    else if (channel.rateLimitPerUser === 3600) SlowModeTimer = "1h"
    else if (channel.rateLimitPerUser === 7200) SlowModeTimer = "2h"
    else if (channel.rateLimitPerUser === 21600) SlowModeTimer = "6h"
    return SlowModeTimer
}
//Event handler, change it to your own
module.exports = (client) => {
    //channelDelete event : https://discord.js.org/#/docs/discord.js/stable/class/Client?scrollTo=e-channelDelete
    client.on("channelDelete", async (channel) => {
        //Getting data from the database (mongoDB), this is for multi-guild bots
        let LogsSettings = await LogsChannel.findOne({
            guildId: channel.guild.id
        })

        let ChannelDeleteData = await Settings.findOne({
            guildId: channel.guild.id
        })
        //Returning if there is no data
        if (!ChannelDeleteData || !LogsSettings || LogsSettings.Channel === null) return;
        //Fetching the logs channel that is set by the user
        let logsChannel = channel.guild.channels.cache.get(LogsSettings.Channel)

        if (ChannelDeleteData.DeleteEnabled === true) {
            //Checking if the channel exists, is viewable and the bot has permissions to send messages in 
            if (logsChannel && logsChannel.viewable && logsChannel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
                const UnixTimer = `<t:${Math.floor(new Date(channel.createdTimestamp) / 1000)}:F>`
                //Extra features for specific channels, check the channelCreate.js file for more info
                //https://github.com/DepressedBunnys/Discord.JS-Bot-Commands/blob/main/Channel%20Related/channelCreate.js
                let ExtraFeatures
                if (channel.type === "GUILD_TEXT" || channel.type === "GUILD_NEWS") {
                    let DisplayNSFW
                    if (channel.nsfw === true) DisplayNSFW = "True"
                    else if (channel.nsfw === false) DisplayNSFW = "False"
                    ExtraFeatures = `**Age Restricted:** ${DisplayNSFW}\n**Slowmode:** ${channelSlowMode(channel)}`
                } else if (channel.type === 'GUILD_VOICE' || channel.type === 'GUILD_STAGE_VOICE') {
                    let ChannelBitrateReadable = (channel.bitrate / 1000)
                    let ChannelUserLimitReadable
                    if (channel.userLimit === 0) ChannelUserLimitReadable = "No Limit"
                    else ChannelUserLimitReadable = channel.userLimit
                    ExtraFeatures = `**Bitrate:** ${ChannelBitrateReadable} kbps\n**User Limit:** ${ChannelUserLimitReadable.toLocaleString()}`
                } else {
                    ExtraFeatures = "No Channel Specific Features"
                }

                const ChannelDeleteEmbed = new MessageEmbed()
                    .setTitle(`${emojis.VERIFY} A ${channelType(channel)} Has Been Deleted`)
                    .setColor(colours.DEFAULT)
                    .addFields({
                        name: `Channel Name:`,
                        value: `${channel.name}`,
                        inline: true
                    }, {
                        name: `Channel Type:`,
                        value: `${channelType(channel)}`,
                        inline: true
                    }, {
                        name: `Created At:`,
                        value: `${UnixTimer}`,
                        inline: true
                    }, {
                        name: `${channelType(channel)} Specific Features:`,
                        value: `${ExtraFeatures}`,
                        inline: true
                    }, {
                        name: '\u200b',
                        value: '\u200b',
                        inline: true
                    }, {
                        name: '\u200b',
                        value: '\u200b',
                        inline: true
                    })
                    .setTimestamp()
                    .setFooter({
                        text: `${channel.guild.name} logging powered by GBF®`,
                        iconURL: client.user.avatarURL()
                    })
                //Creating the webhook to send to the logs channel
                const WebHook = await logsChannel.createWebhook(`${client.user.username} Logging 🚓`, {
                    avatar: client.user.displayAvatarURL({
                        dynamic: true
                    })
                })

                try {
                    await WebHook.send({
                        embeds: [ChannelDeleteEmbed]
                    }).then(() => {
                         //Deleting the webhook after 3 seconds to avoid limits (10 per channel)
                        setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                    })
                } catch (err) {
                    //If an error occured
                    const ErrorEmbed = new MessageEmbed()
                        .setTitle("That wasn't supposed to happen")
                        .setColor(colours.ERRORRED)
                        .setDescription(`Something went wrong while running channel delete logs 🙁\nJavaScript Error:\n\`\`\`js\n${err}\`\`\``)
                        .setFooter({
                            text: `I've already sent the error to my developers, the issue will be fixed soon!`,
                            iconURL: channel.guild.iconURL()
                        })
                    setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                    logsChannel.send({
                        embeds: [ErrorEmbed]
                    })
                    return console.log(`Error while running channelDelete: ${err}`)
                }
            } else return;
        } else return;
    })
}
