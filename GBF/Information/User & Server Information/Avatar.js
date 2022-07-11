                avatar: {
                    description: "Get the avatar of a user or your own avatar",
                    args: [{
                        name: "user",
                        description: "The member that you want to get their avatar",
                        type: "USER",
                        required: false
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const mentionedUser = interaction.options.getUser('user') || interaction.user;
                        const avatarUserButton = new MessageButton()
                            .setStyle('LINK')
                            .setLabel(`Public Avatar link`)
                            .setURL(`${mentionedUser.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}`)

                        const avatarEmbed = new MessageEmbed()
                            .setTitle(`${mentionedUser.tag}'s avatar`)
                            .setDescription(`[Avatar URL](${mentionedUser.displayAvatarURL({ dynamic: true, size: 1024 })})`)
                            .setColor("#e91e63")
                            .setFooter({
                                text: `Requested By: ${interaction.user.tag}`,
                                iconURL: `${interaction.user.displayAvatarURL()}`
                            })
                            .setImage(mentionedUser.displayAvatarURL({
                                format: 'png',
                                dynamic: true,
                                size: 1024
                            }))

                        const fetchedMember = interaction.guild.members.cache.get(mentionedUser.id);

                        const avatarMemberButton = new MessageButton()

                        if (fetchedMember && (mentionedUser.displayAvatarURL() !== fetchedMember.displayAvatarURL())) {
                            avatarMemberButton.setStyle('LINK')
                            avatarMemberButton.setLabel(`Server Avatar link`)
                            avatarMemberButton.setURL(fetchedMember.displayAvatarURL({
                                dynamic: true
                            }))
                            avatarEmbed.setDescription(`[Avatar URL](${mentionedUser.displayAvatarURL({ dynamic: true, size: 1024 })})\n[Server Avatar URL](${fetchedMember.displayAvatarURL({ dynamic: true, size: 1024})})`)
                            avatarEmbed.setThumbnail(fetchedMember.displayAvatarURL({
                                dynamic: true
                            }))
                        } else {
                            avatarMemberButton.setStyle("LINK")
                            avatarMemberButton.setLabel("Server Avatar")
                            avatarMemberButton.setDisabled(true)
                            avatarMemberButton.setURL(`https://discordapp.com/assets/322c936a8c8be1b803cd94861bdfa868.png`)
                        }

                        const buttonRows = new MessageActionRow().addComponents([avatarUserButton, avatarMemberButton])

                        return interaction.reply({
                            embeds: [avatarEmbed],
                            components: [buttonRows]
                        })
                    }
                },
