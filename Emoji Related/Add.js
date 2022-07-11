                        //Getting the user input from the interaction options
                        const emojiName = interaction.options.getString("name");
                        const emojiURL = interaction.options.getString("emoji-url");
                        //Regex to check that if the URL set is a valid image URL or not
                        const URLRegex = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig
                        const ImageChecker = /\.(jpg|jpeg|png|gif|webp)$/
                    
                        const InvalidEmoji = new MessageEmbed() 
                            .setTitle(`${emojis.ERROR} Invalid Input`)
                            .setDescription(`The data you provided in the emoji-url field is invalid!\nPlease make sure it's a valid image URL\n\`\`\`diff\n- https://tenor.com/view/skillissue-skill-issue-gif-22125481\n+ https://c.tenor.com/uGN34orccIEAAAAC/skillissue-skill.gif\`\`\``)
                            .setColor(colours.ERRORRED)
                            .setTimestamp()
                        //If the URL is invalid
                        if (!URLRegex.test(emojiURL) || !ImageChecker.test(emojiURL)) return interaction.reply({
                            embeds: [InvalidEmoji],
                            ephemeral: true
                        })

                        const TooLong = new MessageEmbed()
                            .setTitle(titles.ERROR)
                            .setDescription(`Emoji name must be between 2 and 32 characters long\n**${emojiName}** is ${emojiName.length} characters`)
                            .setColor(colours.ERRORRED)
                            .setTimestamp()
                        //If the emoji name is too long or short
                        if (emojiName.length < 2 || emojiName.length > 32) return interaction.reply({
                            embeds: [TooLong],
                            ephemeral: true
                        })
                        //Defering the reply so the bot has all the time it needs to add the image, larger file sizes may take longer depending on host internet speed
                       await interaction.deferReply();

                        let addedEmoji;
                        //Attempting to add the emoji
                        try { 
                             addedEmoji = await interaction.guild.emojis.create(emojiURL, emojiName);
                        } catch (err) {
                            //If an error occured 
                            const errorWhileAdding = new MessageEmbed()
                                .setTitle(`${emojis.ERROR} I ran into an error while adding the emoji`)
                                .setDescription(`Error:\n\`\`\`js\n${err.message}\`\`\``)
                                .setColor(colours.ERRORRED)
                                .setTimestamp()
                            //Telling the user about the error then deleting the deferReply
                            await interaction.followUp({
                                embeds: [errorWhileAdding],
                                ephemeral: true
                            })
                            return interaction.deleteReply();
                        }
                        //Creating the embed with information about the emoji
                        const emojiEmbed = new MessageEmbed()
                            .setTitle(`${emojis.VERIFY} Successfully added the emoji: **${addedEmoji.name}**`)
                            .setDescription(`• Emoji name: ${addedEmoji.name}\n• Emoji ID: ${addedEmoji.id}\n• URL: [Emoji URL](${emojiURL})\n• Added by: ${interaction.user}`)
                            .setColor(colours.DEFAULT)
                            .setFooter({
                                text: `Want emoji update logs? Join GBF logging /logs emojis`,
                                iconURL: interaction.member.displayAvatarURL()
                            })
                            .setTimestamp()
                        //Creating a button with a link to the emoji
                        const newEmoji = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                .setLabel(addedEmoji.name)
                                .setStyle("LINK")
                                .setEmoji(addedEmoji)
                                .setURL(`https://discordapp.com/emojis/${addedEmoji.id}`),
                            )
                      //Sending the confirmation message and emoji info
                     return interaction.editReply({
                            embeds: [emojiEmbed],
                            components: [newEmoji]
                        })
