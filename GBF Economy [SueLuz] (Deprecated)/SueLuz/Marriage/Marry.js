const SlashCommand = require('../../../utils/slashCommands');

const {
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    Message
} = require('discord.js')

const titles = require('../../../gbfembedmessages.json')
const emojis = require('../../../GBFEmojis.json')
const colours = require('../../../GBFColor.json');
const MoneySchema = require('../../../schemas/SueLuz-Account-Info-Schema');
const StoryProgressSchema = require('../../../schemas/SueLuz-Story-Progress-Schema');
const UserCollectionSchema = require('../../../schemas/SueLuz-Collection-Schema');

const {
    delay,
    NeededRP
} = require("../../../utils/engine");

const client = require('nekos.life');

const {
    sfw
} = new client();

const fetch = require('node-fetch');

module.exports = class HeistBegineerSLash extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "marry",
            category: "Love",
            description: "Marry another user",
            usage: "/marry <user>",
            examples: "/marry .Bunnys",

            options: [{
                name: "user",
                description: "The user that you want to marry",
                type: 'USER',
                required: false
            }, {
                name: "ring",
                description: "The ring that you want to use",
                type: "STRING",
                choices: [{
                    name: "Level One Diamond Ring",
                    value: "1"
                }, {
                    name: "Level Two Diamond Ring",
                    value: "2"
                }, {
                    name: "Level Three Diamond Ring",
                    value: "3"
                }, {
                    name: "Level Four Diamond Ring",
                    value: "4"
                }, {
                    name: "Musgravite Ring",
                    value: "5"
                }, {
                    name: "Painite Ring",
                    value: "6"
                }, {
                    name: "Pink Star Diamond Ring",
                    value: "7"
                }],
                required: false
            }],

            devOnly: false,
            userPermission: [],
            botPermission: [],
            cooldown: 0,
            development: true,
            Partner: false,
        });
    }


    async execute({
        client,
        interaction
    }) {

        const target = interaction.options.getUser("user");
        const ring = interaction.options.getString("ring");


        //Docs for the user money, RP, level, Rank
        let accountDocs = await MoneySchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        //Docs for story progression, type
        let storyDocs = await StoryProgressSchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        // User collection profile    
        let collectionDocs = await UserCollectionSchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))

        if (!target || !ring) {
            if (accountDocs.Married === 'No') {
                const Cant = new MessageEmbed()
                    .setTitle("You can't do that")
                    .setColor(colours.ERRORRED)
                    .setDescription(`Please mention a user that you want to marry and specify the ring that you wish to use`)

                return interaction.reply({
                    embeds: [Cant]
                })
            }

            let MarriedRingType
            const RingNum = Number(accountDocs.MarriedRing)

            if (RingNum === 1) {
                MarriedRingType = 'Level One Diamond Ring'
            } else if (RingNum === 2) {
                MarriedRingType = 'Level Two Diamond Ring'
            } else if (RingNum === 3) {
                MarriedRingType = 'Level Three Diamond Ring'
            } else if (RingNum === 4) {
                MarriedRingType = 'Level Four Diamond Ring'
            } else if (RingNum === 5) {
                MarriedRingType = 'Musgravite Ring'
            } else if (RingNum === 6) {
                MarriedRingType = 'Painite Ring'
            } else if (RingNum === 7) {
                MarriedRingType = 'Pink Star Diamond Ring'
            } else {
                MarriedRingType = 'NaN'
            }

            if (accountDocs.Married === 'Yes') {

                const Married = new MessageEmbed()
                    .setTitle("What a cute couple 💗")
                    .setColor('#ADD8E6')
                    .setDescription(`**${interaction.user.username}** and **${accountDocs.MarriedTo}** have been married since <t:${accountDocs.MarriedAt}:f>, <t:${accountDocs.MarriedAt}:R>\nRing: **${MarriedRingType}**`)

                return interaction.reply({
                    embeds: [Married]
                })

            }
        }

        if (target) {

            //Docs for the target
            let targetDocs = await MoneySchema.findOne({
                userId: target.id
            }).catch(err => console.log(err))
            //Docs for story progression, type
            let TargetstoryDocs = await StoryProgressSchema.findOne({
                userId: target.id
            }).catch(err => console.log(err))

            if (!storyDocs || !accountDocs) {
                const IntroRequired = new MessageEmbed()
                    .setTitle('Feature unavailable')
                    .setDescription(`Please complete the intro mission to unlock this feature\nTo play the intro mission use /intro`)
                    .setColor(colours.DEFAULT)

                return interaction.reply({
                    embeds: [IntroRequired]
                })
            }

            let MarriedRingType
            const RingNum = Number(accountDocs.MarriedRing)

            if (RingNum === 1) {
                MarriedRingType = 'Level One Diamond Ring'
            } else if (RingNum === 2) {
                MarriedRingType = 'Level Two Diamond Ring'
            } else if (RingNum === 3) {
                MarriedRingType = 'Level Three Diamond Ring'
            } else if (RingNum === 4) {
                MarriedRingType = 'Level Four Diamond Ring'
            } else if (RingNum === 5) {
                MarriedRingType = 'Musgravite Ring'
            } else if (RingNum === 6) {
                MarriedRingType = 'Painite Ring'
            } else if (RingNum === 7) {
                MarriedRingType = 'Pink Star Diamond Ring'
            } else {
                MarriedRingType = 'NaN'
            }

            let ProposeRing = Number(ring)
            let RingTypePropose
            if (ProposeRing === 1) {
                RingTypePropose = 'Level One Diamond Ring'
            } else if (RingNum === 2) {
                RingTypePropose = 'Level Two Diamond Ring'
            } else if (ProposeRing === 3) {
                RingTypePropose = 'Level Three Diamond Ring'
            } else if (ProposeRing === 4) {
                RingTypePropose = 'Level Four Diamond Ring'
            } else if (ProposeRing === 5) {
                RingTypePropose = 'Musgravite Ring'
            } else if (ProposeRing === 6) {
                RingTypePropose = 'Painite Ring'
            } else if (ProposeRing === 7) {
                RingTypePropose = 'Pink Star Diamond Ring'
            } else {
                RingTypePropose = 'NaN'
            }

            if (accountDocs.Married === 'Yes') {

                const Married = new MessageEmbed()
                    .setTitle("What a cute couple 💗")
                    .setColor('#ADD8E6')
                    .setDescription(`**${interaction.user.username}** and **${accountDocs.MarriedTo}** have been married since <t:${accountDocs.MarriedAt}:f>, <t:${accountDocs.MarriedAt}:R>\nRing: **${MarriedRingType}**`)

                return interaction.reply({
                    embeds: [Married]
                })

            }


            if (!targetDocs || !TargetstoryDocs) {
                const IntroRequired = new MessageEmbed()
                    .setTitle('Feature unavailable')
                    .setDescription(`${target.username} has to complete the intro mission to unlock this feature\nTo play the intro mission use /intro`)
                    .setColor(colours.DEFAULT)

                return interaction.reply({
                    embeds: [IntroRequired]
                })
            }

            if (targetDocs.Married === 'Yes') {

                const AlrMarried = new MessageEmbed()
                    .setTitle("You can't do that")
                    .setColor(colours.LIGHTBLUE)
                    .setDescription(`**${target.username}** is already married to **${targetDocs.MarriedTo}**`)
                    .setFooter({
                        text: `Don't try to ruin other people's marriages`,
                        iconURL: client.user.displayAvatarURL()
                    })
                return interaction.reply({
                    embeds: [AlrMarried]
                })
            }

            if (target.id === interaction.user.id) {
                const umm = new MessageEmbed()
                    .setTitle("Ummm")
                    .setDescription(`You can't marry yourself...`)
                    .setColor(colours.ERRORRED)

                return interaction.reply({
                    embeds: [umm]
                })
            }

            const RingType = Number(collectionDocs.ringType)

            const AreYouSure = new MessageEmbed()
                .setTitle(`${interaction.user.username} is proposing with a **${RingTypePropose}** to ${target.username}`)
                .setColor('#ADD8E6')
                .setDescription(`**When I first saw you ${target.username} I knew that I wanted to be with you forever, I promise to make you the happiest and to forever and always love you**\nWill you be my partner forever ${target.username}💍`)
                .setFooter({
                    text: `Please use the buttons to accept or decline`,
                    iconURL: target.displayAvatarURL()
                })


            if (ring === '1') {

                if (collectionDocs.rings.includes(1)) {

                    const Yes = new MessageButton()
                        .setCustomId('1yes')
                        .setStyle('SUCCESS')
                        .setLabel("I say yes")
                        .setEmoji("💍")
                    const No = new MessageButton()
                        .setCustomId('1no')
                        .setStyle('DANGER')
                        .setLabel("We're better off as just friends")
                        .setEmoji("💔")
                    const YesNoRow = new MessageActionRow().addComponents([Yes, No])

                    await interaction.reply({
                        content: `**<@${interaction.user.id}> is proposing to <@${target.id}>**`,
                        embeds: [AreYouSure],
                        components: [YesNoRow]
                    })

                    const filter = i => i.customId

                    setTimeout(() => {

                        interaction.editReply({
                            components: []
                        })

                    }, 114000);

                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        idle: 30000,
                        time: 120000
                    });

                    collector.on('collect', async i => {
                        await i.deferUpdate();
                        await delay(750);

                        if (i.customId === '1yes') {

                            if (i.user.id === target.id) {

                                const JustMarried = new MessageEmbed()
                                    .setTitle("Congratulations 🎉🎊💗")
                                    .setURL("https://www.youtube.com/watch?v=HRbgGQ7rHi0")
                                    .setColor("#ADD8E6")
                                    .setDescription(`**${interaction.user.username}** and **${target.username}** JUST GOT MARRIED!! 💍 💐🌸\n\nMarried at: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Ring: Level One Diamond Ring from DynastySue`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                await interaction.editReply({
                                    embeds: [JustMarried],
                                    components: []
                                })

                                let link2 = await sfw.kiss()

                                const kissEmbed = new MessageEmbed()

                                    .setTitle("You may now kiss 😘")
                                    .setDescription(`**<@${interaction.user.id}> kissed ${target}**`)
                                    .setColor("#ADD8E6")
                                    .setImage(link2.url)

                                await interaction.channel.send({
                                    embeds: [kissEmbed]
                                })

                                await collectionDocs.rings.pull(1);
                                await collectionDocs.save().catch(err => console.log(err));

                                await accountDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 1,
                                    MarriedTo: target.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                await targetDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 1,
                                    MarriedTo: interaction.user.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                return
                            } else {
                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })
                            }

                        } else if (i.customId === '1no') {

                            if (i.user.id === target.id) {

                                const Rejected = new MessageEmbed()
                                    .setTitle("Ouch")
                                    .setColor("#ADD8E6")
                                    .setDescription(`**${target.username}** thought they should just stay as friends... Ouch`)
                                    .setFooter({
                                        text: `Someone give ${interaction.user.username} a hug`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                let link = await sfw.hug()

                                const hugEmbed = new MessageEmbed()

                                    .setTitle("Feel better soon")
                                    .setDescription(`**<@!${client.user.id}> gave <@${target.id}> a long warm hug**`)
                                    .setColor("#ADD8E6")
                                    .setImage(link.url)

                                await interaction.channel.send({
                                    embeds: [hugEmbed]
                                })

                                return interaction.editReply({
                                    embeds: [Rejected],
                                    components: []
                                })

                            } else {

                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })

                            }

                        }

                    })

                } else {

                    const NoRing = new MessageEmbed()
                        .setTitle('You can\'t do that yet')
                        .setColor(colours.ERRORRED)
                        .setDescription(`Looks like you don't have that ring\n\nYou can buy one at DynastySue Jewels, user /shop rings then /buy once you've picked out the ring of your choice`)
                        .setFooter({
                            text: `SueLuz Official Marriage`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    return interaction.reply({
                        embeds: [NoRing]
                    })
                }

            }

            //Ring 2

            if (ring === '2') {

                if (collectionDocs.rings.includes(2)) {

                    const Yes = new MessageButton()
                        .setCustomId('2yes')
                        .setStyle('SUCCESS')
                        .setLabel("I say yes")
                        .setEmoji("💍")
                    const No = new MessageButton()
                        .setCustomId('2no')
                        .setStyle('DANGER')
                        .setLabel("We're better off as just friends")
                        .setEmoji("💔")
                    const YesNoRow = new MessageActionRow().addComponents([Yes, No])

                    await interaction.reply({
                        content: `**<@${interaction.user.id}> is proposing to <@${target.id}>**`,
                        embeds: [AreYouSure],
                        components: [YesNoRow]
                    })

                    const filter = i => i.customId

                    setTimeout(() => {

                        interaction.editReply({
                            components: []
                        })

                    }, 114000);

                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        idle: 30000,
                        time: 120000
                    });

                    collector.on('collect', async i => {
                        await i.deferUpdate();
                        await delay(750);

                        if (i.customId === '2yes') {

                            if (i.user.id === target.id) {

                                const JustMarried = new MessageEmbed()
                                    .setTitle("Congratulations 🎉🎊💗")
                                    .setURL("https://www.youtube.com/watch?v=HRbgGQ7rHi0")
                                    .setColor("#ADD8E6")
                                    .setDescription(`**${interaction.user.username}** and **${target.username}** JUST GOT MARRIED!! 💍 💐🌸\n\nMarried at: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Ring: Level Two Diamond Ring from DynastySue`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                await interaction.editReply({
                                    embeds: [JustMarried],
                                    components: []
                                })

                                let link3 = await sfw.kiss()

                                const kissEmbed = new MessageEmbed()

                                    .setTitle("You may now kiss 😘")
                                    .setDescription(`**<@${interaction.user.id}> kissed ${target}**`)
                                    .setColor("#ADD8E6")
                                    .setImage(link3.url)

                                await interaction.channel.send({
                                    embeds: [kissEmbed]
                                })

                                await collectionDocs.rings.pull(2);
                                await collectionDocs.save().catch(err => console.log(err));

                                await accountDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 2,
                                    MarriedTo: target.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                await targetDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 2,
                                    MarriedTo: interaction.user.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                return
                            } else {
                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })
                            }

                        } else if (i.customId === '2no') {

                            if (i.user.id === target.id) {

                                const Rejected = new MessageEmbed()
                                    .setTitle("Ouch")
                                    .setColor("#ADD8E6")
                                    .setDescription(`**${target.username}** thought they should just stay as friends... Ouch`)
                                    .setFooter({
                                        text: `Someone give ${interaction.user.username} a hug`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                let link = await sfw.hug()

                                const hugEmbed = new MessageEmbed()

                                    .setTitle("Feel better soon")
                                    .setDescription(`**<@!${client.user.id}> gave <@${target.id}> a long warm hug**`)
                                    .setColor("#ADD8E6")
                                    .setImage(link.url)

                                await interaction.channel.send({
                                    embeds: [hugEmbed]
                                })

                                return interaction.editReply({
                                    embeds: [Rejected],
                                    components: []
                                })

                            } else {

                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })

                            }
                        }
                    })
                } else {

                    const NoRing = new MessageEmbed()
                        .setTitle('You can\'t do that yet')
                        .setColor(colours.ERRORRED)
                        .setDescription(`Looks like you don't have that ring\n\nYou can buy one at DynastySue Jewels, user /shop rings then /buy once you've picked out the ring of your choice`)
                        .setFooter({
                            text: `SueLuz Official Marriage`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    return interaction.reply({
                        embeds: [NoRing]
                    })
                }
            }

            //Ring 3

            if (ring === '3') {

                if (collectionDocs.rings.includes(3)) {

                    const Yes = new MessageButton()
                        .setCustomId('3yes')
                        .setStyle('SUCCESS')
                        .setLabel("I say yes")
                        .setEmoji("💍")
                    const No = new MessageButton()
                        .setCustomId('3no')
                        .setStyle('DANGER')
                        .setLabel("We're better off as just friends")
                        .setEmoji("💔")
                    const YesNoRow = new MessageActionRow().addComponents([Yes, No])

                    await interaction.reply({
                        content: `**<@${interaction.user.id}> is proposing to <@${target.id}>**`,
                        embeds: [AreYouSure],
                        components: [YesNoRow]
                    })

                    const filter = i => i.customId

                    setTimeout(() => {

                        interaction.editReply({
                            components: []
                        })

                    }, 114000);

                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        idle: 30000,
                        time: 120000
                    });

                    collector.on('collect', async i => {
                        await i.deferUpdate();
                        await delay(750);

                        if (i.customId === '3yes') {

                            if (i.user.id === target.id) {

                                const JustMarried = new MessageEmbed()
                                    .setTitle("Congratulations 🎉🎊💗")
                                    .setURL("https://www.youtube.com/watch?v=HRbgGQ7rHi0")
                                    .setColor("#ADD8E6")
                                    .setDescription(`**${interaction.user.username}** and **${target.username}** JUST GOT MARRIED!! 💍 💐🌸\n\nMarried at: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Ring: Three Two Diamond Ring from DynastySue`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                await interaction.editReply({
                                    embeds: [JustMarried],
                                    components: []
                                })

                                let link4 = await sfw.kiss()

                                const kissEmbed = new MessageEmbed()

                                    .setTitle("You may now kiss 😘")
                                    .setDescription(`**<@${interaction.user.id}> kissed ${target}**`)
                                    .setColor("#ADD8E6")
                                    .setImage(link4.url)

                                await interaction.channel.send({
                                    embeds: [kissEmbed]
                                })

                                await collectionDocs.rings.pull(3);
                                await collectionDocs.save().catch(err => console.log(err));

                                await accountDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 3,
                                    MarriedTo: target.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                await targetDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 3,
                                    MarriedTo: interaction.user.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                return
                            } else {
                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })
                            }

                        } else if (i.customId === '3no') {

                            if (i.user.id === target.id) {

                                const Rejected = new MessageEmbed()
                                    .setTitle("Ouch")
                                    .setColor("#ADD8E6")
                                    .setDescription(`**${target.username}** thought they should just stay as friends... Ouch`)
                                    .setFooter({
                                        text: `Someone give ${interaction.user.username} a hug`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                let link = await sfw.hug()

                                const hugEmbed = new MessageEmbed()

                                    .setTitle("Feel better soon")
                                    .setDescription(`**<@!${client.user.id}> gave <@${target.id}> a long warm hug**`)
                                    .setColor("#ADD8E6")
                                    .setImage(link.url)

                                await interaction.channel.send({
                                    embeds: [hugEmbed]
                                })

                                return interaction.editReply({
                                    embeds: [Rejected],
                                    components: []
                                })

                            } else {

                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })

                            }
                        }
                    })
                } else {

                    const NoRing = new MessageEmbed()
                        .setTitle('You can\'t do that yet')
                        .setColor(colours.ERRORRED)
                        .setDescription(`Looks like you don't have that ring\n\nYou can buy one at DynastySue Jewels, user /shop rings then /buy once you've picked out the ring of your choice`)
                        .setFooter({
                            text: `SueLuz Official Marriage`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    return interaction.reply({
                        embeds: [NoRing]
                    })
                }
            }

            //Ring 4

            if (ring === '4') {

                if (collectionDocs.rings.includes(4)) {

                    const Yes = new MessageButton()
                        .setCustomId('4yes')
                        .setStyle('SUCCESS')
                        .setLabel("I say yes")
                        .setEmoji("💍")
                    const No = new MessageButton()
                        .setCustomId('4no')
                        .setStyle('DANGER')
                        .setLabel("We're better off as just friends")
                        .setEmoji("💔")
                    const YesNoRow = new MessageActionRow().addComponents([Yes, No])

                    await interaction.reply({
                        content: `**<@${interaction.user.id}> is proposing to <@${target.id}>**`,
                        embeds: [AreYouSure],
                        components: [YesNoRow]
                    })

                    const filter = i => i.customId

                    setTimeout(() => {

                        interaction.editReply({
                            components: []
                        })

                    }, 114000);

                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        idle: 30000,
                        time: 120000
                    });

                    collector.on('collect', async i => {
                        await i.deferUpdate();
                        await delay(750);

                        if (i.customId === '4yes') {

                            if (i.user.id === target.id) {

                                const JustMarried = new MessageEmbed()
                                    .setTitle("Congratulations 🎉🎊💗")
                                    .setURL("https://www.youtube.com/watch?v=HRbgGQ7rHi0")
                                    .setColor("#ADD8E6")
                                    .setDescription(`**${interaction.user.username}** and **${target.username}** JUST GOT MARRIED!! 💍 💐🌸\n\nMarried at: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Ring: Level Four Diamond Ring from DynastySue`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                await interaction.editReply({
                                    embeds: [JustMarried],
                                    components: []
                                })

                                let link5 = await sfw.kiss()

                                const kissEmbed = new MessageEmbed()

                                    .setTitle("You may now kiss 😘")
                                    .setDescription(`**<@${interaction.user.id}> kissed ${target}**`)
                                    .setColor("#ADD8E6")
                                    .setImage(link5.url)

                                await interaction.channel.send({
                                    embeds: [kissEmbed]
                                })

                                await collectionDocs.rings.pull(4);
                                await collectionDocs.save().catch(err => console.log(err));

                                await accountDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 4,
                                    MarriedTo: target.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                await targetDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 4,
                                    MarriedTo: interaction.user.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                return
                            } else {
                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })
                            }

                        } else if (i.customId === '4no') {

                            if (i.user.id === target.id) {

                                const Rejected = new MessageEmbed()
                                    .setTitle("Ouch")
                                    .setColor("#ADD8E6")
                                    .setDescription(`**${target.username}** thought they should just stay as friends... Ouch`)
                                    .setFooter({
                                        text: `Someone give ${interaction.user.username} a hug`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                let link = await sfw.hug()

                                const hugEmbed = new MessageEmbed()

                                    .setTitle("Feel better soon")
                                    .setDescription(`**<@!${client.user.id}> gave <@${target.id}> a long warm hug**`)
                                    .setColor("#ADD8E6")
                                    .setImage(link.url)

                                await interaction.channel.send({
                                    embeds: [hugEmbed]
                                })

                                return interaction.editReply({
                                    embeds: [Rejected],
                                    components: []
                                })

                            } else {

                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })

                            }
                        }
                    })
                } else {

                    const NoRing = new MessageEmbed()
                        .setTitle('You can\'t do that yet')
                        .setColor(colours.ERRORRED)
                        .setDescription(`Looks like you don't have that ring\n\nYou can buy one at DynastySue Jewels, user /shop rings then /buy once you've picked out the ring of your choice`)
                        .setFooter({
                            text: `SueLuz Official Marriage`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    return interaction.reply({
                        embeds: [NoRing]
                    })
                }
            }

            //Ring 5

            if (ring === '5') {

                if (collectionDocs.rings.includes(5)) {

                    const Yes = new MessageButton()
                        .setCustomId('5yes')
                        .setStyle('SUCCESS')
                        .setLabel("I say yes")
                        .setEmoji("💍")
                    const No = new MessageButton()
                        .setCustomId('5no')
                        .setStyle('DANGER')
                        .setLabel("We're better off as just friends")
                        .setEmoji("💔")
                    const YesNoRow = new MessageActionRow().addComponents([Yes, No])

                    await interaction.reply({
                        content: `**<@${interaction.user.id}> is proposing to <@${target.id}>**`,
                        embeds: [AreYouSure],
                        components: [YesNoRow]
                    })

                    const filter = i => i.customId

                    setTimeout(() => {

                        interaction.editReply({
                            components: []
                        })

                    }, 114000);

                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        idle: 30000,
                        time: 120000
                    });

                    collector.on('collect', async i => {
                        await i.deferUpdate();
                        await delay(750);

                        if (i.customId === '5yes') {

                            if (i.user.id === target.id) {

                                const JustMarried = new MessageEmbed()
                                    .setTitle("Congratulations 🎉🎊💗")
                                    .setURL("https://www.youtube.com/watch?v=HRbgGQ7rHi0")
                                    .setColor("#ADD8E6")
                                    .setDescription(`**${interaction.user.username}** and **${target.username}** JUST GOT MARRIED!! 💍 💐🌸\n\nMarried at: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Ring: Musgravite Ring from DynastySue`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                await interaction.editReply({
                                    embeds: [JustMarried],
                                    components: []
                                })

                                let link6 = await sfw.kiss()

                                const kissEmbed = new MessageEmbed()

                                    .setTitle("You may now kiss 😘")
                                    .setDescription(`**<@${interaction.user.id}> kissed ${target}**`)
                                    .setColor("#ADD8E6")
                                    .setImage(link6.url)

                                await interaction.channel.send({
                                    embeds: [kissEmbed]
                                })

                                await collectionDocs.rings.pull(5);
                                await collectionDocs.save().catch(err => console.log(err));

                                await accountDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 5,
                                    MarriedTo: target.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                await targetDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 5,
                                    MarriedTo: interaction.user.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                return
                            } else {
                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })
                            }

                        } else if (i.customId === '5no') {

                            if (i.user.id === target.id) {

                                const Rejected = new MessageEmbed()
                                    .setTitle("Ouch")
                                    .setColor("#ADD8E6")
                                    .setDescription(`**${target.username}** thought they should just stay as friends... Ouch`)
                                    .setFooter({
                                        text: `Someone give ${interaction.user.username} a hug`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                let link = await sfw.hug()

                                const hugEmbed = new MessageEmbed()

                                    .setTitle("Feel better soon")
                                    .setDescription(`**<@!${client.user.id}> gave <@${target.id}> a long warm hug**`)
                                    .setColor("#ADD8E6")
                                    .setImage(link.url)

                                await interaction.channel.send({
                                    embeds: [hugEmbed]
                                })

                                return interaction.editReply({
                                    embeds: [Rejected],
                                    components: []
                                })

                            } else {

                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })

                            }
                        }
                    })
                } else {

                    const NoRing = new MessageEmbed()
                        .setTitle('You can\'t do that yet')
                        .setColor(colours.ERRORRED)
                        .setDescription(`Looks like you don't have that ring\n\nYou can buy one at DynastySue Jewels, user /shop rings then /buy once you've picked out the ring of your choice`)
                        .setFooter({
                            text: `SueLuz Official Marriage`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    return interaction.reply({
                        embeds: [NoRing]
                    })
                }
            }

            //Ring 6

            if (ring === '6') {

                if (collectionDocs.rings.includes(6)) {

                    const Yes = new MessageButton()
                        .setCustomId('6yes')
                        .setStyle('SUCCESS')
                        .setLabel("I say yes")
                        .setEmoji("💍")
                    const No = new MessageButton()
                        .setCustomId('6no')
                        .setStyle('DANGER')
                        .setLabel("We're better off as just friends")
                        .setEmoji("💔")
                    const YesNoRow = new MessageActionRow().addComponents([Yes, No])

                    await interaction.reply({
                        content: `**<@${interaction.user.id}> is proposing to <@${target.id}>**`,
                        embeds: [AreYouSure],
                        components: [YesNoRow]
                    })

                    const filter = i => i.customId

                    setTimeout(() => {

                        interaction.editReply({
                            components: []
                        })

                    }, 114000);

                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        idle: 30000,
                        time: 120000
                    });

                    collector.on('collect', async i => {
                        await i.deferUpdate();
                        await delay(760);

                        if (i.customId === '6yes') {

                            if (i.user.id === target.id) {

                                const JustMarried = new MessageEmbed()
                                    .setTitle("Congratulations 🎉🎊💗")
                                    .setURL("https://www.youtube.com/watch?v=HRbgGQ7rHi0")
                                    .setColor("#ADD8E6")
                                    .setDescription(`**${interaction.user.username}** and **${target.username}** JUST GOT MARRIED!! 💍 💐🌸\n\nMarried at: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Ring: Painite Ring from DynastySue`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                await interaction.editReply({
                                    embeds: [JustMarried],
                                    components: []
                                })

                                let link7 = await sfw.kiss()

                                const kissEmbed = new MessageEmbed()

                                    .setTitle("You may now kiss  😘")
                                    .setDescription(`**<@${interaction.user.id}> kissed ${target}**`)
                                    .setColor("#ADD8E6")
                                    .setImage(link7.url)

                                await interaction.channel.send({
                                    embeds: [kissEmbed]
                                })

                                await collectionDocs.rings.pull(6);
                                await collectionDocs.save().catch(err => console.log(err));

                                await accountDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 6,
                                    MarriedTo: target.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                await targetDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 6,
                                    MarriedTo: interaction.user.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                return
                            } else {
                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })
                            }

                        } else if (i.customId === '6no') {

                            if (i.user.id === target.id) {

                                const Rejected = new MessageEmbed()
                                    .setTitle("Ouch")
                                    .setColor("#ADD8E6")
                                    .setDescription(`**${target.username}** thought they should just stay as friends... Ouch`)
                                    .setFooter({
                                        text: `Someone give ${interaction.user.username} a hug`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                let link = await sfw.hug()

                                const hugEmbed = new MessageEmbed()

                                    .setTitle("Feel better soon")
                                    .setDescription(`**<@!${client.user.id}> gave <@${target.id}> a long warm hug**`)
                                    .setColor("#ADD8E6")
                                    .setImage(link.url)

                                await interaction.channel.send({
                                    embeds: [hugEmbed]
                                })

                                return interaction.editReply({
                                    embeds: [Rejected],
                                    components: []
                                })

                            } else {

                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })

                            }
                        }
                    })
                } else {

                    const NoRing = new MessageEmbed()
                        .setTitle('You can\'t do that yet')
                        .setColor(colours.ERRORRED)
                        .setDescription(`Looks like you don't have that ring\n\nYou can buy one at DynastySue Jewels, user /shop rings then /buy once you've picked out the ring of your choice`)
                        .setFooter({
                            text: `SueLuz Official Marriage`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    return interaction.reply({
                        embeds: [NoRing]
                    })
                }
            }

            //Ring 7 

            if (ring === '7') {

                if (collectionDocs.rings.includes(7)) {

                    const Yes = new MessageButton()
                        .setCustomId('7yes')
                        .setStyle('SUCCESS')
                        .setLabel("I say yes")
                        .setEmoji("💍")
                    const No = new MessageButton()
                        .setCustomId('7no')
                        .setStyle('DANGER')
                        .setLabel("We're better off as just friends")
                        .setEmoji("💔")
                    const YesNoRow = new MessageActionRow().addComponents([Yes, No])

                    await interaction.reply({
                        content: `**<@${interaction.user.id}> is proposing to <@${target.id}>**`,
                        embeds: [AreYouSure],
                        components: [YesNoRow]
                    })

                    const filter = i => i.customId

                    setTimeout(() => {

                        interaction.editReply({
                            components: []
                        })

                    }, 114000);

                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        idle: 30000,
                        time: 120000
                    });

                    collector.on('collect', async i => {
                        await i.deferUpdate();
                        await delay(770);

                        if (i.customId === '7yes') {

                            if (i.user.id === target.id) {

                                const JustMarried = new MessageEmbed()
                                    .setTitle("Congratulations 🎉🎊💗")
                                    .setURL("https://www.youtube.com/watch?v=HRbgGQ7rHi0")
                                    .setColor("#ADD8E7")
                                    .setDescription(`**${interaction.user.username}** and **${target.username}** JUST GOT MARRIED!! 💍 💐🌸\n\nMarried at: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Ring: Pink Star Diamond Ring from DynastySue`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                await interaction.editReply({
                                    embeds: [JustMarried],
                                    components: []
                                })

                                const DynastySue = new MessageEmbed()
                                    .setTitle("Congratulations!")
                                    .setDescription(`As a thank you for using one of DynastySue's top end ring we have given you both a suprise box!\n\n**+1 Rank**\n**+₲25,000**`)
                                    .setColor("#ADD8E7")
                                    .setFooter({
                                        text: `Ring: Pink Star Diamond Ring from DynastySue`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                await interaction.channel.send({
                                    embeds: [DynastySue]
                                })

                                const RankedUp = new MessageEmbed()
                                    .setTitle("Ranked up")
                                    .setDescription(`${interaction.user.username}:\n Rank: **${Number((accountDocs.Rank) + 1).toLocaleString()}**\nRP required for level ${Number((accountDocs.Rank) + 2).toLocaleString()}: **${NeededRP((accountDocs.Rank + 2)).toLocaleString()}**\n${target.username}:\n Rank: **${Number((targetDocs.Rank) + 1).toLocaleString()}**\nRP required for level ${Number(targetDocs.Rank) + 2}: **${NeededRP((targetDocs.Rank + 2)).toLocaleString()}**`)
                                    .setColor("#ADD8E7")

                                await accountDocs.updateOne({
                                    userId: interaction.user.id,
                                    userName: interaction.user.tag,
                                    userNameNoTag: interaction.user.username,
                                    bankBal: Number(accountDocs.bankBal) + 25000,
                                    RP: 0,
                                    Rank: Number(accountDocs.Rank) + 1
                                })

                                await targetDocs.updateOne({
                                    userId: target.id,
                                    userName: target.tag,
                                    userNameNoTag: target.username,
                                    bankBal: Number(targetDocs.bankBal) + 25000,
                                    RP: 0,
                                    Rank: Number(targetDocs.Rank) + 1
                                })

                                await interaction.channel.send({
                                    embeds: [RankedUp]
                                })

                                let link8 = await sfw.kiss()

                                const kissEmbed = new MessageEmbed()

                                    .setTitle("You may now kiss 😘")
                                    .setDescription(`**<@${interaction.user.id}> kissed ${target}**`)
                                    .setColor("#ADD8E7")
                                    .setImage(link8.url)

                                await interaction.channel.send({
                                    embeds: [kissEmbed]
                                })

                                await collectionDocs.rings.pull(7);
                                await collectionDocs.save().catch(err => console.log(err));

                                await accountDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 7,
                                    MarriedTo: target.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                await targetDocs.updateOne({
                                    Married: 'Yes',
                                    MarriedRing: 7,
                                    MarriedTo: interaction.user.username,
                                    MarriedAt: `${Math.floor(new Date() / 1000)}`
                                })

                                return
                            } else {
                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })
                            }

                        } else if (i.customId === '7no') {

                            if (i.user.id === target.id) {

                                const Rejected = new MessageEmbed()
                                    .setTitle("Ouch")
                                    .setColor("#ADD8E7")
                                    .setDescription(`**${target.username}** thought they should just stay as friends... Ouch`)
                                    .setFooter({
                                        text: `Someone give ${interaction.user.username} a hug`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                let link = await sfw.hug()

                                const hugEmbed = new MessageEmbed()

                                    .setTitle("Feel better soon")
                                    .setDescription(`**<@!${client.user.id}> gave <@${target.id}> a long warm hug**`)
                                    .setColor("#ADD8E7")
                                    .setImage(link.url)

                                await interaction.channel.send({
                                    embeds: [hugEmbed]
                                })

                                return interaction.editReply({
                                    embeds: [Rejected],
                                    components: []
                                })

                            } else {

                                await interaction.followUp({
                                    content: `**${i.user.username}** you cannot use that, only **${target.username}** can use this button!`,
                                    ephemeral: true
                                })

                            }
                        }
                    })
                } else {

                    const NoRing = new MessageEmbed()
                        .setTitle('You can\'t do that yet')
                        .setColor(colours.ERRORRED)
                        .setDescription(`Looks like you don't have that ring\n\nYou can buy one at DynastySue Jewels, user /shop rings then /buy once you've picked out the ring of your choice`)
                        .setFooter({
                            text: `SueLuz Official Marriage`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    return interaction.reply({
                        embeds: [NoRing]
                    })
                }
            }
        }
    }
}
