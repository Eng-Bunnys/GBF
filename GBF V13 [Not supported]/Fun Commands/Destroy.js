                destroy: {
                    description: "Create a message with a timer 👀",
                    args: [{
                        name: "message",
                        description: "The message that you want to create",
                        type: "STRING",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const msg = interaction.options.getString('message');

                        const MessageSent = await interaction.reply({
                            content: msg,
                            allowedMentions: {
                                parse: []
                            },
                            fetchReply: true
                        })

                        setTimeout(() => interaction.editReply({
                            content: "This message is going to blow up any second now! 💣",
                            allowedMentions: false
                        }), 2500);

                        setTimeout(() => interaction.editReply({
                            content: "GET DOWN IT'S GONNA EXPLODE!!",
                            allowedMentions: false
                        }), 5000);

                        setTimeout(() => interaction.editReply({
                            content: "https://tenor.com/view/saussi%C3%A7on-explode-boom-gif-16089684",
                            allowedMentions: false
                        }), 8000);

                        setTimeout(() => MessageSent.delete(), 10000);

                    }
                },
