                        const {
                            parse
                          } = require('twemoji-parser');
                        
                        const emoji = interaction.options.getString("emoji");
                        //https://discord.js.org/#/docs/discord.js/stable/class/Util
                        let custom = Util.parseEmoji(emoji);
                         //Generating a link to the emoji
                        const link = new MessageButton()
                            .setStyle('LINK')
                            .setURL(`${`https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif" : "png"}`}`)
                            .setEmoji(emoji)
                        const EmojiB = new MessageActionRow().addComponents([link])
                        
                        const EnlargeEmbed = new MessageEmbed()
                            .setTitle(`Enlarged version of  ${emoji}`)
                            .setDescription(`[PNG](${`https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif" : "png"}`})`)
                            .setColor("#e91e63")
                            .setFooter({
                                text: `Requested By ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                        if (custom.id) {
                            EnlargeEmbed.setImage(`https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? "gif" : "png"}`)
                            return interaction.reply({
                                embeds: [EnlargeEmbed],
                                components: [EmojiB]
                            })
                        } else {
                            let parsed = parse(emoji, {
                                assetType: "png",
                                size: 1024
                            });
                            if (!parsed[0]) return interaction.reply({
                                content: "Please provide a valid emoji",
                                ephemeral: true
                            })

                            EnlargeEmbed.setImage(parsed[0].url);
                            return interaction.reply({
                                embeds: [EnlargeEmbed],
                                components: [EmojiB]
                            })
                        }
