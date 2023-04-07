const SlashCommand = require('../../utils/slashCommands');

const deverloperID = require('./adminIDs.json');

const {
    MessageEmbed
} = require('discord.js');

const colours = require('../../GBFColor.json');
const emojis = require('../../GBFEmojis.json');
const titles = require('../../gbfembedmessages.json');

const botBanSchema = require('../../schemas/GBF Schemas/Bot Ban Schema');

module.exports = class botBans extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "gbf",
            description: "[Developer] GBF Bot Control",
            category: "Developer",
            userPermission: [],
            botPermission: [],
            cooldown: 0,
            development: true,
            devOnly: true,
            subcommands: {
                ban: {
                    description: "Ban a user from using GBF",
                    args: [{
                        name: "user",
                        description: "The user that you want to ban",
                        type: "USER",
                        required: true
                    }, {
                        name: "reason",
                        description: "The reason for the ban",
                        type: "STRING",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const targetUser = interaction.options.getUser("user");
                        const banReason = interaction.options.getString("reason");

                        const banData = await botBanSchema.findOne({
                            userId: targetUser.id
                        })

                        if (banData) return interaction.reply({
                            content: `The user is already banned`,
                            ephemeral: true
                        })

                        const newBanDoc = new botBanSchema({
                            userId: targetUser.id,
                            reason: banReason,
                            timeOfBan: new Date(Date.now()),
                            Developer: interaction.user.id
                        })

                        await newBanDoc.save();

                        const newBan = new MessageEmbed()
                            .setTitle(`${emojis.VERIFY} Success`)
                            .setDescription(`**${targetUser.tag}**[${targetUser.id}] has been banned from GBF Services\nReason: ${banReason}\nBanned By: ${interaction.user.tag}`)
                            .setColor(colours.DEFAULT)
                            .setTimestamp()
                            .setFooter({
                                text: `GBF Security & Anti-Cheat`,
                                iconURL: client.user.displayAvatarURL()
                            })

                        const logsChannel = await client.channels.fetch(deverloperID.GBFLogsChannel);

                        let currentTime = new Date(Date.now());
                        currentTime = currentTime.toLocaleString();
                        currentTime = currentTime.split(",");

                        const dmBan = new MessageEmbed()
                            .setTitle(`📩 You have received a new message`)
                            .setDescription(`You have been **banned** from GBF Services\nReason: ${banReason}\nTime of Ban: ${currentTime}\n\nIf you think this is a mistake, submit a ticket [here](${deverloperID.GBFBanAppeal})`)
                            .setColor(colours.DEFAULT)
                            .setTimestamp()
                            .setFooter({
                                text: `GBF Security & Anti-Cheat`,
                                iconURL: client.user.displayAvatarURL()
                            })

                        const dmBanButton = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                .setLabel("Ban Appeal")
                                .setStyle("LINK")
                                .setURL(deverloperID.GBFBanAppeal)
                            )

                        try {
                            targetUser.send({
                                embeds: [dmBan],
                                components: [dmBanButton]
                            })
                        } catch (err) {
                            console.log(`I couldn't DM ${targetUser.tag}`)
                        }
                        await logsChannel.send({
                            embeds: [newBan]
                        })

                        return interaction.reply({
                            embeds: [newBan]
                        })

                    }
                },
                unban: {
                    description: "Unban a user from using GBF",
                    args: [{
                        name: "user",
                        description: "The user that you want to unban",
                        type: "USER",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const targerUser = interaction.options.getUser("user");

                        const banData = await botBanSchema.findOne({
                            userId: targerUser.id
                        })

                        if (!banData) return interaction.reply({
                            content: `The user is not banned`,
                            ephemeral: true
                        })

                        await botBanSchema.deleteOne({
                            userId: targerUser.id
                        })

                        const newUnban = new MessageEmbed()
                            .setTitle(`${emojis.VERIFY} Success`)
                            .setDescription(`**${targerUser.tag}**[${targerUser.id}] has been unbanned from GBF Services`)
                            .setColor(colours.DEFAULT)
                            .setTimestamp()
                            .setFooter({
                                text: `GBF Security & Anti-Cheat`,
                                iconURL: client.user.displayAvatarURL()
                            })

                        const unBanDm = new MessageEmbed()
                            .setTitle(`📩 You have received a new message`)
                            .setDescription(`You have been **unbanned** from GBF Services`)
                            .setColor(colours.DEFAULT)
                            .setTimestamp()
                            .setFooter({
                                text: `GBF Security & Anti-Cheat`,
                                iconURL: client.user.displayAvatarURL()
                            })

                        try {
                            targerUser.send({
                                embeds: [unBanDm]
                            })
                        } catch (err) {
                            console.log(`I couldn't DM ${targerUser.tag}`)
                        }

                        const logsChannel = await client.channels.fetch(deverloperID.GBFLogsChannel);

                        await logsChannel.send({
                            embeds: [newUnban]
                        })

                        return interaction.reply({
                            embeds: [newUnban]
                        })

                    }
                },
            }
        })
    }
}
