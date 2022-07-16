                         //Same process as the lock channel.js but this time we're unlocking
                        //Check out that file in order to understand what's going on here
                        const targetChannel = interaction.options.getChannel("channel") || interaction.channel;
                        const targetRole = interaction.options.getRole("role");
                        const lockReason = interaction.options.getString("reason") || "No reason provided";

                        let lockedRole
                        if (targetRole) lockedRole = targetRole.id;
                        else lockedRole = interaction.guild.id;

                        let displayRole
                        if (targetRole) displayRole = `<@&${targetRole.id}>`;
                        else displayRole = `@everyone`;

                        const BadChannelType = new MessageEmbed()
                            .setTitle(`${emojis.ERROR} You can't do that`)
                            .setDescription(`I can only unlock \`text\` and \`voice\` channels`)
                            .setColor(colours.ERRORRED)
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })

                        if (targetChannel.type === 'GUILD_TEXT') {

                            const ChannelAlreadyUnlocked = new MessageEmbed()
                                .setTitle(`${emojis.ERROR} You can't do that`)
                                .setDescription(`The provided channel is already unlocked for ${displayRole}`)
                                .setColor(colours.ERRORRED)
                                .setFooter({
                                    text: `Requested by: ${interaction.user.username}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            if (targetChannel.permissionsFor(lockedRole).has("SEND_MESSAGES") === true) return interaction.reply({
                                embeds: [ChannelAlreadyUnlocked],
                                ephemeral: true
                            })

                            targetChannel.permissionOverwrites.set([{
                                id: lockedRole,
                                allow: ['SEND_MESSAGES'],
                            }, ], `Channel unlocked by ${interaction.user.username}`);

                            const SuccessEmbed = new MessageEmbed()
                                .setTitle(title.SUCCESS)
                                .setDescription(`Successfully unlocked ${targetChannel} for ${displayRole}`)
                                .setColor(colours.DEFAULT)
                                .setFooter({
                                    text: `Channel unlocked by ${interaction.user.username} || Reason: ${lockReason}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                                .setTimestamp()

                            return interaction.reply({
                                embeds: [SuccessEmbed]
                            })

                        } else if (targetChannel.type === 'GUILD_VOICE') {

                            const ChannelAlreadyUnlocked = new MessageEmbed()
                                .setTitle(`${emojis.ERROR} You can't do that`)
                                .setDescription(`The provided channel is already unlocked for ${displayRole}`)
                                .setColor(colours.ERRORRED)
                                .setFooter({
                                    text: `Requested by: ${interaction.user.username}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            if (targetChannel.permissionsFor(lockedRole).has("CONNECT") === true) return interaction.reply({
                                embeds: [ChannelAlreadyUnlocked],
                                ephemeral: true
                            })

                            targetChannel.permissionOverwrites.set([{
                                id: lockedRole,
                                allow: ['CONNECT'],
                            }, ], `Channel ulocked by ${interaction.user.username}`);

                            const SuccessEmbed = new MessageEmbed()
                                .setTitle(title.SUCCESS)
                                .setDescription(`Successfully unlocked ${targetChannel} for ${displayRole}`)
                                .setColor(colours.DEFAULT)
                                .setFooter({
                                    text: `Channel unlocked by ${interaction.user.username} || Reason: ${lockReason}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                                .setTimestamp()

                            return interaction.reply({
                                embeds: [SuccessEmbed]
                            })

                        } else return interaction.reply({
                            embeds: [BadChannelType],
                            ephemeral: true
                        })
