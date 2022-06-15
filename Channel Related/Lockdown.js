        const guild = interaction.guild;

        const textChannels = guild.channels.cache.filter(channel => channel.type === "GUILD_TEXT");

        const textChannelsArray = [];
        await textChannels.forEach(channel => {
            textChannelsArray.push(channel);
        })

        for (let i = 0; i < textChannelsArray.length; i++) {
            const channel = textChannelsArray[i];
            channel.permissionOverwrites.set([{
                id: interaction.guild.id,
                deny: ['SEND_MESSAGES'],
            }, ], `Locked down by ${interaction.user.username}`);
        }

        const lockedDown = new MessageEmbed()
            .setTitle(`${emojis.SUCCESS} Success`)
            .setDescription(`Locked down all channels in ${guild.name}\n\n⚠ The channels will have to be **manually** unlocked ⚠`)
            .setColor(colours.DEFAULT)
            .setTimestamp()
            .setFooter({
                text: `${guild.name} powered by GBF`,
                iconURL: guild.iconURL()
            })

        await interaction.reply({
            embeds: [lockedDown]
        });
