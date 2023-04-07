                anime: {
                    description: "Shows info about an anime",
                    args: [{
                        name: 'anime',
                        type: 'STRING',
                        description: 'The anime that you want to search',
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const search = interaction.options.getString('anime');

                        const data = await malScraper.getInfoFromName(`${search}`);

                        const malEmbed = new MessageEmbed()
                            .setAuthor({
                                name: `My Anime List search result for ${search}`.split(',').join(' '),
                                iconURL: interaction.user.displayAvatarURL({
                                    dynamic: true,
                                    size: 512
                                })
                            })
                            .setThumbnail(data.picture)
                            .setColor('#e91e63')
                            .addField('Premiered', `\`${data.premiered}\``, true)
                            .addField('Broadcast', `\`${data.broadcast}\``, true)
                            .addField('Genres', `\`${data.genres}\``, true)
                            .addField('English Title', `\`${data.englishTitle}\``, true)
                            .addField('Japanese Title', `\`${data.japaneseTitle}\``, true)
                            .addField('Type', `\`${data.type}\``, true)
                            .addField('Episodes', `\`${data.episodes}\``, true)
                            .addField('Rating', `\`${data.rating}\``, true)
                            .addField('Aired', `\`${data.aired}\``, true)
                            .addField('Score', `\`${data.score}\``, true)
                            .addField('Favorite', `\`${data.favorites}\``, true)
                            .addField('Ranked', `\`${data.ranked}\``, true)
                            .addField('Duration', `\`${data.duration}\``, true)
                            .addField('Studios', `\`${data.studios}\``, true)
                            .addField('Popularity', `\`${data.popularity}\``, true)
                            .addField('Members', `\`${data.members}\``, true)
                            .addField('Score Stats', `\`${data.scoreStats}\``, true)
                            .addField('Source', `\`${data.source}\``, true)
                            .addField('Synonyms', `\`${data.synonyms}\``, true)
                            .addField('Status', `\`${data.status}\``, true)
                            .addField('Identifier', `\`${data.id}\``, true)
                            .addField('Link', data.url, true)
                            .setFooter({
                                text: `Requested by: ${interaction.user.tag}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })

                        const linkToAnime = new MessageButton()
                            .setStyle('LINK')
                            .setLabel(data.englishTitle)
                            .setURL(data.url)

                        const buttonRow = new MessageActionRow().addComponents([linkToAnime])

                        await interaction.reply({
                            embeds: [malEmbed],
                            components: [buttonRow]
                        }).catch(err => {
                            console.log(`Anime Command Error: ${err.message}`)
                            return interaction.reply({
                                content: `I can't find ${search}, try to use it's real name if your using an abbreviation`,
                                ephemeral: true
                            })
                        })
                    }
                },
