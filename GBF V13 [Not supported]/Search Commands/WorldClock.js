                worldclock: {
                    description: "Shows the time in different time zones",
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        let gmt = new Date().toLocaleString("en-US", {
                            timeZone: "Europe/London"
                        })
                        let est = new Date().toLocaleString("en-US", {
                            timeZone: "America/New_York"
                        })
                        let pst = new Date().toLocaleString("en-US", {
                            timeZone: "America/Los_Angeles"
                        })
                        let cst = new Date().toLocaleString("en-US", {
                            timeZone: "America/Mexico_City"
                        })
                        let cet = new Date().toLocaleString("en-US", {
                            timeZone: "CET"
                        })
                        let mst = new Date().toLocaleString("en-US", {
                            timeZone: "America/Phoenix"
                        })
                        let aest = new Date().toLocaleString("en-US", {
                            timeZone: "Australia/Sydney"
                        })
                        let awst = new Date().toLocaleString("en-US", {
                            timeZone: "Australia/Perth"
                        })
                        let kst = new Date().toLocaleString("en-US", {
                            timeZone: "Asia/Seoul"
                        })
                        let ist = new Date().toLocaleString("en-US", {
                            timeZone: "Asia/Calcutta"
                        })
                        let bst = new Date().toLocaleString("en-US", {
                            timeZone: "Asia/Dhaka"
                        })

                        const worldClock = new MessageEmbed()
                            .setTitle("World Clock - Timezones")

                            .addField(":flag_us: New York (EST)", `${est}\n(GMT-5)`, true)
                            .addField(":flag_us: Los Angles (PST)", `${pst}\n(GMT-8)`, true)
                            .addField(":flag_us: Mexico City (CST)", `${cst}\n(GMT-7)`, true)

                            .addField(":flag_eu: London (GMT)", `${gmt}\n(GMT+0/GMT+1)`, true)
                            .addField(":flag_eu: Central (CET)", `${cet}\n(GMT+1)`, true)
                            .addField('\u200B', '\u200B', true)

                            .addField(":flag_kr: Korean (KST)", `${kst}\n(GMT+9)`, true)
                            .addField(":flag_in: India (IST)", `${ist}\n(GMT+05:30)`, true)
                            .addField(":flag_bd: Bangladesh (BST)", `${bst} (GMT+6)`, true)

                            .addField(":flag_au: Sydney (AEST)", `${aest}\n(GMT+11)`, true)
                            .addField(":flag_au: Perth (AWST)", `${awst}\n(GMT+8)`, true)
                            .addField('\u200B', '\u200B', true)
                            .setColor("#e91e63")
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })

                        return interaction.reply({
                            embeds: [worldClock]
                        })
                    }
                }
