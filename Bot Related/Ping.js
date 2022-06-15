                        const pingEmbed = new MessageEmbed()
                            .setTitle(`Pong 🏓`)
                            //Subtracting the current time from the time the interaction was created
                            .setDescription(`Bot Ping: \`${Math.abs(Date.now() - interaction.createdTimestamp)}ms\`\nAPI Latency: \`${Math.round(client.ws.ping)}ms\``)
                            .setColor(colours.DEFAULT)

                        return interaction.reply({
                            embeds: [pingEmbed]
                        });
