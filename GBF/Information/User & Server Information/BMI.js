                bmi: {
                    description: "Calculates BMI",
                    args: [{
                        name: 'units',
                        type: 'STRING',
                        description: `The unit of your choice`,
                        choices: [{
                            name: "Metric",
                            value: "Metric"
                        }, {
                            name: "Imperial",
                            value: "Imperial"
                        }, ],
                        required: true
                    }, {
                        name: 'weight',
                        type: 'NUMBER',
                        minValue: 0,
                        description: `Please use KG or LB depending on the unit chosen`,
                        required: true
                    }, {
                        name: 'height',
                        type: 'NUMBER',
                        minValue: 0,
                        description: `Please use Meter or Inch depending on the unit chosen`,
                        required: true
                    }, {
                        name: 'private',
                        type: 'STRING',
                        description: `If true then only you can see the message and no one will know you ever ran the command`,
                        choices: [{
                            name: 'True',
                            value: 'True'
                        }, {
                            name: 'False',
                            value: 'False'
                        }],
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const unitSystem = interaction.options.getString('units');
                        const userWeight = interaction.options.getNumber('weight');
                        const userHeight = interaction.options.getNumber('height');
                        const userPrivacyChoice = interaction.options.getString('private');

                        let PrivacySetting
                        if (userPrivacyChoice === 'True') PrivacySetting = true
                        else PrivacySetting = false

                        if (unitSystem === 'Imperial') {

                            const InvalidNumbers = new MessageEmbed()
                                .setTitle(`${emojis.ERROR} You can't do that`)
                                .setColor(colours.ERRORRED)
                                .setDescription(`The values that you've entered are unrealistic`)
                                .setFooter({
                                    text: `This is not 100% accurate so it's recommended to vist a medical professional for more accurate results`,
                                })

                            if (userHeight <= 0 || userWeight <= 0) return interaction.reply({
                                embeds: [InvalidNumbers],
                                ephemeral: true
                            })

                            const BMIAmerica = BMIImperial(userWeight, userHeight).toFixed(1);

                            const ScaleResult = BMIScale(BMIAmerica);

                            const UnrealisticBMI = new MessageEmbed()
                                .setTitle(title.ERROR)
                                .setColor(colours.ERRORRED)
                                .setDescription(`Unrealistic BMI`)
                                .setFooter({
                                    text: `This is not 100% accurate so it's recommended to vist a medical professional for more accurate results`,
                                })

                            if (BMIAmerica < 10 || BMIAmerica > 50) {
                                return interaction.reply({
                                    embeds: [UnrealisticBMI],
                                    ephemeral: true
                                })
                            }
                            const ImpEmbed = new MessageEmbed()
                                .setTitle(`${emojis.VERIFY} Estimated BMI`)
                                .setColor(colours.DEFAULT)
                                .addFields({
                                    name: "Weight:",
                                    value: `${userWeight} Pounds (Lbs)`,
                                    inline: true
                                }, {
                                    name: "Height:",
                                    value: `${userHeight} Inches`,
                                    inline: true
                                }, {
                                    name: "System used:",
                                    value: unitSystem,
                                    inline: true
                                }, {
                                    name: 'BMI:',
                                    value: BMIAmerica,
                                    inline: true
                                }, {
                                    name: '\u200b',
                                    value: `u200b`,
                                    inline: true
                                }, {
                                    name: 'Weight Status:',
                                    value: ScaleResult,
                                    inline: true
                                })
                                .setFooter({
                                    text: `Requested by: ${interaction.user.username}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                            return interaction.reply({
                                embeds: [ImpEmbed],
                                ephemeral: PrivacySetting
                            })

                        } else {

                            const InvalidNumbers = new MessageEmbed()
                                .setTitle(`${emojis.ERROR} You can't do that`)
                                .setColor(colours.ERRORRED)
                                .setDescription(`The values that you've entered are unrealistic`)
                                .setFooter({
                                    text: `This is not 100% accurate so it's recommended to vist a medical professional for more accurate results`,
                                })

                            if (userHeight <= 0 || userWeight <= 0) return interaction.reply({
                                embeds: [InvalidNumbers],
                                ephemeral: true
                            })

                            const BMI = BMIMetric(userWeight, userHeight).toFixed(1);

                            const ScaleResult = BMIScale(BMI);

                            const UnrealisticBMI = new MessageEmbed()
                                .setTitle(title.ERROR)
                                .setColor(colours.ERRORRED)
                                .setDescription(`Unrealistic BMI`)
                                .setFooter({
                                    text: `This is not 100% accurate so it's recommended to vist a medical professional for more accurate results`,
                                })

                            if (BMI < 10 || BMI > 50) {
                                return interaction.reply({
                                    embeds: [UnrealisticBMI],
                                    ephemeral: true
                                })
                            }
                            const MetEmbed = new MessageEmbed()
                                .setTitle(`${emojis.VERIFY} Estimated BMI`)
                                .setColor(colours.DEFAULT)
                                .addFields({
                                    name: "Weight:",
                                    value: `${userWeight} Kilograms (Kg)`,
                                    inline: true
                                }, {
                                    name: "Height:",
                                    value: `${userHeight} Meters`,
                                    inline: true
                                }, {
                                    name: "System used:",
                                    value: unitSystem,
                                    inline: true
                                }, {
                                    name: 'BMI:',
                                    value: BMI,
                                    inline: true
                                }, {
                                    name: '\u200b',
                                    value: `\u200b`,
                                    inline: true
                                }, {
                                    name: 'Weight Status:',
                                    value: ScaleResult,
                                    inline: true
                                })
                                .setFooter({
                                    text: `Requested by: ${interaction.user.username}`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [MetEmbed],
                                ephemeral: PrivacySetting
                            })
                        }

                    }
                },
