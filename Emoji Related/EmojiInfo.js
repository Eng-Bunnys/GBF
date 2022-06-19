                        //Getting the emoji
                        const args = interaction.options.getString("emoji");
                        //Looking for it
                        let emoji = interaction.guild.emojis.cache.find(emoji => (emoji.name).toLowerCase() === args.toLowerCase() || emoji.id === args || emoji == args.replace(/([^\d])+/gim, ''));

                        const InvalidEmoji = new MessageEmbed()
                            .setTitle(titles.ERROR)
                            .setDescription("Please provide a valid emoji name or ID and make sure that the emoji is in the current server!")
                            .setColor(colours.ERRORRED)
                         //If the emoji doesn't exist
                        if (!emoji) return interaction.reply({
                            embeds: [InvalidEmoji],
                            ephemeral: true
                        })

                        let suffix;
                        let link;

                        let name = emoji.name

                        let id = emoji.id

                        let linkPre = `https://cdn.discordapp.com/emojis/${id}`

                        if (emoji.animated === true) {
                            suffix = `<a:${name}:${emoji.id}>`
                            link = linkPre + ".gif"
                        } else {
                            suffix = `<:${name}:${emoji.id}>`
                            link = linkPre + ".png"
                        }

                        let mention = suffix

                        const infoemojiembed = new MessageEmbed()
                            .addFields({
                                name: "Emoji:",
                                value: `${emoji}`,
                                inline: false
                            }, {
                                name: "Mention:",
                                value:  `\`${mention}\``,
                                inline: false
                            }, {
                                name: "Name:",
                                value: `\`${name}\``,
                                inline: true
                            }, {
                                name: "ID:",
                                value: `\`${id}\``,
                                inline: true
                            }, {
                                name: "Animated:",
                                value: emoji.animated ? "Animated" : "Not Animated",
                                inline: false
                            })
                            .setColor("#e91e63")
                            .setThumbnail(link)

                        const linkbutton = new MessageButton()
                            .setStyle('LINK')
                            .setURL(link)
                            .setEmoji(emoji)
                            .setLabel(name)

                        const linkrow = new MessageActionRow().addComponents(linkbutton)

                        return interaction.reply({
                            embeds: [infoemojiembed],
                            components: [linkrow]
                        })
                    }
