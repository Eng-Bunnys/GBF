                        const targetUser = interaction.options.getUser("user");
                        const warnReason = interaction.options.getString("reason") || "No reason provided";
                       // await client.emit("userWarn", targetUser, interaction.user);
                        //ID format : # + 6 digits 1-5,000 + random integer that goes up to 5000
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
