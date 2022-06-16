        const target = interaction.options.getUser("user");
        const banReason = interaction.options.getString("reason") || "No reason provided";
        const deleteDays = interaction.options.getNumber("days") || 0;
        const banDM = interaction.options.getBoolean("dm") || false;

        const ServerMember = interaction.guild.members.cache.get(target.id);

        const UserAlreadyBanned = new MessageEmbed()
            .setTitle(`${emojis.ERROR} I can't do that`)
            .setColor(colours.ERRORRED)
            .setDescription(`${target.username} is already banned`);

        const fetchBans = await interaction.guild?.bans.fetch();
        if (fetchBans) {
            const bannedUser = fetchBans.get(target.id);
            if (bannedUser)
                return interaction.reply({
                    embeds: [UserAlreadyBanned],
                    ephemeral: true,
                });
        }

        if (ServerMember) {
            let messageDeleteDays
            if (deleteDays > 7) messageDeleteDays = 7;
            else if (deleteDays === 0) messageDeleteDays = 0;
            else messageDeleteDays = deleteDays;
            const moderator = interaction.user;
            let DMBool;

            const SelfBan = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(`You can't ban yourself...`)
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });

            if (moderator.id == target.id)
                return interaction.reply({
                    embeds: [SelfBan],
                    ephemeral: true,
                });

            const BotBan = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(`I can't ban myself...`)
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });

            if (target.id === client.user.id)
                return interaction.reply({
                    embeds: [BotBan],
                    ephemeral: true,
                });

            const UnableToBan = new MessageEmbed()
                .setTitle(`${emojis.ERROR} I can't do that`)
                .setDescription(`I can't ban an admin...`)
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });

            if (ServerMember.permissions.has("ADMINISTRATOR"))
                return interaction.reply({
                    embeds: [UnableToBan],
                    ephemeral: true,
                });

            const targetPosition = ServerMember.roles.highest.position;
            const authorPosition = interaction.member.roles.highest.position;
            const botPosition = interaction.guild.me.roles.highest.position;

            const TargetHigher = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setDescription(
                    `${target.username}'s position is higher or equal to yours`
                )
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL(),
                });

            if (authorPosition <= targetPosition)
                return interaction.reply({
                    embeds: [TargetHigher],
                    ephemeral: true,
                });

            const TargetHigherThanBot = new MessageEmbed()
                .setTitle(`${emojis.ERROR} I can't do that`)
                .setDescription(
                    `${target.username}'s position is higher or equal to mine`
                )
                .setColor(colours.ERRORRED)
                .setTimestamp()
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                });

            if (botPosition <= targetPosition)
                return interaction.reply({
                    embeds: [TargetHigherThanBot],
                    ephemeral: true,
                });

            if (banDM === true) DMBool = true;
            else DMBool = false;

            const UserBannedSuccess = new MessageEmbed()
                .setTitle(`A user has been banned`)
                .setColor(colours.ERRORRED)
                .setDescription(`${target.username} has been hit with the ban hammer 🔨`)
                .addFields({
                    name: "Moderator:",
                    value: `${interaction.user.tag} (${interaction.user.id})`,
                    inline: true,
                }, {
                    name: "Target Details:",
                    value: `${target.tag} (${target.id})`,
                    inline: true,
                }, {
                    name: "Ban Reason:",
                    value: `${banReason}`,
                    inline: true,
                }, {
                    name: "Message Delete Days:",
                    value: `${messageDeleteDays + ` Day(s)` ?? "Option not available"}`,
                    inline: true,
                }, {
                    name: "Time of Ban:",
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

            if (DMBool === false) {
                await interaction.guild.members.ban(target.id, {
                    reason: banReason,
                    days: messageDeleteDays
                });

                return interaction.reply({
                    embeds: [UserBannedSuccess]
                })
            } else {
                try {
                    const YouveBeenBanned = new MessageEmbed()
                        .setTitle(`You've been banned from ${interaction.guild.name}`)
                        .setColor(colours.ERRORRED)
                        .setDescription(`You've been banned from ${interaction.guild.name} by ${interaction.user.tag} for the following reason: ${banReason}`)
                        .setFooter({
                            text: `${interaction.guild.name} Moderation powered by GBF`,
                            iconURL: interaction.guild.iconURL()
                        })
                        .setTimestamp()

                    target.send({
                        embeds: [YouveBeenBanned]
                    })
                } catch (err) {
                    console.log(redBright(`I couldn't DM ${target.tag}`));
                }

                await interaction.guild.members.ban(target.id, {
                    reason: banReason,
                    days: messageDeleteDays
                });

                return interaction.reply({
                    embeds: [UserBannedSuccess]
                })
            }
        } else {
            await interaction.guild.members.ban(target.id, {
                reason: banReason
            });

            const UserBanned = new MessageEmbed()
                .setTitle(`${target.username} has been banned 🔨`)
                .setColor(colours.ERRORRED)
                .setDescription(`${target.tag} has been hit with the ban hammer!`)
                .setThumbnail('https://cdn.discordapp.com/emojis/677533805044695067.gif?v=1')
                .addFields({
                    name: "Banned by:",
                    value: `${interaction.user.tag}`
                }, {
                    name: "Ban Reason:",
                    value: `${banReason}`
                })
                .setFooter({
                    text: `The user is not in this server so DM and MDD are unavailable`,
                    iconURl: interaction.guild.iconURL()
                })
                .setTimestamp()

            return interaction.reply({
                embeds: [UserBanned]
            })
        }
