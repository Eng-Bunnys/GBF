             //There is a better version that contains support for legacy commands that can be found here : https://github.com/DepressedBunnys/Discord.JS-Bot-Commands/blob/main/Bot%20Related/Ping.js
             ping: {
                    description: "Check GBF's ping 🏓",
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const pingEmbed = new MessageEmbed()
                            .setTitle(`Pong 🏓`)
                            .setDescription(`Bot Ping: \`${Math.abs(Date.now() - interaction.createdTimestamp)}ms\`\nAPI Latency: \`${Math.round(client.ws.ping)}ms\``)
                            .setColor(colours.DEFAULT)
                        return interaction.reply({
                            embeds: [pingEmbed]
                        });

                    }
                }
