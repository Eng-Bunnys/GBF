                        //Getting the input
                        const targetUser = interaction.options.getUser("user");
                        const warnReason = interaction.options.getString("reason") || "No reason provided";
                        //Emiting a custom made event for logging values
                        await client.emit("userWarn", targetUser, interaction.user);
                        //ID format : # + 6 digits 1-5,000 + random integer
                        //Generating a warn ID with the format above
                        const warnId = `#` + Math.random().toString(36).substring(2, 8) + `${Math.round(Math.random() * 5000)}`;
                        //Some validation
                        if (targetUser.id === interaction.user.id) return interaction.reply({
                            content: `You can't warn yourself! ⚠`,
                            ephemeral: true
                        })
                        if (targetUser.bot) return interaction.reply({
                            content: `You can't warn a bot! ⚠`,
                            ephemeral: true
                        })
                        //Checking if the user already has a schema
                        let warnDocs = await WarnSchema.findOne({
                            userId: targetUser.id,
                            guildId: interaction.guild.id 
                        });
                        //If the user does not have a schema, we create one
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
                            //Sending the confirmation message
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
                            //If data exists we update the schema
                            await warnDocs.updateOne({
                                warns: warnDocs.warns + 1
                            })
                            //Pushing the warnID and reason to the array
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
                            //Sending the confirmation message
                            return interaction.reply({
                                embeds: [userAccountEmbed]
                            })
                        }
