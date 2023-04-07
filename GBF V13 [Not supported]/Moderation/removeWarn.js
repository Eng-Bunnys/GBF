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
