                mimic: {
                    description: "Make a user say whatever you want!",
                    args: [{
                        name: 'user',
                        type: 'USER',
                        description: 'The user that you want to mimic',
                        required: true
                    }, {
                        name: 'text',
                        type: 'STRING',
                        description: 'The text that you want the bot to say',
                        required: true,
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const member = interaction.options.getUser('user');
                        const text = interaction.options.getString('text');

                        const GuildMember = interaction.guild.members.cache.get(member.id);

                        let userDisplayName

                        if (!GuildMember) userDisplayName = member.username
                        else userDisplayName = GuildMember.nickname || member.username

                        const mimicWebhook = await interaction.channel.createWebhook(userDisplayName, {
                            avatar: member.displayAvatarURL({
                                dynamic: true
                            })
                        })

                        const CharacterLimit = new MessageEmbed()
                            .setTitle(`You can't do that`)
                            .setDescription(`Your message is too long, I can only send up to 1024 characters\n\nYour message: ${text.length} characters`)
                            .setColor(colours.ERRORRED)

                        if (text.length >= 1024) return interaction.reply({
                            embeds: [CharacterLimit],
                            ephemeral: true
                        })

                        await interaction.deferReply({
                            ephemeral: true
                        })

                        await mimicWebhook.send({
                            content: `${text}`,
                            allowedMentions: {
                                parse: []
                            }
                        }).then(() => {
                            interaction.editReply({
                                content: `${emojis.VERIFY} Message sent || Feel free to dismiss this message`
                            })
                            return setTimeout(() => mimicWebhook.delete(), 3000);
                        })

                    }
                }
