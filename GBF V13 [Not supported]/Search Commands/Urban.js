                urban: {
                    description: "Search the urban dictionary",
                    args: [{
                        name: "query",
                        description: "The search query",
                        type: "STRING",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const question = interaction.options.getString('query');
                        try {
                            const response = await fetch(`https://mashape-community-urban-dictionary.p.rapidapi.com/define?term=${question}`, {
                                method: "GET",
                                headers: {
                                    "x-rapidapi-host": "mashape-community-urban-dictionary.p.rapidapi.com",
                                    "x-rapidapi-key": 'PUT YOUR KEY HERE',
                                },
                            }).then((response) => response.json());

                            let definition;
                            if (response.list[0].definition.length > 1024) {
                                definition = response.list[0].definition.substring(0, 983) + "... \n**Click the Above Link to Continue**";
                            } else {
                                definition = response.list[0].definition;
                            }

                            let example;
                            if (response.list[0].example == "") {
                                example = "None";
                            } else {
                                if (response.list[0].example.length > 1024) {
                                    example = response.list[0].example.substring(0, 983) + "... \n**Click the Above Link to Continue**";
                                } else {
                                    example = response.list[0].example;
                                }
                            }

                            const questionButton = new MessageActionRow()
                                .addComponents(new MessageButton()
                                    .setLabel(question)
                                    .setStyle('LINK')
                                    .setURL(`${response.list[0].permalink}`)
                                );

                            const firstDig = Number(response.list[0].thumbs_up);
                            const secondDig = Number(response.list[0].thumbs_down);

                           const percentageDifference = (((firstDig - secondDig) / firstDig) * 100).toFixed(1);

                            const mainEmbed = new MessageEmbed()
                                .setTitle(`Definition of ${response.list[0].word}`)
                                .setDescription(`${definition}\n\n**Example**\n${example}`)
                                .addFields({
                                    name: "👍",
                                    value: `${response.list[0].thumbs_up}`,
                                    inline: true
                                }, {
                                    name: "👎",
                                    value: `${response.list[0].thumbs_down}`,
                                    inline: true
                                })

                                .setColor(colors.DEFAULT)
                                .setThumbnail('https://cdn.discordapp.com/emojis/839326629544722443.png?v=1')
                                .setURL(`${response.list[0].permalink}`)
                                .setFooter({
                                    text: `Made by ${response.list[0].author}, ${percentageDifference}% upvoted`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [mainEmbed],
                                components: [questionButton]
                            })
                        } catch (error) {
                            const BadSearch = new MessageEmbed()
                                .setTitle(`Search Error`)
                                .setDescription(`I was unable to find ${question}\nPlease provide a valid search query`)
                                .setColor(colors.ERRORRED)
                                .setFooter({
                                    text: `JS: ${error.message}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                            return interaction.reply({
                                embeds: [BadSearch],
                                ephemeral: true
                            })
                        }
                    }
                },
