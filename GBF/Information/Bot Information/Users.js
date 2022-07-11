              users: {
                    description: "See GBF's user stats",
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        //The cache is not always accurate and it has given me the wrong number of members alot, so we loop through all of the cachced servers and add their users
                        let totalNumberOfUsers = [];
                        await client.guilds.cache.map(guild => {
                            totalNumberOfUsers.push(guild.memberCount);
                            return totalNumberOfUsers
                        });
                        totalNumberOfUsers = totalNumberOfUsers.reduce((a, b) => a + b, 0);

                        const totalServers = client.guilds.cache.size;

                        const averageUsers = (totalNumberOfUsers / totalServers).toFixed(0);

                        const displayButtons = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                .setLabel(`${totalNumberOfUsers.toLocaleString()} users`)
                                .setStyle("SECONDARY")
                                .setDisabled(true)
                                .setCustomId(`totalUsersDisabled`),
                                new MessageButton()
                                .setLabel(`${totalServers.toLocaleString()} servers`)
                                .setStyle("SECONDARY")
                                .setDisabled(true)
                                .setCustomId(`totalServersDisabled`),
                                new MessageButton()
                                .setLabel(`${averageUsers.toLocaleString()} average users per server`)
                                .setStyle("SECONDARY")
                                .setDisabled(true)
                                .setCustomId(`averageUsersDisabled`)
                            )

                        const usersEmbed = new MessageEmbed()
                            .setTitle(`${client.user.username}'s user stats`)
                            .addFields({
                                name: 'Total users',
                                value: `${totalNumberOfUsers.toLocaleString()}`,
                                inline: true
                            }, {
                                name: 'Total servers',
                                value: `${totalServers.toLocaleString()}`,
                                inline: true
                            }, {
                                name: 'Average users per server',
                                value: `${averageUsers.toLocaleString()}`,
                                inline: true
                            })
                            .setColor(colours.DEFAULT)
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                            .setTimestamp()

                        return interaction.reply({
                            embeds: [usersEmbed],
                            components: [displayButtons]
                        });
                    }
                },
