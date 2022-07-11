                ascii: {
                    description: "Change text to ascii",
                    args: [{
                        name: "text",
                        description: "The text that you want to convert to ascii",
                        type: "STRING",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        let msg = interaction.options.getString('text')

                        const NP1ErrorEmbed = new MessageEmbed()
                            .setTitle(`${emojis.ERROR} NP1 Error `)
                            .setDescription(`Please run \`/error np1\` to know more about the error and how to fix it`)
                            .setColor(colours.ERRORRED)
                            .setTimestamp()

                        await interaction.deferReply({
                            ephemeral: true
                        })

                        figlet.text(msg, function (err, data) {
                            if (err) {
                                console.log("Something went wrong");
                                console.dir(err);
                            }
                            if (data.length > 2000) return interaction.reply({
                                content: "Please provide text shorter than 2000 characters",
                                ephemeral: true
                            })

                            return interaction.channel.send({
                                content: '```' + data + '```'
                            }).catch(err => {
                                console.log(`Ascii Command Error: ${err.message}`)
                                return interaction.reply({
                                    embeds: [NP1ErrorEmbed],
                                    ephemeral: true
                                })
                            })
                        })
                    }
                }
