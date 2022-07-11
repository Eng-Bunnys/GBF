                say: {
                    description: "Make me say whatever you want!",
                    args: [{
                        name: "text",
                        description: "The text that you want me to say",
                        type: "STRING",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const userMessage = interaction.options.getString("text");

                        await interaction.deferReply({
                            ephemeral: true
                        })

                        const CharacterLimit = new MessageEmbed()
                            .setTitle(`You can't do that`)
                            .setDescription(`Your message is too long, I can only send up to 1024 characters\n\nYour message: ${userMessage.length} characters`)
                            .setColor(colours.ERRORRED)

                        if (userMessage.length > 1024) return interaction.reply({
                            embeds: [CharacterLimit],
                            ephemeral: true
                        })

                        await interaction.channel.send({
                            content: `${userMessage}`,
                            allowedMentions: {
                                parse: []
                            }
                        }).then(() => {
                            return interaction.editReply({
                                content: `${emojis.VERIFY} Message sent || Feel free to dismiss this message`
                            })
                        })

                    }
                }
