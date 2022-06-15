
                        //This is the interaction options (For slash commands) https://discordjs.guide/interactions/slash-commands.html#options
                        const targetChannel = interaction.options.getChannel("channel") || interaction.channel;
                        const targetRole = interaction.options.getRole("role");
                        const lockReason = interaction.options.getString("reason") || "No reason provided";
                        //User optional role, this is the role that we will lock the channel for
                        let lockedRole
                        if (targetRole) lockedRole = targetRole.id;
                        else lockedRole = interaction.guild.id;
                        //If the user chose the everyone role, it will display it as @@everyone, so this is my solution to have it just be one @
                        let displayRole
                        if (targetRole) displayRole = `<@&${targetRole.id}>`;
                        else displayRole = `@everyone`;
                        //Embed if the user mentioned a non-text or voice channel
                        const BadChannelType = new MessageEmbed()
                            .setTitle(`${emojis.ERROR} You can't do that`)
                            .setDescription(`I can only lock \`text\` and \`voice\` channels`)
                            .setColor(colours.ERRORRED)
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                        //Checking if the channel type is a GUILD_TEXT
                        //https://discord.js.org/#/docs/discord.js/stable/typedef/ChannelType
                        if (targetChannel.type === 'GUILD_TEXT') {

                            const ChannelAlreadyUnlocked = new MessageEmbed()
                                .setTitle(`${emojis.ERROR} You can't do that`)
                                .setDescription(`The provided channel is already locked for ${displayRole}`)
                                .setColor(colours.ERRORRED)
                                .setFooter({
                                    text: `Requested by: ${interaction.user.username}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                            //Checking if the channel is already locked
                            //https://discord.js.org/#/docs/discord.js/stable/class/BaseGuildTextChannel?scrollTo=permissionsFor
                            if (targetChannel.permissionsFor(lockedRole).has(Permissions.FLAGS.SEND_MESSAGES) === false) return interaction.reply({
                                embeds: [ChannelAlreadyUnlocked],
                                ephemeral: true
                            })
                            //Locking the channel for the user specified role, if it doesn't exist lock for everyone
                            //https://discord.js.org/#/docs/discord.js/stable/class/PermissionOverwriteManager?scrollTo=set
                            targetChannel.permissionOverwrites.set([{
                                id: lockedRole,
                                deny: ['SEND_MESSAGES'],
                            }, ], `Channel locked by ${interaction.user.username}`);

                            const SuccessEmbed = new MessageEmbed()
                                .setTitle(title.SUCCESS)
                                .setDescription(`Successfully locked ${targetChannel} for ${displayRole}`)
                                .setColor(colours.DEFAULT)
                                .setFooter({
                                    text: `Channel locked by ${interaction.user.username} || Reason: ${lockReason}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                                .setTimestamp()

                            return interaction.reply({
                                embeds: [SuccessEmbed]
                            })
                          //Same process but with a voice channel
                        } else if (targetChannel.type === 'GUILD_VOICE') {

                            const ChannelAlreadyUnlocked = new MessageEmbed()
                                .setTitle(`${emojis.ERROR} You can't do that`)
                                .setDescription(`The provided channel is already locked for ${displayRole}`)
                                .setColor(colours.ERRORRED)
                                .setFooter({
                                    text: `Requested by: ${interaction.user.username}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            if (targetChannel.permissionsFor(lockedRole).has("CONNECT") === false) return interaction.reply({
                                embeds: [ChannelAlreadyUnlocked],
                                ephemeral: true
                            })

                            targetChannel.permissionOverwrites.set([{
                                id: lockedRole,
                                deny: ['CONNECT'], //Denying users from connecting to the channel
                            }, ], `Channel locked by ${interaction.user.username}`);

                            const SuccessEmbed = new MessageEmbed()
                                .setTitle(title.SUCCESS)
                                .setDescription(`Successfully locked ${targetChannel} for ${displayRole}`)
                                .setColor(colours.DEFAULT)
                                .setFooter({
                                    text: `Channel locked by ${interaction.user.username} || Reason: ${lockReason}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                                .setTimestamp()

                            return interaction.reply({
                                embeds: [SuccessEmbed]
                            })
                        //If the channel type is not a guild text or voice channel
                        } else return interaction.reply({
                            embeds: [BadChannelType],
                            ephemeral: true
                        })
                    }
