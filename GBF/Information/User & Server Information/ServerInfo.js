                serverinfo: {
                    description: "Show's information about the current server",
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const boosttier = {
                            "NONE": "0",
                            "TIER_1": "1",
                            "TIER_2": "2",
                            "TIER_3": "3"
                        }

                        const titleCase = str => {
                            return str.toLowerCase().replace(/_/g, " ").split(" ")
                                .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
                                .join(" ")
                        }

                        const ServerInformationEmbed = new MessageEmbed()
                            .setTitle(`${interaction.guild.name}`)
                            .setThumbnail(interaction.guild.iconURL({
                                dynamic: true
                            }) ?? "https://i.imgur.com/AWGDmiu.png")
                            .setDescription(`${interaction.guild.name} was created on ${`<t:${Math.round(new Date(interaction.guild.createdTimestamp) / 1000)}:F>`}`)
                            .setColor(colours.DEFAULT)
                            .addFields({
                                name: "Total Members",
                                value: `${interaction.guild.memberCount}`,
                                inline: true
                            }, {
                                name: "Total Humans",
                                value: `${interaction.guild.members.cache.filter((member) => !member.user.bot).size}`,
                                inline: true
                            }, {
                                name: "Total Bots",
                                value: `${interaction.guild.members.cache.filter((member) => member.user.bot).size}`,
                                inline: true
                            }, {
                                name: "Categories",
                                value: `${interaction.guild.channels.cache.filter((c) => c.type == "GUILD_CATEGORY").size}`,
                                inline: true
                            }, {
                                name: "Text Channels",
                                value: `${interaction.guild.channels.cache.filter((c) => c.type === "GUILD_TEXT").size}`,
                                inline: true
                            }, {
                                name: "Voice Channels",
                                value: `${interaction.guild.channels.cache.filter((c) => c.type === "GUILD_VOICE").size}`,
                                inline: true
                            }, {
                                name: "Role Count",
                                value: `${interaction.guild.roles.cache.size}`,
                                inline: true
                            }, {
                                name: "Boosts",
                                value: `${interaction.guild.premiumSubscriptionCount}`,
                                inline: true
                            }, {
                                name: "Boost Tier",
                                value: `${boosttier[interaction.guild.premiumTier]}`,
                                inline: true
                            }, {
                                name: "Explicit Content Filter",
                                value: `${titleCase(interaction.guild.explicitContentFilter)}`,
                                inline: true
                            }, {
                                name: "Verification Level",
                                value: `${titleCase(interaction.guild.verificationLevel)}`,
                                inline: true
                            }, {
                                name: "AFK Channel",
                                value: `${interaction.guild.afkChannel ?? "None"}`,
                                inline: true
                            }, {
                                name: "AFK Timeout",
                                value: (interaction.guild.afkChannel) ? `${moment.duration(interaction.guild.afkTimeout * 1000).asMinutes()} minute(s)` : "None",
                                inline: true
                            }, {
                                name: "Owner",
                                value: `<@${interaction.guild.ownerId}>`,
                                inline: true
                            }, {
                                name: "Region",
                                value: `${interaction.guild.preferredLocale}`,
                                inline: true
                            })
                            .setFooter({
                                text: `Server ID: ${interaction.guild.id}`,
                                iconURL: interaction.guild.iconURL()
                            })

                        if (interaction.guild.description) {
                            ServerInformationEmbed.addFields({
                                name: "Server Description",
                                value: `${interaction.guild.description ?? 'No description'}`,
                                inline: true
                            })
                        }

                        if (interaction.guild.bannerURL()) {
                            ServerInformationEmbed.addFields({
                                name: "Server Banner",
                                value: `[Banner URL](${interaction.guild.bannerURL()})`,
                                inline: true
                            })
                        }

                        if (interaction.guild.features.length > 0) {
                            let guildFeatures = ``
                            for (let i = 0; i < interaction.guild.features.length; i++) {
                                guildFeatures = guildFeatures + `${interaction.guild.features[i]}, `
                            }
                            ServerInformationEmbed.addFields({
                                name: "Server Features",
                                value: `${capitalize(guildFeatures)}`,
                                inline: false
                            })
                        }
                        return interaction.reply({
                            embeds: [ServerInformationEmbed]
                        })
                    }
                },
