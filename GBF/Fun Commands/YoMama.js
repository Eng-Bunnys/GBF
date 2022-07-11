                yomama: {
                    description: "Yomama so dumb she had to check the command description",
                    args: [{
                        name: "target",
                        description: "The person to perform the epic troll on",
                        type: "USER"
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const member = interaction.options.getUser('target') || interaction.user

                        const emoji = `<:trollface:838959517965353060>`

                        const ran = Math.floor(Math.random() * 5)

                        const res = await fetch('https://api.yomomma.info');
                        let joke = (await res.json()).joke;
                        joke = joke.charAt(0).toLowerCase() + joke.slice(1);
                        if (!joke.endsWith('!') && !joke.endsWith('.') && !joke.endsWith('"')) joke += '!';

                        if (member.id === client.user.id) {
                            if (ran >= 3 && ran <= 5 || ran === 0) {
                                return interaction.reply({
                                    content: `${interaction.user.username}, ${joke} ${emoji}`
                                })
                            } else {
                                return interaction.reply({
                                    content: `${interaction.user.username}, ${joke}`
                                })
                            }
                        }

                        if (ran >= 3 && ran <= 5 || ran === 0) {
                            return interaction.reply({
                                content: `${member.username}, ${joke} ${emoji}`
                            })
                        } else {
                            return interaction.reply({
                                content: `${member.username}, ${joke}`
                            })
                        }
                    }
                }
