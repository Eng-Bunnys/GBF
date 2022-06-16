                        const pingEmbed = new MessageEmbed()
                            .setTitle(`Pong 🏓`)
                            //Subtracting the current time from the time the interaction was created
                            .setDescription(`Bot Ping: \`${Math.abs(Date.now() - interaction.createdTimestamp)}ms\`\nAPI Latency: \`${Math.round(client.ws.ping)}ms\``)
                            .setColor(colours.DEFAULT)
                        
                     //To make the same thing but using legacy commands
                        
                     const GBFPing = await message.reply({
                         content: `**${client.user.username}'s** ping!`
                            });

                     const pingEmbed = new MessageEmbed()
                      .setTitle("Pong! 🏓")
                      .addFields({
                           name: 'Latency',
                           value: `\`${GBFPing.createdTimestamp - message.createdTimestamp}ms\``
                          }, {
                            name: 'API Latency',
                            value: `\`${Math.round(client.ws.ping)}ms\``
                            })
                       .setColor("#e91e63")
                    GBFPing.edit({
                        embeds: [pingEmbed]
                   })

                        return message.reply({
                            embeds: [pingEmbed]
                        });
