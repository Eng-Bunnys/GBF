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
