                 //We use this package since moment.js got deprecated
                 const duration = require('humanize-duration');                      
                  //Getting the uptime in human readable time
                  //Instead of using a package, you can use this
                  /*
      return {
        days: Math.floor(ms / 86400000),
        hours: Math.floor(ms / 3600000) % 24,
        minutes: Math.floor(ms / 60000) % 60,
        seconds: Math.floor(ms / 1000) % 60
    };
                  */
                  let uptime = duration(client.uptime, {
                            units: ["y", "mo", "w", "d", "h", "m", "s"],
                            round: true
                        });
                  //If you want to use UNIX timestamp:
                    const uptimeUNIX = (new Date() / 1000 - client.uptime / 1000).toFixed()
                    let uptime = `<t:${uptime}:R>`

                      //Uptime embed
                        const UptimeEmbed = new MessageEmbed()
                            .setTitle(`${client.user.username}'s uptime`)
                            .setDescription(uptime)
                            .setColor("#e91e63")
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })

                        return interaction.reply({
                            embeds: [UptimeEmbed]
                        })
