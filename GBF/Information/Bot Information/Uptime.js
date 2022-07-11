                //A better version of this command can be found here : https://github.com/DepressedBunnys/Discord.JS-Bot-Commands/blob/main/Bot%20Related/Uptime.js
                //That version supports UNIX timestamps, this does not, it also have a choice for non-package time display
                uptime: {
                    description: "See how long GBF has been awake",
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const NP1ErrorEmbed = new MessageEmbed()
                            .setTitle(`${emojis.ERROR} NP1 Error `)
                            .setDescription(`Please run \`/error np1\` to know more about the error and how to fix it`)
                            .setColor(colours.ERRORRED)
                            .setTimestamp()

                        let uptime = duration(client.uptime, {
                            units: ["y", "mo", "w", "d", "h", "m", "s"],
                            round: true
                        });

                        const UptimeEmbed = new MessageEmbed()
                            .setTitle(`${client.user.username}'s uptime`)
                            .setDescription(uptime)
                            .setColor(colours.DEFAULT)
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })

                        return interaction.reply({
                            embeds: [UptimeEmbed]
                        }).catch(err => {
                            console.log(`Uptime Command Error: ${err.message}`)
                            return interaction.reply({
                                embeds: [NP1ErrorEmbed],
                                ephemeral: true
                            })
                        })
                    }
                }
