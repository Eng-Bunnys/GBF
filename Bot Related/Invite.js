                      //Creating buttons for the bot invite link, support server, top.gg and patreon   
                      let code = "PUT YOUR INVITE CODE HERE"
                      let name = "Suffix of the patreon link"
                      const Links = new MessageActionRow()
                            .addComponents(new MessageButton()
                                .setLabel('Bot Invite link')
                                .setStyle('LINK')
                                .setEmoji('<:GBFLogo:838990392128307231>')
                                .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=1642787765494&scope=bot%20applications.commands`),
                            )
                            .addComponents(new MessageButton()
                                .setLabel('Support server')
                                .setStyle('LINK')
                                .setEmoji('<:LogoTransparent:838994085527945266>')
                                .setURL(`https://discord.gg/${code}`),
                            )
                            .addComponents(new MessageButton()
                                .setLabel('Top.gg')
                                .setStyle('LINK')
                                .setEmoji('<:tog:882279600506433607>')
                                .setURL(`https://top.gg/bot/795361755223556116/vote`),
                            )
                            .addComponents(new MessageButton()
                                .setLabel('Patreon')
                                .setStyle('LINK')
                                .setEmoji('<:patreon:882279599394930699>')
                                .setURL(`https://www.patreon.com/${name}`),
                            );
                        //Creating the invite links
                        const mainembed = new MessageEmbed()
                            .setTitle(`${emojis.VERIFY} ${client.user.username} Links`)
                            .addFields({
                                name: 'Invite me to your server!',
                                value: (`- [Bot invite link](${`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=1642787765494&scope=bot%20applications.commands`})`),
                                inline: true
                            }, {
                                name: 'Support server!',
                                value: (`- [Support server link](${`https://discord.gg/${code}`})`),
                                inline: true
                            }, {
                                name: "\u200b",
                                value: '\u200b',
                                inline: true
                            }, {
                                name: `Vote for ${client.user.username} on Top.gg!`,
                                value: `- [Vote here](${`https://top.gg/bot/${client.user.id}/vote`})`,
                                inline: true
                            }, {
                                name: `Support ${client.user.username} on Patreon!`,
                                value: `- [Patreon link](${`https://www.patreon.com/${name}`})`,
                                inline: true
                            }, {
                                name: "\u200b",
                                value: '\u200b',
                                inline: true
                            })
                            .setColor("#e91e63")
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                        //Sending the embed with the buttons
                        await interaction.reply({
                            embeds: [mainembed],
                            components: [Links]
                        });
