                       //Getting the user as a User from the interaction options
                        const mentionedUser = interaction.options.getUser('user') || interaction.user;
                        //Creating a button with the public avatar URL
                        const avatarUserButton = new MessageButton()
                            .setStyle('LINK')
                            .setLabel(`Public Avatar link`)
                            .setURL(`${mentionedUser.displayAvatarURL({ dynamic: true, size: 1024 })}`)
                        //Creating an embed that shows the data
                        const avatarEmbed = new MessageEmbed()
                            .setTitle(`${mentionedUser.tag}'s avatar`)
                            .setDescription(`[Avatar URL](${mentionedUser.displayAvatarURL({ dynamic: true, size: 1024 })})`)
                            .setColor("#e91e63")
                            .setFooter({
                                text: `Requested By: ${interaction.user.tag}`,
                                iconURL: `${interaction.user.displayAvatarURL()}`
                            })
                            .setImage(mentionedUser.displayAvatarURL({  
                                dynamic: true,
                                size: 1024
                            }))
                        //Attempting to fetch the member, you can also use guild.members.cache.get(mentionedUser.id)
                        const fetchedMember = interaction.guild.members.fetch(mentionedUser.id);
                        //Creating an empty button that we will add properties to later
                        const avatarMemberButton = new MessageButton()
                        //If the user is a GuildMember and their server avatar is different from the public avatar
                        if (fetchedMember && (mentionedUser.displayAvatarURL() !== fetchedMember.displayAvatarURL())) {
                            //Setting the properties to the empty button
                            avatarMemberButton.setStyle('LINK')
                            avatarMemberButton.setLabel(`Server Avatar link`)
                            avatarMemberButton.setURL(fetchedMember.displayAvatarURL({
                                dynamic: true
                            }))
                            //Updating the embed to also show the guild avatar
                            avatarEmbed.setDescription(`[Avatar URL](${mentionedUser.displayAvatarURL({ dynamic: true, size: 1024 })})\n[Server Avatar URL](${fetchedMember.displayAvatarURL({ dynamic: true, size: 1024})})`)
                            avatarEmbed.setThumbnail(fetchedMember.displayAvatarURL({
                                dynamic: true
                            }))
                        //If the IF statement returns false
                        } else {
                            //Setting the button as a disabled button with some random URL
                            avatarMemberButton.setStyle("LINK")
                            avatarMemberButton.setLabel("Server Avatar")
                            avatarMemberButton.setDisabled(true)
                            avatarMemberButton.setURL(`https://discordapp.com/assets/322c936a8c8be1b803cd94861bdfa868.png`)
                        }
                        //Creating the message action row that stores all the buttons
                        const buttonRows = new MessageActionRow().addComponents([avatarUserButton, avatarMemberButton])
                        //Sending the embed
                        return interaction.reply({
                            embeds: [avatarEmbed],
                            components: [buttonRows]
                        })
