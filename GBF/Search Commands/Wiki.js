                wiki: {
                    description: "Search the wiki for a topic",
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
                        const wiki = interaction.options.getString('query');

                        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki)}` ;

                        let response;
                        try {
                            response = await fetch(url).then(res => res.json()) 
                        } catch (e) {
                            console.log(e);
                            return interaction.reply({
                                content: "I ran into an error, try again later",
                                ephemeral: true
                            }) 
                        }
                        //Multiple results
                        try {
                            if (response.type === 'disambiguation') { 
                                const mainembed = new MessageEmbed()
                                    .setTitle(response.title) 
                                    .setThumbnail(`https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/2244px-Wikipedia-logo-v2.svg.png`)
                                    .setDescription(`${response.extract}\nLinks For Topic You Searched [Link](${response.content_urls.desktop.page}).`)
                                    .setColor(colors.DEFAULT)
                                    .setURL(response.content_urls.desktop.page)
                                    .setFooter({
                                        text: `Requested by: ${interaction.user.username}`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                return interaction.reply({
                                    embeds: [mainembed]
                                })
                            //One result
                            } else { 
                                const otherembed = new MessageEmbed()
                                    .setTitle(response.title) 
                                    .setDescription(response.extract)
                                    .setThumbnail(`https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/2244px-Wikipedia-logo-v2.svg.png`)
                                    .setColor(colors.DEFAULT)
                                    .setFooter({
                                        text: `Requested by: ${interaction.user.username}`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })
                                    .setURL(response.content_urls.desktop.page)
                                return interaction.reply({
                                    embeds: [otherembed]
                                })
                            }
                        } catch {
                            const NotFound = new MessageEmbed()
                                .setTitle(`${emojis.ERROR} Invalid Query`)
                                .setDescription(`I can't find anything for \`${wiki}\`\nPlease provide a valid query.`)
                                .setColor("e91e63")
                                .setFooter({
                                    text: `Requested by: ${interaction.user.username}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [NotFound],
                                ephemeral: true
                            })
                        }
                    }
                }
