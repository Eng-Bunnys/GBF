const titles = require('../../gbfembedmessages.json');
const emojis = require('../../GBFEmojis.json');
const colours = require('../../GBFColor.json');

const {
    MessageEmbed,
    MessageButton,
    MessageActionRow,
    Permissions
} = require('discord.js')

const RegisterSchema = require('../../schemas/Freebie Schemas/Server Profile Schema');
const PendingSchema = require('../../schemas/Freebie Schemas/Pending Registry Schema');

const {
    green,
    redBright
} = require('chalk');

const guildChannels = (guild) => {
    let channel;
    if (guild.channels.cache.has(guild.id)) {
        channel = guild.channels.cache.get(guild.id)
        if (channel.permissionsFor(guild.client.user).has(Permissions.FLAGS.SEND_MESSAGES)) {
            return guild.channels.cache.get(guild.id)
        }
    }
    channel = guild.channels.cache.find(channel => channel.name.includes("free") && channel.permissionsFor(guild.client.user).has(Permissions.FLAGS.SEND_MESSAGES) && channel.type === "GUILD_TEXT");
    if (channel) return channel;

    return guild.channels.cache.filter(c => c.type === "GUILD_TEXT" && c.permissionsFor(guild.client.user).has(Permissions.FLAGS.SEND_MESSAGES)).first();
}

module.exports = (client) => {
    client.on("messageCreate", async (message) => {

        if (message.author.id !== '333644367539470337' && message.channel.id !== '932756227295948910') return;
        if (message.author.bot) return;

        if (!message.content.startsWith("accept") && !message.content.startsWith("decline")) return;

        const args = message.content.split(' ');

        const userInputId = args[1];

        let registryID;

        if (!userInputId.includes("#")) registryID = `#${args[1]}`;
        else registryID = args[1];

        let pendingServers = await PendingSchema.findOne({
            ID: registryID
        });

        if (!pendingServers) return message.reply({
            content: `ID not found.`
        });

        let registerData = await RegisterSchema.findOne({
            guildId: pendingServers.guildId
        });

        if (!registerData) return message.reply({
            content: `No data could be found for that server`
        });

        const registeredServer = await client.guilds.fetch(pendingServers.guildId).catch(() => null);

        if (!registeredServer) return message.reply({
            content: `The server is no longer available.`
        });

        const serverAccepted = new MessageEmbed()
            .setTitle(`${emojis.BREAKDANCE} Registered ${emojis.TRACER}`)
            .setColor(colours.DEFAULT)
            .setDescription(`Successfully registered ${registeredServer.name} as a freebie server.\nIf the freebie channel has been deleted, GBF does not have access to it or GBF cannot send messages to it, the freebie system will not work until updated using \`/freebie update\`.`)
            .setFooter({
                text: `GBF Freebie Registration || Accepted by ${message.author.username}`,
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp()

        const serverDeclined = new MessageEmbed()
            .setTitle(`<:rip:984616003759652925> Registry Declined`)
            .setColor(colours.ERRORRED)
            .setDescription(`${registeredServer.name} has been rejected for GBF Freebie Services.\nYou can contact the [GBF team](${'https://discord.gg/PuZMhvhRyX'}) for more information.\nYou can also try again.`)
            .setFooter({
                text: `GBF Freebie Registration`,
                iconURL: client.user.displayAvatarURL()
            })
            .setTimestamp()

        if (message.content.startsWith("accept")) {
            await PendingSchema.deleteOne({
                ID: registryID
            });

            if (pendingServers.Automatic === true) {

                const freebieChannelAuto = await registeredServer.channels.create("Free Games", {
                    type: "GUILD_TEXT",
                    topic: "Paid games that are free for a limited time will be sent here so you never miss out!\nPowered by GBF",
                    reason: "GBF Freebies Automatic option"
                })

                await freebieChannelAuto.permissionOverwrites.set([{
                    id: registeredServer.id,
                    deny: ['SEND_MESSAGES', 'ADD_REACTIONS'],
                    allow: ["VIEW_CHANNEL"]
                }, {
                    id: client.user.id,
                    allow: ['SEND_MESSAGES', 'USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS', 'VIEW_CHANNEL', 'MENTION_EVERYONE', 'MANAGE_CHANNELS'],
                }, ], `GBF Freebie Automatic option`);
            
                await registerData.updateOne({
                    Enabled: true,
                    Channel: freebieChannelAuto.id,
                });

                await freebieChannelAuto.send({
                    embeds: [serverAccepted]
                }).then(() => {
                    console.log(green(`${registeredServer.name} is now a registered GBF Freebie Server`))
                    return message.reply({
                        content: `Successfully registered ${registeredServer.name} as a freebie server.`
                    })
                })

            } else {

                await registerData.updateOne({
                    Enabled: true,
                });

                let freebieChannel = await client.channels.fetch(registerData.Channel).catch(() => null);

                if (!freebieChannel) freebieChannel = guildChannels(registeredServer);

                await freebieChannel.send({
                    embeds: [serverAccepted]
                }).then(() => {
                    console.log(green(`${registeredServer.name} is now a registered GBF Freebie Server`))
                    return message.reply({
                        content: `Successfully registered ${registeredServer.name} as a freebie server.`
                    })
                })

            }
        } else if (message.content.startsWith("decline")) {

            await PendingSchema.deleteOne({
                ID: registryID
            });

            let freebieChannel = await client.channels.fetch(registerData.Channel).catch(() => null);

            await registerData.deleteOne({
                guildId: pendingServers.guildId
            })

            if (!freebieChannel) freebieChannel = guildChannels(registeredServer);

            await freebieChannel.send({
                embeds: [serverDeclined]
            }).then(() => {
                console.log(redBright(`${registeredServer.name} has been declined.`))
                return message.reply({
                    content: `Successfully declined ${registeredServer.name} as a freebie server.`
                })
            })

        }
    })
}
