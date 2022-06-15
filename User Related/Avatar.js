                        //Getting the user using slash command options
                        const mentionedUser = interaction.options.getUser('user') || interaction.user;
                        //Creating a button that takes you to their avatar URL
                        const avatarbutton = new MessageButton()
                            .setStyle('LINK')
                            .setLabel(`${mentionedUser.username}'s avatar link`)
                            .setURL(`${mentionedUser.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })}`)

                        const row = new MessageActionRow().addComponents([avatarbutton])
                         //The embed
                        const avatarembed = new MessageEmbed()
                            .setTitle(`${mentionedUser.tag}'s avatar`)
                             //Hyper link to the avatar URL
                            .setDescription(`[Avatar URL](${mentionedUser.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })})`)
                            .setColor("#e91e63")
                            .setFooter({
                                text: `Requested By: ${interaction.user.tag}`,
                                iconURL: `${interaction.user.displayAvatarURL()}`
                            })
                             //Displaying the avatar
                            .setImage(mentionedUser.displayAvatarURL({
                                format: 'png',
                                dynamic: true,
                                size: 1024
                            }))

                        return interaction.reply({
                            embeds: [avatarembed],
                            components: [row]
                        })
                    }
