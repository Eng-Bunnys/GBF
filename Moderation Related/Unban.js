       //Getting the command objects
        const target = interaction.options.getUser("user");
        const unbanReason =
            interaction.options.getString("reason") || "No reason provided";

        const userNotBanned = new MessageEmbed()
            .setTitle(`${emojis.ERROR} You can't do that`)
            .setDescription(
                `The specified user is not banned from ${interaction.guild.name}`
            )
            .setColor(colours.ERRORRED)
            .setTimestamp()
            .setFooter({
                text: `${interaction.guild.name} moderation powered by GBF`,
                iconURL: interaction.user.displayAvatarURL(),
            });
        //Fetching all of the guild's bans
        const fetchBans = await interaction.guild?.bans.fetch();
        //If the guild has bans
        if (fetchBans) {
            //Looking for the user 
            const bannedUser = fetchBans.get(target.id);
            //If it exists
            if (bannedUser) {
                const unbanEmbed = new MessageEmbed()
                    .setTitle(`${emojis.SUCCESS} Success!`)
                    .addFields({
                        name: "Target:",
                        value: `${target.tag}`,
                        inline: false,
                    }, {
                        name: "Moderator:",
                        value: `${interaction.user.tag}`,
                        inline: false,
                    }, {
                        name: "Reason:",
                        value: `${unbanReason}`,
                    })
                    .setColor(colours.DEFAULT)
                    .setFooter({
                        text: `${interaction.guild.name} moderation powered by GBF`,
                        iconURL: interaction.user.displayAvatarURL(),
                    })
                    .setTimestamp();
                //Unbanning the user, reason isn't really needed 
                await interaction.guild.members.unban(target.id, unbanReason);

                return interaction.reply({
                    embeds: [unbanEmbed]
                })
              //These two else statements are if the guild doesn't have any bans and if the member is not among the banned members respectively 
            } else return interaction.reply({
                    embeds: [userNotBanned],
                    ephemeral: true,
                });
        } else return interaction.reply({
                embeds: [userNotBanned],
                ephemeral: true,
            });
