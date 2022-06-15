       //Just so I don't have to add interaction.guild everwhere
        const guild = interaction.guild;
        //Getting all of the "TEXT" channels in the guild, this is here so we can avoid an errors relating to the "Locking"
        const textChannels = guild.channels.cache.filter(channel => channel.type === "GUILD_TEXT");
        //Adding the channels to an array
        const textChannelsArray = [];
        await textChannels.forEach(channel => {
            textChannelsArray.push(channel);
        })
        //Looping through all of the array contents using a basic for loop
        for (let i = 0; i < textChannelsArray.length; i++) {
            const channel = textChannelsArray[i];
            //Denying the "SEND_MESSAGES" permission, "SEND_MESSAGES" is deprecated in v14, so to avoid having to change it when updating, we just use this
            channel.permissionOverwrites.set([{
                id: interaction.guild.id,
                deny: [Permissions.FLAGS.SEND_MESSAGES],
            }, ], `Locked down by ${interaction.user.username}`);
        }
        //Creating an embed to send to the user 
        const lockedDown = new MessageEmbed()
            .setTitle(`${emojis.SUCCESS} Success`)
            .setDescription(`Locked down all channels in ${guild.name}\n\n⚠ It is recommended to **manually** unlock the channels ⚠`)
            .setColor(colours.DEFAULT)
            .setTimestamp()
            .setFooter({
                text: `${guild.name} powered by GBF`,
                iconURL: guild.iconURL()
            })

        await interaction.reply({
            embeds: [lockedDown]
        });
