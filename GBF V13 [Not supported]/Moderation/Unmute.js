        const target = interaction.options.getUser("user");
        const muteReason = interaction.options.getString("reason") || "No reason given";

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

        const notMuted = new MessageEmbed()
            .setTitle(`${emojis.ERROR} You can't do that`)
            .setDescription(`The user you specified isn't muted.`)
            .setColor(colours.ERRORRED)
            .setFooter({
                text: `${interaction.guild.name} logging powered by GBF`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp()

        if (GuildMember.isCommunicationDisabled() === false) return interaction.reply({
            embeds: [notMuted],
            ephemeral: true
        })

        await GuildMember.timeout(0, muteReason);

        const userMuted = new MessageEmbed()
            .setTitle(`${emojis.VERIFY} Success`)
            .setColor(colours.DEFAULT)
            .setDescription(`${target.tag} has been unmuted`)
            .addFields({
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
