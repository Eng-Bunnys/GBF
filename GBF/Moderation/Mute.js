             options: [{
                name: "user",
                description: "The user that you want to mute",
                type: "USER",
                required: true,
            }, {
                name: "duration",
                description: "The time that you want to mute the user for",
                type: "INTEGER",
                required: true,
            }, {
                name: "unit",
                description: "The unit of the time that the user will be muted for",
                type: "STRING",
                choices: [{
                    name: "minutes",
                    value: "m"
                }, {
                    name: "hours",
                    value: "h"
                }, {
                    name: "days",
                    value: "d"
                }],
                required: true,
            }, {
                name: "reason",
                description: "The reason that you want to timeout the user",
                type: "STRING",
                required: false
            }], 

        const target = interaction.options.getUser("user");
        const specifiedTime = interaction.options.getInteger("duration");
        const specifiedUnit = interaction.options.getString("unit");
        const muteReason = interaction.options.getString("reason") || "No reason given";

        let unitUpdater;

        if (specifiedUnit === "m") unitUpdater = 60000;
        if (specifiedUnit === "h") unitUpdater = 3600000;
        if (specifiedUnit === "d") unitUpdater = 86400000;

        const tooLong = new MessageEmbed()
            .setTitle(`${emojis.ERROR} You can't do that`)
            .setDescription(`The time you specified is too long, you can't mute for more than 10 days.`)
            .setColor(colours.ERRORRED)
            .setFooter({
                text: `${interaction.guild.name} logging powered by GBF`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp()

        const tooShort = new MessageEmbed()
            .setTitle(`${emojis.ERROR} You can't do that`)
            .setDescription(`The time you specified is too short, you need to specifiy a time longer than one minute.`)
            .setColor(colours.ERRORRED)
            .setFooter({
                text: `${interaction.guild.name} logging powered by GBF`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp()

        const timeoutTime = specifiedTime * unitUpdater;

        if (timeoutTime > 864000000) return interaction.reply({
            embeds: [tooLong],
            ephemeral: true
        });

        if (timeoutTime < 60000) return interaction.reply({
            embeds: [tooShort],
            ephemeral: true
        });

        const GuildMember = interaction.guild.members.cache.get(target.id);

        const noMember = new MessageEmbed()
            .setTitle(`${emojis.ERROR} You can't do that`)
            .setDescription(`The user you specified isn't in ${interaction.guild.name}`)
            .setColor(colours.ERRORRED)
            .setFooter({
                text: `${interaction.guild.name} logging powered by GBF`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp()

        if (!GuildMember) return interaction.reply({
            embeds: [noMember],
            ephemeral: true
        })

        const userHasAdmin = new MessageEmbed()
            .setTitle(`${emojis.ERROR} You can't do that`)
            .setDescription(`The user's permissions are too high for me to mute them.`)
            .setColor(colours.ERRORRED)
            .setFooter({
                text: `${interaction.guild.name} logging powered by GBF`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp()

        if (GuildMember.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({
            embeds: [userHasAdmin],
            ephemeral: true
        })

        try {
            await GuildMember.timeout(timeoutTime, muteReason);
        } catch (err) {
            console.log(err)
            return interaction.reply({
                embeds: [userHasAdmin],
                ephemeral: true
            })
        }
        const userMuted = new MessageEmbed()
            .setTitle(`${emojis.SUCCESS} Success`)
            .setDescription(`${target.tag} has been muted`)
            .setColor(colours.DEFAULT)
            .addFields({
                name: "Duration:",
                value: `${specifiedTime}${specifiedUnit}`
            }, {
                name: "Reason:",
                value: `${muteReason}`
            }, {
                name: "Moderator:",
                value: `${interaction.user.tag}`
            })
            .setFooter({
                text: `${interaction.guild.name} logging powered by GBF`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp()

        return interaction.reply({
            embeds: [userMuted]
        })
