                        //Getting data from the database that's related to the server
                        let warnDocs = await WarnSchema.find({
                            guildId: interaction.guild.id
                        });

                        const NoData = new MessageEmbed()
                            .setTitle(`${emojis.ERROR} No Data Found`)
                            .setDescription(`I couldn't find that ID in my database.`)
                            .setColor(colours.ERRORRED)
                            .setFooter({
                                text: `${interaction.guild.name} moderation powered by GBF™`,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                        //If the server has no warn data
                        if (!warnDocs) return interaction.reply({
                            embeds: [NoData],
                            ephemeral: true
                        })  
                        //If the schema exists but has no data
                        if (warnDocs.warnID.length === 0 || warnDocs.warnReason.length === 0 || warnDocs.warns === 0) return interaction.reply({
                            embeds: [NoData],
                            ephemeral: true
                        })
                        //Getting the user specific data using the warnID provided in the args, we do this step incase the user didn't add the # before
                        let providedId
                        if (interaction.options.getString("id").includes("#")) providedId = interaction.options.getString('id');
                        else providedId = `#` + interaction.options.getString('id');
                        //Checking if the warnID exists in the database
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
                        //Finding the data related to the warnID
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
                        //Fetching the user
                        const targetUser = await interaction.guild.members.cache.get(targetDetails.userId);
                        //If the user is not in the server
                        if (!targetUser) return interaction.reply({
                            embeds: [notInGuild],
                            ephemeral: true
                        })
                        //Getting the warn reason associated with the ID
                        const warnReasonDisplay = targetDetails.warnReason[targetDetails.warnID.indexOf(providedId)];
                        
                        let index = warnDocs.warnID.indexOf(providedId);
                        //Removing the data from the schema
                        warnDocs.warnID.splice(index, 1);
                        warnDocs.warnReason.splice(index, 1);
                        warnDocs.warns--;
                        await warnDocs.save().catch(e => {
                            console.error("Error:", e)
                        })

                        //Sending the user the confirmation message
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
