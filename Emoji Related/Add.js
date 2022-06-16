                    const MissingPerms = new MessageEmbed()
                            .setTitle("Missing Permissions")
                            .setDescription(`You are missing the following permissions: \`Manage Emojis\``)
                            .setColor("#e91e63")
                          //Checking if the user has the Manage emojis permission
                        if (!interaction.member.permissions.has("MANAGE_EMOJIS")) return interaction.reply({
                            embeds: [MissingPerms],
                            ephemeral: true
                        })
                        //Regex to make sure the url provided is an image
                        const emojisregex = RegExp("/https?:\/\//gi/\.(png|jpg|jpeg|webp)$/gi");
                        const args = interaction.options.getString("emoji");
                        const emojiName = interaction.options.getString("name");
                        try {
                            let emojisRegex
                            //Testing the link provided
                            emojisRegex = emojisregex.test(args) ? emojisregex.exec(args) : args;

                            const TooLong = new MessageEmbed()
                                .setTitle(titles.ERROR)
                                .setDescription(`Emoji name must be between 2 and 32 characters long\n**${emojiName}** is ${emojiName.length} characters`)
                                .setColor(colours.ERRORRED)
                            //Validation for the emoji name
                            if (emojiName.length < 2 || emojiName.length > 32) return interaction.reply({
                                embeds: [TooLong],
                                ephemeral: true
                            })
                            let emojiadd
                            //Adding the emoji to the server
                            try {
                                 emojiadd = await interaction.guild.emojis.create(emojisRegex, emojiName)
                            } catch (e) {
                                console.log(e)
                            }
                            const emojiembed = new MessageEmbed()
                                .setTitle(`${emojis.VERIFY} Successfully added the emoji: **${emojiadd.name}**`)
                                .setDescription(`Emoji name: ${emojiadd.name}\nEmoji ID: ${emojiadd.id}\nURL: [Emoji URL](${emojisRegex})\nAdded by: ${interaction.user}`)
                                .setColor("#e91e63")

                            const emojibutton1 = new MessageButton()
                                .setStyle('LINK')
                                .setEmoji(emojiadd)
                                .setURL(emojisRegex)
                                .setLabel(emojiadd.name)

                            const row = new MessageActionRow().addComponents(emojibutton1)

                            return interaction.reply({
                                embeds: [emojiembed],
                                components: [row]
                            })
                        } catch (error) {

                            const errorembed = new MessageEmbed()
                                .setTitle('I ran into an error! <:error:822091680605011978>')
                                .setDescription(`
                Error:\n \`\`\`js\n${error}\`\`\`\n`)
                                .setColor("#FF0000")
                            return interaction.reply({
                                embeds: [errorembed],
                                ephemeral: true
                            })
                        }
