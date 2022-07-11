const SlashCommand = require('../../utils/slashCommands');

const {
    delay
} = require('../../utils/engine');

const {
    MessageEmbed,
    MessageButton,
    MessageActionRow,
    MessageSelectMenu
} = require('discord.js');

const title = require('../../gbfembedmessages.json');
const colours = require('../../GBFColor.json');
const emojis = require('../../GBFEmojis.json');

const duration = require('humanize-duration');

const moment = require("moment")

const LiveVersion = require('../../GBF Info.json');

const np1 = "API error, After sometime has passed you can try again and it should be working"
const db2 = "Database error, If it is related to the server menu please rerun the command and it will work"
const perm3 = "Permission error, The bot does not have the required permissions to do a certain action"
const perm4 = "Permission error, The user does not have the required perimissions to run a certain command"
const ban5 = "User has been banned from using the bot"
const toggle6 = "Command has been disabled from the server"
const UnknownBanE = `The user is not banned in the server`

module.exports = class BotSub extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "bot",
            description: "General bot commands",
            category: "Bot-Info",
            botPermission: ['SEND_MESSAGES', 'EMBED_LINKS'],
            cooldown: 2,
            development: true,
            subcommands: {
                invite: {
                    description: "GBF related links",
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const Links = new MessageActionRow()
                            .addComponents(new MessageButton()
                                .setLabel('Bot Invite link')
                                .setStyle('LINK')
                                .setEmoji('<:GBFLogo:838990392128307231>')
                                .setURL('https://discord.com/api/oauth2/authorize?client_id=795361755223556116&permissions=1642787765494&scope=bot%20applications.commands'),
                            )
                            .addComponents(new MessageButton()
                                .setLabel('Support server')
                                .setStyle('LINK')
                                .setEmoji('<:LogoTransparent:838994085527945266>')
                                .setURL('https://discord.gg/PuZMhvhRyX'),
                            )
                            .addComponents(new MessageButton()
                                .setLabel('Top.gg')
                                .setStyle('LINK')
                                .setEmoji('<:tog:882279600506433607>')
                                .setURL('https://top.gg/bot/795361755223556116/vote'),
                            )
                            .addComponents(new MessageButton()
                                .setLabel('Patreon')
                                .setStyle('LINK')
                                .setEmoji('<:patreon:882279599394930699>')
                                .setURL('https://www.patreon.com/GBFBot'),
                            );

                        const inviteEmbed = new MessageEmbed()

                            .setTitle(`${emojis.VERIFY} GBF Links`)
                            .addFields({
                                name: 'Invite me to your server!',
                                value: (`- [Bot invite link](${'https://discord.com/api/oauth2/authorize?client_id=795361755223556116&permissions=1642787765494&scope=bot%20applications.commands'})`),
                                inline: true
                            }, {
                                name: 'Support server!',
                                value: (`- [Support server link](${'https://discord.gg/PuZMhvhRyX'})`),
                                inline: true
                            }, {
                                name: "\u200b",
                                value: '\u200b',
                                inline: true
                            }, {
                                name: `Vote for ${client.user.username} on Top.gg!`,
                                value: `- [Vote here](${'https://top.gg/bot/795361755223556116/vote'})`,
                                inline: true
                            }, {
                                name: `Support ${client.user.username} on Patreon!`,
                                value: `- [Patreon link](${'https://www.patreon.com/GBFBot'})`,
                                inline: true
                            }, {
                                name: "\u200b",
                                value: '\u200b',
                                inline: true
                            })
                            .setColor(colours.DEFAULT)
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })

                        return interaction.reply({
                            embeds: [inviteEmbed],
                            components: [Links]
                        });
                    }
                },
                uptime: {
                    description: "See how long GBF has been awake",
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const NP1ErrorEmbed = new MessageEmbed()
                            .setTitle(`${emojis.ERROR} NP1 Error `)
                            .setDescription(`Please run \`/error np1\` to know more about the error and how to fix it`)
                            .setColor(colours.ERRORRED)
                            .setTimestamp()

                        let uptime = duration(client.uptime, {
                            units: ["y", "mo", "w", "d", "h", "m", "s"],
                            round: true
                        });

                        const UptimeEmbed = new MessageEmbed()
                            .setTitle(`${client.user.username}'s uptime`)
                            .setDescription(uptime)
                            .setColor(colours.DEFAULT)
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })

                        return interaction.reply({
                            embeds: [UptimeEmbed]
                        }).catch(err => {
                            console.log(`Uptime Command Error: ${err.message}`)
                            return interaction.reply({
                                embeds: [NP1ErrorEmbed],
                                ephemeral: true
                            })
                        })
                    }
                },
                users: {
                    description: "See GBF's user stats",
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        let totalNumberOfUsers = [];
                        await client.guilds.cache.map(guild => {
                            totalNumberOfUsers.push(guild.memberCount);
                            return totalNumberOfUsers
                        });
                        totalNumberOfUsers = totalNumberOfUsers.reduce((a, b) => a + b, 0);

                        const totalServers = client.guilds.cache.size;

                        const averageUsers = (totalNumberOfUsers / totalServers).toFixed(0);

                        const displayButtons = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                .setLabel(`${totalNumberOfUsers.toLocaleString()} users`)
                                .setStyle("SECONDARY")
                                .setDisabled(true)
                                .setCustomId(`totalUsersDisabled`),
                                new MessageButton()
                                .setLabel(`${totalServers.toLocaleString()} servers`)
                                .setStyle("SECONDARY")
                                .setDisabled(true)
                                .setCustomId(`totalServersDisabled`),
                                new MessageButton()
                                .setLabel(`${averageUsers.toLocaleString()} average users per server`)
                                .setStyle("SECONDARY")
                                .setDisabled(true)
                                .setCustomId(`averageUsersDisabled`)
                            )

                        const usersEmbed = new MessageEmbed()
                            .setTitle(`${client.user.username}'s user stats`)
                            .addFields({
                                name: 'Total users',
                                value: `${totalNumberOfUsers.toLocaleString()}`,
                                inline: true
                            }, {
                                name: 'Total servers',
                                value: `${totalServers.toLocaleString()}`,
                                inline: true
                            }, {
                                name: 'Average users per server',
                                value: `${averageUsers.toLocaleString()}`,
                                inline: true
                            })
                            .setColor(colours.DEFAULT)
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                            .setTimestamp()

                        return interaction.reply({
                            embeds: [usersEmbed],
                            components: [displayButtons]
                        });
                    }
                },
                ping: {
                    description: "Check GBF's ping 🏓",
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const pingEmbed = new MessageEmbed()
                            .setTitle(`Pong 🏓`)
                            .setDescription(`Bot Ping: \`${Math.abs(Date.now() - interaction.createdTimestamp)}ms\`\nAPI Latency: \`${Math.round(client.ws.ping)}ms\``)
                            .setColor(colours.DEFAULT)

                        return interaction.reply({
                            embeds: [pingEmbed]
                        });

                    }
                },
                errors: {
                    description: "GBF Bot errors",
                    args: [{
                        name: "error",
                        description: "The error code",
                        type: 'STRING',
                        choices: [{
                            name: 'NP1',
                            value: 'np1'
                        }, {
                            name: 'DB2',
                            value: 'db2'
                        }, {
                            name: 'Perm3',
                            value: 'perm3'
                        }, {
                            name: 'Perm4',
                            value: 'perm4'
                        }, {
                            name: 'Ban5',
                            value: 'ban5'
                        }, {
                            name: 'Toggle6',
                            value: 'toggle6'
                        }, {
                            name: 'UnknownBanE',
                            value: 'UnknownBanE'
                        }, {
                            name: 'List',
                            value: 'list'
                        }],
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const errorType = interaction.options.getString('error')

                        if (errorType === 'np1') {
                            const np1error = new MessageEmbed()
                                .setTitle('NP1 Error')
                                .setColor(colours.DEFAULT)
                                .setDescription(`⚠ ${np1}`)
                                .setFooter({
                                    text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [np1error]
                            })
                        } else if (errorType === 'db2') {

                            const db2error = new MessageEmbed()
                                .setTitle('DB2 Error')
                                .setColor(colours.DEFAULT)
                                .setDescription(`⚠ ${db2}`)
                                .setFooter({
                                    text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [db2error]
                            })
                        } else if (errorType === 'perm3') {
                            const perm3error = new MessageEmbed()
                                .setTitle('PERM3 Error')
                                .setColor(colours.DEFAULT)
                                .setDescription(`⚠ ${perm3}`)
                                .setFooter({
                                    text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [perm3error]
                            })
                        } else if (errorType === 'perm4') {
                            const perm4error = new MessageEmbed()
                                .setTitle('PERM4 Error')
                                .setColor(colours.DEFAULT)
                                .setDescription(`⚠ ${perm4}`)
                                .setFooter({
                                    text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [perm4error]
                            })
                        } else if (errorType === 'ban5') {
                            const ban5error = new MessageEmbed()
                                .setTitle('BAN5 Error')
                                .setColor(colours.DEFAULT)
                                .setDescription(`⚠ ${ban5}`)
                                .setFooter({
                                    text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [ban5error]
                            })
                        } else if (errorType === 'toggle6') {
                            const toggle6error = new MessageEmbed()
                                .setTitle('TOGGLE6 Error')
                                .setColor(colours.DEFAULT)
                                .setDescription(`⚠ ${toggle6}`)
                                .setFooter({
                                    text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [toggle6error]
                            })
                        } else if (errorType === 'UnknownBanE') {
                            const UnknownBanEerror = new MessageEmbed()
                                .setTitle('UnknownBanE Error')
                                .setColor(colours.DEFAULT)
                                .setDescription(`⚠ ${UnknownBanE}`)
                                .setFooter({
                                    text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [UnknownBanEerror]
                            })
                        } else if (errorType === 'list') {

                            const valuetext = `\`Please use the slash list to choose the error\``

                            const listembed = new MessageEmbed()

                                .setTitle('GBF ERRORS')
                                .setColor(colours.DEFAULT)
                                .setTimestamp()
                                .addFields({
                                    name: `${emojis.ERROR} NP1`,
                                    value: valuetext
                                }, {
                                    name: `${emojis.ERROR} DB2`,
                                    value: valuetext
                                }, {
                                    name: `${emojis.ERROR} PERM3`,
                                    value: valuetext
                                }, {
                                    name: `${emojis.ERROR} PERM4`,
                                    value: valuetext
                                }, {
                                    name: `${emojis.ERROR} BAN5`,
                                    value: valuetext
                                }, {
                                    name: `${emojis.ERROR} TOGGLE6`,
                                    value: valuetext
                                }, {
                                    name: `${emojis.ERROR} UnknownBanE`,
                                    value: valuetext
                                })
                                .setFooter({
                                    text: `Requested by: ${interaction.user.username}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [listembed]
                            })
                        }
                    }
                },
            }
        })
    }
}
