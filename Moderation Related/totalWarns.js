//Fucntion to split large amounts of data 
function MessageSplit(message, codelength) {
    let ArrayNeeded = [];

    if (!message) return [];

    if (Array.isArray(message)) {
        message = message.join('\n');
    }

    if (message.length > codelength) {
        let string = '',
            position;
        while (message.length > 0) {
            position = message.length > codelength ? message.lastIndexOf('\n', codelength) : message.length;
            if (position > codelength) position = codelength;
            string = message.substr(0, position);
            message = message.substr(position);
            ArrayNeeded.push(string);
        }
    } else {
        ArrayNeeded.push(message);
    }
    return ArrayNeeded;
}

                      //Getting the user specified in args
                        const user = interaction.options.getUser("user");
                        //Checking if the user's schema exists
                        let userWarnDocs = await WarnSchema.findOne({
                            userId: user.id,
                            guildId: interaction.guild.id
                        });

                        const NoData = new MessageEmbed()
                            .setTitle(`${emojis.ERROR} No Data Found`)
                            .setDescription(`I couldn't find any warn data on ${user.tag} in ${interaction.guild.name}`)
                            .setColor(colours.ERRORRED)
                            .setFooter({
                                text: `${interaction.guild.name} moderation powered by GBF™`,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                        //If the user does not have a schema
                        if (!userWarnDocs) return interaction.reply({
                            embeds: [NoData],
                            ephemeral: true
                        })
                        //If the user has no warnings
                        if (userWarnDocs.warnID.length === 0 || userWarnDocs.warnReason.length === 0 || userWarnDocs.warns === 0) return interaction.reply({
                            embeds: [NoData],
                            ephemeral: true
                        })
                        //Code for pagination
                        let userDataArray = []
                        for (let i = 0; i < userWarnDocs.warnID.length; i++) {
                            //Adding the warn ID with it's corresponding reason
                            userDataArray.push(`**${i + 1}:** ${userWarnDocs.warnID[i]} - ${userWarnDocs.warnReason[i]}`)
                        }
                        userDataArray = MessageSplit(userDataArray, 450);

                        const embeds = []
                        const pages = {} // {userId: pageNumber }
                        //Creating the embed and adding the data to it
                        for (let a = 0; a < userDataArray.length; a++) {
                            let pageNumber = a + 1
                            embeds.push(new MessageEmbed().setDescription(`${userDataArray[pageNumber - 1]}`).setColor(colours.DEFAULT).setTitle(`${user.username}'s warning data`).setFooter({
                                text: `${interaction.guild.name} moderation powered by GBF™ || Page ${a + 1} / ${userDataArray.length}`,
                                iconURL: interaction.user.displayAvatarURL()
                            }))
                        }
                        //Creating the buttons
                        const getRow = (id) => {
                            const MainButtonsRow = new MessageActionRow();
                            MainButtonsRow.addComponents(
                                new MessageButton()
                                .setCustomId('firstPage')
                                .setStyle("SECONDARY")
                                .setEmoji("⏮")
                                .setDisabled((pages[id] === 0))
                            );
                            MainButtonsRow.addComponents(
                                new MessageButton()
                                .setCustomId("prevEmbed")
                                .setStyle("SECONDARY")
                                .setEmoji("◀")
                                .setDisabled(pages[id] === 0)
                            );
                            MainButtonsRow.addComponents(
                                new MessageButton()
                                .setCustomId("nextEmbed")
                                .setStyle("SECONDARY")
                                .setEmoji("▶")
                                .setDisabled(pages[id] === embeds.length - 1)
                            );
                            MainButtonsRow.addComponents(
                                new MessageButton()
                                .setCustomId('finalPage')
                                .setStyle("SECONDARY")
                                .setEmoji("⏭")
                                .setDisabled(pages[id] === embeds.length - 1)
                            );
                            MainButtonsRow.addComponents(
                                new MessageButton()
                                .setCustomId("end")
                                .setStyle("DANGER")
                                .setLabel("Close")
                                .setEmoji(emojis.ERROR)
                                .setDisabled(false)
                            );
                            return MainButtonsRow;
                        };

                        let id = interaction.user.id;

                        pages[id] = pages[id] || 0;

                        const embed = embeds[pages[id]];

                        await interaction.reply({
                            embeds: [embed],
                            components: [getRow(id)]
                        })
                        //Creating a collector for the buttons
                        const filter = i => {
                            return i.user.id === interaction.user.id;
                        };

                        const collector = interaction.channel.createMessageComponentCollector({
                            filter,
                            idle: 15000,
                            time: 300000
                        });

                        collector.on('collect', async i => {
                            await i.deferUpdate();
                            //Pagination code                              
                            if (i.customId === 'prevEmbed') {
                                pages[id]--;
                                if (pages[id] < 0) pages[id] = 0;
                                await interaction.editReply({
                                    embeds: [embeds[pages[id]]],
                                    components: [getRow(id)],
                                });
                            } else if (i.customId === 'nextEmbed') {
                                pages[id]++;
                                if (pages[id] > embeds.length - 1) pages[id] = embeds.length - 1;
                                await interaction.editReply({
                                    embeds: [embeds[pages[id]]],
                                    components: [getRow(id)],
                                });
                            } else if (i.customId === 'end') {
                                await collector.stop();
                            } else if (i.customId === 'firstPage') {
                                pages[id] = 0;
                                await interaction.editReply({
                                    embeds: [embeds[pages[id]]],
                                    components: [getRow(id)],
                                });
                            } else if (i.customId === 'finalPage') {
                                pages[id] = embeds.length - 1;
                                await interaction.editReply({
                                    embeds: [embeds[pages[id]]],
                                    components: [getRow(id)],
                                });
                            }
                        })

                        collector.on('end', async i => {
                            //Creating disabled buttons for when the collector turns off
                            const MainButtonsRowDisabled = new MessageActionRow();
                            MainButtonsRowDisabled.addComponents(
                                new MessageButton()
                                .setCustomId("prev_embedD")
                                .setStyle("SECONDARY")
                                .setEmoji("⏮")
                                .setDisabled(true)
                            );
                            MainButtonsRowDisabled.addComponents(
                                new MessageButton()
                                .setCustomId("next_embedD")
                                .setStyle("SECONDARY")
                                .setEmoji("⏭")
                                .setDisabled(true)
                            );

                            await interaction.editReply({
                                components: [MainButtonsRowDisabled]
                            })
                        })
