                bite: {
                    description: "Bite someone! Or yourself...",
                    args: [{
                        name: 'user',
                        type: 'USER',
                        description: 'The user that you want to bite',
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const mentionedUser = interaction.options.getUser('user');

                        const res = await fetch("https://api.waifu.pics/sfw/bite");
                        const img = (await res.json()).url;

                        const selfBite = new MessageEmbed()
                            .setTitle("Ummm")
                            .setDescription(`**<@${interaction.user.id}> bit themselves??**`)
                            .setImage(img)
                            .setColor(colors.DEFAULT)
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })

                        const mainEmbed = new MessageEmbed()
                            .setTitle("STOP BITING AAA")
                            .setDescription(`**<@${interaction.user.id}> bites ${mentionedUser}**`)
                            .setImage(img)
                            .setColor(colors.DEFAULT)
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })

                        if (mentionedUser.id === interaction.user.id) {
                            return interaction.reply({
                                embeds: [selfBite]
                            }).catch(err => {
                                return interaction.reply({
                                    content: "Seems like there was something wrong with the API, Please check back later!"
                                })
                            })

                        } else {
                            return interaction.reply({
                                embeds: [mainEmbed]
                            }).catch(err => {
                                return interaction.reply({
                                    content: "Seems like there was something wrong with the API, Please check back later!"
                                })
                            })
                        }
                    }
                }
