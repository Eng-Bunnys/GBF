               weather: {
                    description: "Shows the weather in a certain location",
                    args: [{
                        name: 'unit',
                        type: 'STRING',
                        description: `F or C`,
                        choices: [{
                            name: 'Celsius',
                            value: 'C'
                        }, {
                            name: 'Fahrenheit',
                            value: 'F'
                        }],
                        required: true
                    }, {
                        name: 'location',
                        type: 'STRING',
                        description: `The place that you want to get its temp.`,
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const unit = interaction.options.getString('unit')
                        const location = interaction.options.getString('location')

                        const erE = new MessageEmbed()
                            .setTitle(`Invalid Location 🌎`)
                            .setColor(colors.ERRORRED)
                            .setDescription(`Are you sure that \`${location}\` is a real place 🤔`)

                        if (unit === 'C') {
                            weather.find({
                                search: location,
                                degreeType: 'C'
                            }, function (error, result) {
                                if (error) return interaction.reply({
                                    content: `I ran into an error: ` + error + `\nPlease check back another time (If the error code is 500 then there is a server side issue)`,
                                    ephemeral: true
                                });

                                if (result === undefined || result.length === 0) return interaction.reply({
                                    embeds: [erE],
                                    ephemeral: true
                                });

                                let current = result[0].current;
                                let location = result[0].location;

                                const weatherinfoC = new MessageEmbed()
                                    .setAuthor({
                                        name: `Weather forecast for ${current.observationpoint}`
                                    })
                                    .setDescription(`**${current.skytext}**`)
                                    .setColor("#e91e63")
                                    .addField("Timezone", `UTC${location.timezone}`, true)
                                    .addField("Degree Type", "Celsius", true)
                                    .addField("Temperature", `${current.temperature}°`, true)
                                    .addField("Wind", current.winddisplay, true)
                                    .addField("Feels like", `${current.feelslike}°`, true)
                                    .addField("Humidity", `${current.humidity}%`, true)
                                    .setThumbnail(current.imageUrl)

                                interaction.reply({
                                    embeds: [weatherinfoC]
                                }).catch(err => {
                                    return interaction.reply({
                                        content: "Seems like there was something wrong with the API, Please check back later!",
                                        ephemeral: true
                                    })
                                })
                            })

                        } else if (unit === 'F') {
                            weather.find({
                                search: location,
                                degreeType: 'F'
                            }, function (error, result) {
                                if (error) returninteraction.reply({
                                    content: `I ran into an error: ` + error + `\nPlease check back another time (If the error code is 500 then there is a server side issue)`,
                                    ephemeral: true
                                });

                                if (result === undefined || result.length === 0) return interaction.reply({
                                    embeds: [erE],
                                    ephemeral: true
                                });

                                let current = result[0].current;
                                let location = result[0].location;

                                const weatherinfoF = new MessageEmbed()
                                    .setAuthor({
                                        name: `Weather forecast for ${current.observationpoint}`
                                    })
                                    .setDescription(`**${current.skytext}**`)
                                    .setColor("#e91e63")
                                    .addField("Timezone", `UTC${location.timezone}`, true)
                                    .addField("Degree Type", "Fahrenheit", true)
                                    .addField("Temperature", `${current.temperature}°`, true)
                                    .addField("Wind", current.winddisplay, true)
                                    .addField("Feels like", `${current.feelslike}°`, true)
                                    .addField("Humidity", `${current.humidity}%`, true)
                                    .setThumbnail(current.imageUrl)

                                interaction.reply({
                                    embeds: [weatherinfoF]
                                }).catch(err => {
                                    return interaction.reply({
                                        content: "Seems like there was something wrong with the API, Please check back later!",
                                        ephemeral: true
                                    })
                                })
                            })
                        }
                    }
                }
