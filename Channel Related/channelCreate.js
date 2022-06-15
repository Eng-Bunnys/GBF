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
    //Channel create event : https://discord.js.org/#/docs/discord.js/stable/class/Client?scrollTo=e-channelCreate
    client.on("channelCreate", async (channel) => {
        //Using Audit logs to get who created the channel : https://discord.js.org/#/docs/discord.js/stable/class/Guild?scrollTo=fetchAuditLogs
        const fetchedLogs = await channel.guild.fetchAuditLogs({
            limit: 1,
            type: 'CHANNEL_CREATE',
        });
        //Getting the first entry from the fetched audit logs
        const channelLog = fetchedLogs.entries.first();
  
        const {
            executor
        } = channelLog;
         //Getting data from the databse using mongoDB, remove this if it's not a multi-server bot
        let LogsSettings = await LogsChannel.findOne({
            guildId: channel.guild.id
        })

        let CreateData = await Settings.findOne({
            guildId: channel.guild.id
        })
         //Checking if database data exists
        if (!CreateData || !LogsSettings || LogsSettings.Channel === null) return;
        //Getting the set logging channel
        let logsChannel = channel.guild.channels.cache.get(LogsSettings.Channel)
      
        if (CreateData.CreateEnabled === true) {
            //Checking if the channel exists, is viewable by the bot and the bot can send messages in it
            if (logsChannel && logsChannel.viewable && logsChannel.permissionsFor(channel.guild.me).has(Permissions.FLAGS.SEND_MESSAGES)) {
                //Getting the UNIX timestamp that the channel was created at, you can also just use Date.now() / 1000 other than all of that but oh well
                const UnixTimer = `<t:${Math.round(new Date(channel.createdTimestamp) / 1000)}:F>`
                 //This is here because not every channel has the same properties 
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

                const ChannelCreatedEmbed = new MessageEmbed()
                    .setTitle(`${emojis.VERIFY} A New ${channelType(channel)} Has Been Created`)
                    .setColor(colours.DEFAULT)
                    .addFields({
                        name: `Channel Name`,
                        value: `${channel.name}`,
                        inline: true
                    }, {
                        name: `Channel ID`,
                        value: `${channel.id}`,
                        inline: true
                    }, {
                        name: `Channel Type`,
                        value: `${channelType(channel)}`,
                        inline: true
                    }, {
                        name: `Created At`,
                        value: `${UnixTimer}`,
                        inline: true
                    }, {
                        name: 'Go To Channel',
                        value: `<#${channel.id}>`,
                        inline: true
                    }, {
                        name: `${channelType(channel)} Specific Features:`,
                        value: `${ExtraFeatures}`,
                        inline: true
                    })
                    .setTimestamp()
                    .setFooter({
                        text: `${channel.guild.name} logging powered by GBF™`,
                        iconURL: client.user.avatarURL()
                    })

                const WebHook = await logsChannel.createWebhook(`${client.user.username} Logging 🚓`, {
                    avatar: client.user.displayAvatarURL({
                        dynamic: true
                    })
                })

                try {
                    await WebHook.send({
                        embeds: [ChannelCreatedEmbed]
                    }).then(() => {
                        setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                    })

                } catch (err) {
                    const ErrorEmbed = new MessageEmbed()
                        .setTitle("That wasn't supposed to happen")
                        .setColor(colours.ERRORRED)
                        .setDescription(`Something went wrong while running channel create logs 🙁\nJavaScript Error:\n\`\`\`js\n${err}\`\`\``)
                        .setFooter({
                            text: `I've already sent the error to my developers, the issue will be fixed soon!`,
                            iconURL: channel.guild.iconURL()
                        })
                    setTimeout(() => WebHook.delete().catch(err => console.log(err)), 3000)
                    logsChannel.send({
                        embeds: [ErrorEmbed]
                    })
                    return console.log(`Error while running channelCreate: ${err}`)
                }
            } else return;
        } else return;

    })
}
