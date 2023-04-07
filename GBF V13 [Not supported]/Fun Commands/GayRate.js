                gayrate: {
                    description: "Gay rate machine",
                    args: [{
                        name: "user",
                        description: "The user that you want to use this machine on",
                        type: "USER",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const member = interaction.options.getUser('user') || interaction.user;

                        const gayEmbed = new MessageEmbed()
                            .setTitle("Gay rate machine 🏳️‍🌈")
                            .setDescription(`${member.username} is **${Math.floor(Math.random() * 100)}%** gay 🏳️‍🌈`)
                            .setColor(colours.DEFAULT)

                        return interaction.reply({
                            embeds: [gayEmbed]
                        })
                    }
                }
