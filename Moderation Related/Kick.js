        //Getting the args/data
        const target = interaction.options.getUser('user');
        const kickReason = interaction.options.getString('reason');
        //Fetching the member
        const GuildMember = interaction.guild.members.cache.get(target.id);
        const moderator = interaction.user;
        //If the member is a guild member
        if (GuildMember) {

            const SelfKick = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(`You can't kick yourself...\nJust leave the server nerd 🤓`)
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });
             //If the user is trying to kick themselves 
            if (moderator.id == target.id) return interaction.reply({
                embeds: [SelfKick],
                ephemeral: true,
            });

            const BotKick = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(`I can't kick myself...`)
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });
            //If the user is trying to kick the bot
            if (target.id === client.user.id) return interaction.reply({
                embeds: [BotKick],
                ephemeral: true,
            });

            const UnableToKick = new MessageEmbed()
                .setTitle(`${emojis.ERROR} I can't do that`)
                .setDescription(`I can't kick an admin...`)
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });
            //If the target has admin
            if (GuildMember.permissions.has("ADMINISTRATOR")) return interaction.reply({
                embeds: [UnableToKick],
                ephemeral: true,
            });
            //Checking role hierarchy 
            const targetPosition = GuildMember.roles.highest.position;
            const authorPosition = interaction.member.roles.highest.position;
            const botPosition = interaction.guild.me.roles.highest.position;

            const TargetHigher = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(`${target.username}'s position is higher or equal to yours`)
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });

            if (authorPosition <= targetPosition) return interaction.reply({
                embeds: [TargetHigher],
                ephemeral: true,
            });

            const TargetHigherThanBot = new MessageEmbed()
                .setTitle(`${emojis.ERROR} I can't do that`)
                .setDescription(`${target.username}'s position is higher or equal to mine`)
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                });

            if (botPosition <= targetPosition) return interaction.reply({
                embeds: [TargetHigherThanBot],
                ephemeral: true,
            });
            //Kicking the member
            await GuildMember.kick(kickReason);

            const UserKicked = new MessageEmbed()
                .setTitle(`A user has been kicked`)
                .setColor(colours.ERRORRED)
                .addFields({
                    name: "Moderator:",
                    value: `${interaction.user.tag} (${interaction.user.id})`,
                    inline: true,
                }, {
                    name: "Target Details:",
                    value: `${target.tag} (${target.id})`,
                    inline: true,
                }, {
                    name: "Kick Reason:",
                    value: `${kickReason}`,
                    inline: true,
                }, {
                    name: "Time of Kick:",
                    value: `<t:${Math.round(new Date().getTime() / 1000)}:F>`,
                    inline: true,
                }, {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true,
                }, {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true,
                })
                .setFooter({
                    text: `${interaction.guild.name} Moderation powered by GBF`,
                    iconURL: client.user.displayAvatarURL(),
                });

            return interaction.reply({
                embeds: [UserKicked]
            })
        //If GuildMember does not exist/returns null 
        } else return interaction.reply({
            content: `⚠ That user is not in ${interaction.guild.name} ⚠`
        })
  
