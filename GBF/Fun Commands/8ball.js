              ['8ball']: {
                    description: "Ask the magic 8ball a question",
                    args: [{
                        name: "question",
                        description: "The question you want to ask the magic 8ball",
                        type: "STRING",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const MessageArgs = interaction.options.getString('question');

                        const answers = ['Yes', 'No', 'Maybe', 'Ask Later', 'No time to tell now', 'As I see it, yes.', 'Cannot predict now.', 'Concentrate and ask again.', 'It is certain.', 'I don\'t know '] // All the responses
                        const response = answers[Math.floor(Math.random() * answers.length)]

                        const answerEmbed = new MessageEmbed()
                            .setTitle("🎱 Magic 8Ball")
                            .setDescription(`**Question »** ${MessageArgs} \n **Answer »** ${response}`)
                            .setColor(colours.DEFAULT)
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                        return interaction.reply({
                            embeds: [answerEmbed]
                        })
                    }
                }
