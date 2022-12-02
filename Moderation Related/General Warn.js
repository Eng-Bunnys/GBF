const {
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    Permissions
} = require('discord.js');

const SlashCommand = require('../../utils/slashCommands');

const WarnSchema = require('../../schemas/Moderation Schemas/Warn-Schema.js');

const title = require('../../gbfembedmessages.json');
const colours = require('../../GBFColor.json');
const emojis = require('../../GBFEmojis.json');

const {
    MessageSplit,
    delay
} = require("../../utils/engine");

module.exports = class WarnCommands extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "warn",
            description: "Warn commands",
            category: "Moderation",
            userPermission: ["ADMINISTRATOR"],
            botPermission: [],
            cooldown: 2,
            development: false,
            subcommands: {
                add: {
                    description: "Give a user a warning",
                    args: [{
                        name: "user",
                        description: "The user that you want to warn",
                        type: "USER",
                        required: true
                    }, {
                        name: "reason",
                        description: "The reason behind the warning",
                        type: "STRING",
                        required: false
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const targetUser = interaction.options.getUser("user");
                        const warnReason = interaction.options.getString("reason") || "No reason provided";
                        await client.emit("userWarn", targetUser, interaction.user);
                        //ID format : # + 6 digits 1-5,000 + random integer
                        const warnId = `#` + Math.random().toString(36).substring(2, 8) + `${Math.round(Math.random() * 5000)}`;

                        if (targetUser.id === interaction.user.id) return interaction.reply({
                            content: `You can't warn yourself! ⚠`,
                            ephemeral: true
                        })
                        if (targetUser.bot) return interaction.reply({
                            content: `You can't warn a bot! ⚠`,
                            ephemeral: true
                        })

                        let warnDocs = await WarnSchema.findOne({
                            userId: targetUser.id,
                            guildId: interaction.guild.id
                        });

                        if (!warnDocs) {
                            let newWarnDoc = new WarnSchema({
                                guildId: interaction.guild.id,
                                userId: targetUser.id,
                                warns: 1,
                                warnID: [warnId],
                                warnReason: [warnReason]
                            });
                            await newWarnDoc.save().catch(e => {
                                console.error("Error:", e)
                            })

                            const systemSuccess = new MessageEmbed()
                                .setTitle(`${emojis.VERIFY} User warned`)
                                .setColor(colours.DEFAULT)
                                .addFields({
                                    name: "Target:",
                                    value: `${targetUser}`,
                                    inline: true
                                }, {
                                    name: "Moderator:",
                                    value: `${interaction.user}`,
                                    inline: true
                                }, {
                                    name: "Reason:",
                                    value: `${warnReason}`,
                                    inline: true
                                }, {
                                    name: "User Warns:",
                                    value: `1`,
                                    inline: true
                                }, {
                                    name: "Warn ID:",
                                    value: `${warnId}`,
                                    inline: true
                                }, {
                                    name: "\u200b",
                                    value: `\u200b`,
                                    inline: true
                                })
                                .setFooter({
                                    text: `${interaction.guild.name} moderation powered by GBF™`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [systemSuccess]
                            })

                        } else {
                            await warnDocs.updateOne({
                                warns: warnDocs.warns + 1
                            })
                            warnDocs.warnID.push(warnId);
                            warnDocs.warnReason.push(warnReason);
                            await warnDocs.save().catch(e => {
                                console.error("Error:", e)
                            })
                            const userAccountEmbed = new MessageEmbed()
                                .setTitle(`${emojis.VERIFY} User warned`)
                                .setColor(colours.DEFAULT)
                                .addFields({
                                    name: "Target:",
                                    value: `${targetUser}`,
                                    inline: true
                                }, {
                                    name: "Moderator:",
                                    value: `${interaction.user}`,
                                    inline: true
                                }, {
                                    name: "Reason:",
                                    value: `${warnReason}`,
                                    inline: true
                                }, {
                                    name: "User Warns:",
                                    value: `${(warnDocs.warns + 1).toLocaleString()}`,
                                    inline: true
                                }, {
                                    name: "Warn ID:",
                                    value: `${warnId}`,
                                    inline: true
                                }, {
                                    name: "\u200b",
                                    value: "\u200b",
                                    inline: true
                                })
                                .setFooter({
                                    text: `${interaction.guild.name} moderation powered by GBF™`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [userAccountEmbed]
                            })
                        }
                    }
                },
                remove: {
                    description: "Remove a warning from a user",
                    args: [{
                        name: "id",
                        description: "The ID of the warning that you want to remove || Use all to remove all warnings",
                        type: "STRING",
                        required: true
                    }, {
                        name: "user-id",
                        description: "Required if you want to remove all warnings from a user, skip if you want to remove just one warning",
                        type: "USER"
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        let warnDocs = await WarnSchema.findOne({
                            guildId: interaction.guild.id
                        });

                        const NoData = new MessageEmbed()
                            .setTitle(`${emojis.ERROR} No Data Found`)
                            .setDescription(`I couldn't find that ID/User in my database.`)
                            .setColor(colours.ERRORRED)
                            .setFooter({
                                text: `${interaction.guild.name} moderation powered by GBF™`,
                                iconURL: interaction.user.displayAvatarURL()
                            })

                        if (!warnDocs) return interaction.reply({
                            embeds: [NoData],
                            ephemeral: true
                        })

                        if (warnDocs.warnID.length === 0 || warnDocs.warnReason.length === 0 || warnDocs.warns === 0) return interaction.reply({
                            embeds: [NoData],
                            ephemeral: true
                        })

                        if (interaction.options.getString("id").toLowerCase() === "all") {
                            if (interaction.options.getUser("user-id")) {

                                const targetUserData = await WarnSchema.findOne({
                                    userId: interaction.options.getUser("user-id").id,
                                    guildId: interaction.guild.id
                                })

                                if (!targetUserData) return interaction.reply({
                                    embeds: [NoData],
                                    ephemeral: true
                                })

                                const deletedAllWarns = new MessageEmbed()
                                .setTitle(`${emojis.VERIFY} All Warnings Removed`)
                                .setColor(colours.DEFAULT)
                                .addFields({
                                    name: "User:",
                                    value: `${interaction.options.getUser("user-id").tag}`,
                                }, {
                                    name: "Moderator:",
                                    value: `${interaction.user.tag}`,
                                },{
                                    name: "Warns Removed:",
                                    value: `${targetUserData.warns}`,
                                })
                                .setFooter({
                                    text: `${interaction.guild.name} moderation powered by GBF™`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                                .setTimestamp()

                                await targetUserData.deleteOne();

                                return interaction.reply({
                                    embeds: [deletedAllWarns]
                                })

                            } else return interaction.reply({
                                content: `You are required to specify a user if you want to remove all warning.`,
                                ephemeral: true
                            })
                        } else {
                            let providedId
                            if (interaction.options.getString("id").includes("#")) providedId = interaction.options.getString('id');
                            else providedId = `#` + interaction.options.getString('id');

                            if (!warnDocs.warnID.includes(providedId)) {
                                const IDNotFound = new MessageEmbed()
                                    .setTitle(`${emojis.ERROR} You can't do that`)
                                    .setDescription(`That ID doesn't exist, check the IDs by using /warn total`)
                                    .setColor(colours.ERRORRED)
                                    .setFooter({
                                        text: `${interaction.guild.name} moderation powered by GBF™`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })
                                return interaction.reply({
                                    embeds: [IDNotFound],
                                    ephemeral: true
                                })
                            }

                            let targetDetails = await WarnSchema.findOne({
                                warnID: providedId
                            });

                            const notInGuild = new MessageEmbed()
                                .setTitle(`${emojis.ERROR} You can't do that`)
                                .setDescription(`That user is no longer in ${interaction.guild.name}\nUser ID: ${targetDetails.userId}`)
                                .setColor(colours.ERRORRED)
                                .setFooter({
                                    text: `${interaction.guild.name} moderation powered by GBF™`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                            const targetUser = await interaction.guild.members.cache.get(targetDetails.userId);

                            if (!targetUser) return interaction.reply({
                                embeds: [notInGuild],
                                ephemeral: true
                            })

                            const warnReasonDisplay = targetDetails.warnReason[targetDetails.warnID.indexOf(providedId)];

                            let index = warnDocs.warnID.indexOf(providedId);
                            warnDocs.warnID.splice(index, 1);
                            warnDocs.warnReason.splice(index, 1);
                            warnDocs.warns--;
                            await warnDocs.save().catch(e => {
                                console.error("Error:", e)
                            })

                            const systemSuccess = new MessageEmbed()
                                .setTitle(`${emojis.VERIFY} Warning removed`)
                                .setColor(colours.DEFAULT)
                                .setDescription(`Removed a warning from ${targetUser.user.tag} : ${targetUser.user.username} now has ${(warnDocs.warns).toLocaleString()} warnings`)
                                .addFields({
                                    name: "User:",
                                    value: `${targetUser}`,
                                    inline: true
                                }, {
                                    name: "Moderator:",
                                    value: `${interaction.user}`,
                                    inline: true
                                }, {
                                    name: "Warn ID:",
                                    value: `${providedId}`,
                                    inline: true
                                }, {
                                    name: "User Warns:",
                                    value: `${(warnDocs.warns).toLocaleString()}`,
                                    inline: true
                                }, {
                                    name: "Reason For Warn:",
                                    value: `${warnReasonDisplay}`,
                                    inline: true
                                }, {
                                    name: "\u200b",
                                    value: "\u200b",
                                    inline: true
                                })
                                .setFooter({
                                    text: `${interaction.guild.name} moderation powered by GBF™`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                            return interaction.reply({
                                embeds: [systemSuccess]
                            })
                        }
                    }
                },
                total: {
                    description: "Get all of the warnings in this server or for a specific user",
                    args: [{
                        name: "user",
                        description: "The user that you want to get the warnings for",
                        type: "USER",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const user = interaction.options.getUser("user");

                        let userWarnDocs = await WarnSchema.findOne({
                            userId: user.id,
                            guildId: interaction.guild.id
                        });

                        const NoData = new MessageEmbed()
                            .setTitle(`${emojis.ERROR} No Data Found`)
                            .setDescription(`I couldn't find any warn data on ${user.tag} in ${interaction.guild.name}`)
                            .setColor(colours.ERRORRED)
                            .setFooter({
                                text: `${interaction.guild.name} moderation powered by GBF™`,
                                iconURL: interaction.user.displayAvatarURL()
                            })

                        if (!userWarnDocs) return interaction.reply({
                            embeds: [NoData],
                            ephemeral: true
                        })

                        if (userWarnDocs.warnID.length === 0 || userWarnDocs.warnReason.length === 0 || userWarnDocs.warns === 0) return interaction.reply({
                            embeds: [NoData],
                            ephemeral: true
                        })

                        let userDataArray = []
                        for (let i = 0; i < userWarnDocs.warnID.length; i++) {
                            userDataArray.push(`**${i + 1}:** ${userWarnDocs.warnID[i]} - ${userWarnDocs.warnReason[i]}`)
                        }
                        userDataArray = MessageSplit(userDataArray, 450);

                        const embeds = []
                        const pages = {} // {userId: pageNumber }

                        for (let a = 0; a < userDataArray.length; a++) {
                            let pageNumber = a + 1
                            embeds.push(new MessageEmbed().setDescription(`${userDataArray[pageNumber - 1]}`).setColor(colours.DEFAULT).setTitle(`${user.username}'s warning data`).setFooter({
                                text: `${interaction.guild.name} moderation powered by GBF™ || Page ${a + 1} / ${userDataArray.length}`,
                                iconURL: interaction.user.displayAvatarURL()
                            }))
                        }

                        const getRow = (id) => {
                            const MainButtonsRow = new MessageActionRow();
                            MainButtonsRow.addComponents(
                                new MessageButton()
                                .setCustomId('firstPage')
                                .setStyle("SECONDARY")
                                .setEmoji("⏮")
                                .setDisabled((pages[id] === 0))
                            );
                            MainButtonsRow.addComponents(
                                new MessageButton()
                                .setCustomId("prevEmbed")
                                .setStyle("SECONDARY")
                                .setEmoji("◀")
                                .setDisabled(pages[id] === 0)
                            );
                            MainButtonsRow.addComponents(
                                new MessageButton()
                                .setCustomId("nextEmbed")
                                .setStyle("SECONDARY")
                                .setEmoji("▶")
                                .setDisabled(pages[id] === embeds.length - 1)
                            );
                            MainButtonsRow.addComponents(
                                new MessageButton()
                                .setCustomId('finalPage')
                                .setStyle("SECONDARY")
                                .setEmoji("⏭")
                                .setDisabled(pages[id] === embeds.length - 1)
                            );
                            MainButtonsRow.addComponents(
                                new MessageButton()
                                .setCustomId("end")
                                .setStyle("DANGER")
                                .setLabel("Close")
                                .setEmoji(emojis.ERROR)
                                .setDisabled(false)
                            );
                            return MainButtonsRow;
                        };

                        let id = interaction.user.id;

                        pages[id] = pages[id] || 0;

                        const embed = embeds[pages[id]];

                        await interaction.reply({
                            embeds: [embed],
                            components: [getRow(id)]
                        })

                        const filter = i => {
                            return i.user.id === interaction.user.id;
                        };

                        const collector = interaction.channel.createMessageComponentCollector({
                            filter,
                            idle: 15000,
                            time: 300000
                        });

                        collector.on('collect', async i => {
                            await i.deferUpdate();
                            await delay();

                            if (i.customId === 'prevEmbed') {
                                pages[id]--;
                                if (pages[id] < 0) pages[id] = 0;
                                await interaction.editReply({
                                    embeds: [embeds[pages[id]]],
                                    components: [getRow(id)],
                                });
                            } else if (i.customId === 'nextEmbed') {
                                pages[id]++;
                                if (pages[id] > embeds.length - 1) pages[id] = embeds.length - 1;
                                await interaction.editReply({
                                    embeds: [embeds[pages[id]]],
                                    components: [getRow(id)],
                                });
                            } else if (i.customId === 'end') {
                                await collector.stop();
                            } else if (i.customId === 'firstPage') {
                                pages[id] = 0;
                                await interaction.editReply({
                                    embeds: [embeds[pages[id]]],
                                    components: [getRow(id)],
                                });
                            } else if (i.customId === 'finalPage') {
                                pages[id] = embeds.length - 1;
                                await interaction.editReply({
                                    embeds: [embeds[pages[id]]],
                                    components: [getRow(id)],
                                });
                            }
                        })

                        collector.on('end', async i => {
                            const MainButtonsRowDisabled = new MessageActionRow();
                            MainButtonsRowDisabled.addComponents(
                                new MessageButton()
                                .setCustomId("prev_embedD")
                                .setStyle("SECONDARY")
                                .setEmoji("⏮")
                                .setDisabled(true)
                            );
                            MainButtonsRowDisabled.addComponents(
                                new MessageButton()
                                .setCustomId("next_embedD")
                                .setStyle("SECONDARY")
                                .setEmoji("⏭")
                                .setDisabled(true)
                            );

                            await interaction.editReply({
                                components: [MainButtonsRowDisabled]
                            })
                        })
                    }
                },
            }
        })
    }
}
