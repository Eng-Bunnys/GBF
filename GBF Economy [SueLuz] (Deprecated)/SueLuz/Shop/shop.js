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

module.exports = class Shops extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "shop",
            description: "SueLuz market place",
            category: "Utility",
            botPermission: ['SEND_MESSAGES', 'EMBED_LINKS'],
            cooldown: 2,
            development: true,

            subcommands: {

                rings: {
                    description: "Buy some of the best top end rings here at DynastySue Jewels",
                    args: [{
                        name: "ring",
                        description: "The name of the item that you want to buy",
                        type: 'STRING',
                        choices: [{
                            name: "View Shop",
                            value: "Shop"
                        }, {
                            name: "Buy Level One Diamond Ring",
                            value: "R1"
                        }, {
                            name: "Buy Level Two Diamond Ring",
                            value: "R2"
                        }, {
                            name: "Buy Level Three Diamond Ring",
                            value: "R3"
                        }, {
                            name: "Buy Level Four Diamond Ring",
                            value: "R4"
                        }, {
                            name: "Buy Musgravite Ring",
                            value: "TR1"
                        }, {
                            name: "Buy Painite Ring",
                            value: "TR2"
                        }, {
                            name: "Buy Pink Star Diamond Ring",
                            value: "TR3"
                        }],
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const ID = interaction.options.getString("ring")

                        //Docs for the user money, RP, level, Rank
                        let accountDocs = await MoneySchema.findOne({
                            userId: interaction.user.id
                        }).catch(err => console.log(err))
                        //Docs for story progression, type
                        let storyDocs = await StoryProgressSchema.findOne({
                            userId: interaction.user.id
                        }).catch(err => console.log(err))

                        let collectionDocs = await UserCollectionSchema.findOne({
                            userId: interaction.user.id
                        }).catch(err => console.log(err))

                        let UserBal

                        if (!storyDocs || !accountDocs) {
                            const IntroRequired = new MessageEmbed()
                                .setTitle('Feature unavailable')
                                .setDescription(`Please complete the intro mission to unlock this feature\nTo play the intro mission use /intro`)
                                .setColor(colours.DEFAULT)

                            return interaction.reply({
                                embeds: [IntroRequired]
                            })
                        }

                        const ShopMenu = new MessageEmbed()
                            .setTitle("DynastySue Jewels")
                            .setColor("#ADD8E6")
                            .setDescription(`Please enter the ID of the ring that you want to buy`)
                            .addFields({
                                name: "Level 1 Diamond Ring 💎 (ID: R1)",
                                value: "**₲50,000**",
                                inline: false
                            }, {
                                name: "Level 2 Diamond Ring 💎 (ID: R2)",
                                value: "**₲100,000**",
                                inline: false
                            }, {
                                name: "Level 3 Diamond Ring 💎 (ID: R3)",
                                value: "**₲200,000**"
                            }, {
                                name: "Level 4 Diamond Ring 💎 (ID: R4)",
                                value: "**₲500,000**"
                            }, {
                                name: "\u200b",
                                value: "**Top Rings**\n"
                            }, {
                                name: "Musgravite Ring 💍 (ID: TR1)",
                                value: "**₲5,000,000**"
                            }, {
                                name: "Painite Ring 💍 (ID: TR2)",
                                value: "**₲8,000,000**"
                            }, {
                                name: "Pink Star Diamond Ring 💍 (ID: TR3)",
                                value: "**₲15,000,000**"
                            })
                            .setFooter({
                                text: `Current location: DynastySue, SueLuz`,
                                iconURL: interaction.user.displayAvatarURL()
                            })

                        if (ID === 'Shop') {

                            return interaction.reply({
                                embeds: [ShopMenu]
                            })
                        }
                        if (ID === 'R1') {

                            const NoFunds = new MessageEmbed()

                                .setTitle(titles.ERROR)
                                .setColor(colours.ERRORRED)
                                .setDescription(`You don't have sufficient funds to play this, you need **₲50,000**`)
                                .setTimestamp()

                            if (!collectionDocs.rings.includes(1)) {

                                if (Number(accountDocs.walletBal) < 50000) {
                                    if (Number(accountDocs.bankBal) < 50000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    } else {
                                        UserBal = Number(accountDocs.bankBal)

                                        await accountDocs.updateOne({
                                            bankBal: Number(accountDocs.bankBal) - 50000
                                        })
                                    }
                                    if (Number(accountDocs.bankBal) < 50000 && Number(accountDocs.walletBal) < 50000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    }
                                } else {
                                    UserBal = Number(accountDocs.walletBal)

                                    await accountDocs.updateOne({
                                        walletBal: Number(accountDocs.walletBal) - 50000
                                    })
                                }

                                await collectionDocs.rings.push(1);
                                await collectionDocs.save().catch(err => console.log(err));
                                await collectionDocs.updateOne({
                                    ringType: 1
                                })

                                const Purchased = new MessageEmbed()
                                    .setTitle('Transaction complete')
                                    .setColor('#ADD8E6')
                                    .setDescription(`**Successfully purchased 💎 Level 1 Diamond Ring 💎**\n\nItem ID: **R1**\nPrice: **₲50,000**\nTax: **0%**\nTime of purchase: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Thanks for shopping at DynastySue || Home for the most over-priced rings`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                return interaction.reply({
                                    embeds: [Purchased]
                                })

                            }

                            if (collectionDocs.rings.includes(1)) {

                                const AlreadyInInv = new MessageEmbed()
                                    .setTitle('Transaction failed')
                                    .setColor('#ADD8E6')
                                    .setDescription(`💎 You can only have one of every type of ring 💎`)
                                    .setFooter({
                                        text: `DynastySue Jewelry`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                return interaction.reply({
                                    embeds: [AlreadyInInv]
                                })
                            }

                        } else if (ID === 'R2') {

                            const NoFunds = new MessageEmbed()

                                .setTitle(titles.ERROR)
                                .setColor(colours.ERRORRED)
                                .setDescription(`You don't have sufficient funds to play this, you need **₲100,000**`)
                                .setTimestamp()

                            if (!collectionDocs.rings.includes(2)) {

                                if (Number(accountDocs.walletBal) < 100000) {
                                    if (Number(accountDocs.bankBal) < 100000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    } else {
                                        UserBal = Number(accountDocs.bankBal)

                                        await accountDocs.updateOne({
                                            bankBal: Number(accountDocs.bankBal) - 100000
                                        })
                                    }
                                    if (Number(accountDocs.bankBal) < 100000 && Number(accountDocs.walletBal) < 100000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    }
                                } else {
                                    UserBal = Number(accountDocs.walletBal)

                                    await accountDocs.updateOne({
                                        walletBal: Number(accountDocs.walletBal) - 100000
                                    })
                                }

                                await collectionDocs.rings.push(2);
                                await collectionDocs.save().catch(err => console.log(err));
                                await collectionDocs.updateOne({
                                    ringType: 2
                                })

                                const Purchased = new MessageEmbed()
                                    .setTitle('Transaction complete')
                                    .setColor('#ADD8E6')
                                    .setDescription(`**Successfully purchased 💎 Level 2 Diamond Ring 💎**\n\nItem ID: **R2**\nPrice: **₲100,000**\nTax: **0%**\nTime of purchase: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Thanks for shopping at DynastySue || Home for the most over-priced rings`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                return interaction.reply({
                                    embeds: [Purchased]
                                })

                            }

                            if (collectionDocs.rings.includes(2)) {

                                const AlreadyInInv = new MessageEmbed()
                                    .setTitle('Transaction failed')
                                    .setColor('#ADD8E6')
                                    .setDescription(`💎 You can only have one of every type of ring 💎`)
                                    .setFooter({
                                        text: `DynastySue Jewelry`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                return interaction.reply({
                                    embeds: [AlreadyInInv]
                                })
                            }

                        } else if (ID === 'R3') {

                            const NoFunds = new MessageEmbed()

                                .setTitle(titles.ERROR)
                                .setColor(colours.ERRORRED)
                                .setDescription(`You don't have sufficient funds to play this, you need **₲50,000**`)
                                .setTimestamp()

                            if (!collectionDocs.rings.includes(3)) {

                                if (Number(accountDocs.walletBal) < 200000) {
                                    if (Number(accountDocs.bankBal) < 200000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    } else {
                                        UserBal = Number(accountDocs.bankBal)

                                        await accountDocs.updateOne({
                                            bankBal: Number(accountDocs.bankBal) - 200000
                                        })
                                    }
                                    if (Number(accountDocs.bankBal) < 200000 && Number(accountDocs.walletBal) < 200000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    }
                                } else {
                                    UserBal = Number(accountDocs.walletBal)

                                    await accountDocs.updateOne({
                                        walletBal: Number(accountDocs.walletBal) - 200000
                                    })
                                }

                                await collectionDocs.rings.push(3);
                                await collectionDocs.save().catch(err => console.log(err));
                                await collectionDocs.updateOne({
                                    ringType: 3
                                })

                                const Purchased = new MessageEmbed()
                                    .setTitle('Transaction complete')
                                    .setColor('#ADD8E6')
                                    .setDescription(`**Successfully purchased 💎 Level 3 Diamond Ring 💎**\n\nItem ID: **R3**\nPrice: **₲200,000**\nTax: **0%**\nTime of purchase: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Thanks for shopping at DynastySue || Home for the most over-priced rings`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                return interaction.reply({
                                    embeds: [Purchased]
                                })

                            }

                            if (collectionDocs.rings.includes(3)) {

                                const AlreadyInInv = new MessageEmbed()
                                    .setTitle('Transaction failed')
                                    .setColor('#ADD8E6')
                                    .setDescription(`💎 You can only have one of every type of ring 💎`)
                                    .setFooter({
                                        text: `DynastySue Jewelry`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                return interaction.reply({
                                    embeds: [AlreadyInInv]
                                })
                            }

                        } else if (ID === 'R4') {

                            const NoFunds = new MessageEmbed()

                                .setTitle(titles.ERROR)
                                .setColor(colours.ERRORRED)
                                .setDescription(`You don't have sufficient funds to play this, you need **₲500,000**`)
                                .setTimestamp()

                            if (!collectionDocs.rings.includes(4)) {

                                if (Number(accountDocs.walletBal) < 500000) {
                                    if (Number(accountDocs.bankBal) < 500000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    } else {
                                        UserBal = Number(accountDocs.bankBal)

                                        await accountDocs.updateOne({
                                            bankBal: Number(accountDocs.bankBal) - 500000
                                        })
                                    }
                                    if (Number(accountDocs.bankBal) < 500000 && Number(accountDocs.walletBal) < 500000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    }
                                } else {
                                    UserBal = Number(accountDocs.walletBal)

                                    await accountDocs.updateOne({
                                        walletBal: Number(accountDocs.walletBal) - 500000
                                    })
                                }

                                await collectionDocs.rings.push(4);
                                await collectionDocs.save().catch(err => console.log(err));
                                await collectionDocs.updateOne({
                                    ringType: 4
                                })

                                const Purchased = new MessageEmbed()
                                    .setTitle('Transaction complete')
                                    .setColor('#ADD8E6')
                                    .setDescription(`**Successfully purchased 💎 Level 4 Diamond Ring 💎**\n\nItem ID: **R4**\nPrice: **₲500,000**\nTax: **0%**\nTime of purchase: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Thanks for shopping at DynastySue || Home for the most over-priced rings`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                return interaction.reply({
                                    embeds: [Purchased]
                                })

                            }

                            if (collectionDocs.rings.includes(4)) {

                                const AlreadyInInv = new MessageEmbed()
                                    .setTitle('Transaction failed')
                                    .setColor('#ADD8E6')
                                    .setDescription(`💎 You can only have one of every type of ring 💎`)
                                    .setFooter({
                                        text: `DynastySue Jewelry`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                return interaction.reply({
                                    embeds: [AlreadyInInv]
                                })
                            }

                        } else if (ID === 'TR1') {

                            const NoFunds = new MessageEmbed()

                                .setTitle(titles.ERROR)
                                .setColor(colours.ERRORRED)
                                .setDescription(`You don't have sufficient funds to play this, you need **₲5,000,000**`)
                                .setTimestamp()

                            if (!collectionDocs.rings.includes(5)) {

                                if (Number(accountDocs.walletBal) < 5000000) {
                                    if (Number(accountDocs.bankBal) < 5000000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    } else {
                                        UserBal = Number(accountDocs.bankBal)

                                        await accountDocs.updateOne({
                                            bankBal: Number(accountDocs.bankBal) - 5000000
                                        })
                                    }
                                    if (Number(accountDocs.bankBal) < 5000000 && Number(accountDocs.walletBal) < 5000000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    }
                                } else {
                                    UserBal = Number(accountDocs.walletBal)

                                    await accountDocs.updateOne({
                                        walletBal: Number(accountDocs.walletBal) - 5000000
                                    })
                                }

                                await collectionDocs.rings.push(5);
                                await collectionDocs.save().catch(err => console.log(err));
                                await collectionDocs.updateOne({
                                    ringType: 5
                                })

                                const Purchased = new MessageEmbed()
                                    .setTitle('Transaction complete')
                                    .setColor('#ADD8E6')
                                    .setDescription(`**Successfully purchased 💎 Musgravite Ring 💎**\n\nItem ID: **TR1**\nPrice: **₲5,000,000**\nTax: **0%**\nTime of purchase: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Thanks for shopping at DynastySue || Home for the most over-priced rings`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                const Wow = new MessageEmbed()
                                    .setTitle("Whats up balla")
                                    .setColor('#ADD8E6')
                                    .setDescription(`**Mavis Winnifred:** "Oh hey! I saw that you purchased one of our high-end rings, I just called to congratulate you on your purchase... not anyone can get a ring like that, keep it safe, it's a very rare gem!"`)

                                await interaction.channel.send({
                                    embeds: [Wow]
                                })

                                return interaction.reply({
                                    embeds: [Purchased]
                                })

                            }

                            if (collectionDocs.rings.includes(5)) {

                                const AlreadyInInv = new MessageEmbed()
                                    .setTitle('Transaction failed')
                                    .setColor('#ADD8E6')
                                    .setDescription(`💎 You can only have one of every type of ring 💎`)
                                    .setFooter({
                                        text: `DynastySue Jewelry`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                return interaction.reply({
                                    embeds: [AlreadyInInv]
                                })
                            }

                        } else if (ID === 'TR2') {

                            const NoFunds = new MessageEmbed()

                                .setTitle(titles.ERROR)
                                .setColor(colours.ERRORRED)
                                .setDescription(`You don't have sufficient funds to play this, you need **₲8,000,000**`)
                                .setTimestamp()

                            if (!collectionDocs.rings.includes(6)) {

                                if (Number(accountDocs.walletBal) < 8000000) {
                                    if (Number(accountDocs.bankBal) < 8000000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    } else {
                                        UserBal = Number(accountDocs.bankBal)

                                        await accountDocs.updateOne({
                                            bankBal: Number(accountDocs.bankBal) - 8000000
                                        })
                                    }
                                    if (Number(accountDocs.bankBal) < 8000000 && Number(accountDocs.walletBal) < 8000000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    }
                                } else {
                                    UserBal = Number(accountDocs.walletBal)

                                    await accountDocs.updateOne({
                                        walletBal: Number(accountDocs.walletBal) - 8000000
                                    })
                                }

                                await collectionDocs.rings.push(6);
                                await collectionDocs.save().catch(err => console.log(err));
                                await collectionDocs.updateOne({
                                    ringType: 6
                                })

                                const Purchased = new MessageEmbed()
                                    .setTitle('Transaction complete')
                                    .setColor('#ADD8E6')
                                    .setDescription(`**Successfully purchased 💎 Painite Ring 💎**\n\nItem ID: **TR2**\nPrice: **₲8,000,000**\nTax: **0%**\nTime of purchase: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Thanks for shopping at DynastySue || Home for the most over-priced rings`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                const Wow = new MessageEmbed()
                                    .setTitle("Whats up balla")
                                    .setColor('#ADD8E6')
                                    .setDescription(`**Mavis Winnifred:** "Oh hey! I saw that you purchased one of our high-end rings, I just called to congratulate you on your purchase... not anyone can get a ring like that, keep it safe, it's a very rare gem!"`)
                                    .setFooter({
                                        text: `Marry someone using this ring to get 2X Money and RP in certain features`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                await interaction.channel.send({
                                    embeds: [Wow]
                                })

                                return interaction.reply({
                                    embeds: [Purchased]
                                })

                            }

                            if (collectionDocs.rings.includes(6)) {

                                const AlreadyInInv = new MessageEmbed()
                                    .setTitle('Transaction failed')
                                    .setColor('#ADD8E6')
                                    .setDescription(`💎 You can only have one of every type of ring 💎`)
                                    .setFooter({
                                        text: `DynastySue Jewelry`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                return interaction.reply({
                                    embeds: [AlreadyInInv]
                                })
                            }

                        } else if (ID === 'TR3') {

                            const NoFunds = new MessageEmbed()

                                .setTitle(titles.ERROR)
                                .setColor(colours.ERRORRED)
                                .setDescription(`You don't have sufficient funds to play this, you need **₲15,000,000**`)
                                .setTimestamp()

                            if (!collectionDocs.rings.includes(7)) {

                                if (Number(accountDocs.walletBal) < 15000000) {
                                    if (Number(accountDocs.bankBal) < 15000000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    } else {
                                        UserBal = Number(accountDocs.bankBal)

                                        await accountDocs.updateOne({
                                            bankBal: Number(accountDocs.bankBal) - 15000000
                                        })
                                    }
                                    if (Number(accountDocs.bankBal) < 15000000 && Number(accountDocs.walletBal) < 15000000) {
                                        return interaction.reply({
                                            embeds: [NoFunds]
                                        })
                                    }
                                } else {
                                    UserBal = Number(accountDocs.walletBal)

                                    await accountDocs.updateOne({
                                        walletBal: Number(accountDocs.walletBal) - 15000000
                                    })
                                }

                                await collectionDocs.rings.push(7);
                                await collectionDocs.save().catch(err => console.log(err));
                                await collectionDocs.updateOne({
                                    ringType: 7
                                })

                                const Purchased = new MessageEmbed()
                                    .setTitle('Transaction complete')
                                    .setColor('#ADD8E6')
                                    .setDescription(`**Successfully purchased 💎 Pink Star Diamond Ring 💎**\n\nItem ID: **TR3**\nPrice: **₲15,000,000**\nTax: **0%**\nTime of purchase: <t:${Math.floor(new Date() / 1000)}:F>`)
                                    .setFooter({
                                        text: `Thanks for shopping at DynastySue || Home for the most over-priced rings`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                const Wow = new MessageEmbed()
                                    .setTitle("Whats up balla")
                                    .setColor('#ADD8E6')
                                    .setDescription(`**Mavis Winnifred:** "Oh hey! I saw that you purchased one of our high-end rings, I just called to congratulate you on your purchase... not anyone can get a ring like that, keep it safe, it's a very rare gem!\nThat one that you purchased is super rare, whoever is getting is going to be super lucky, we will help you with your wedding when they say yes, which they probably will with a ring like that!"`)
                                    .setFooter({
                                        text: `Marry someone using this ring to get 2X Money and RP in certain features`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                await interaction.channel.send({
                                    embeds: [Wow]
                                })

                                return interaction.reply({
                                    embeds: [Purchased]
                                })

                            }

                            if (collectionDocs.rings.includes(7)) {

                                const AlreadyInInv = new MessageEmbed()
                                    .setTitle('Transaction failed')
                                    .setColor('#ADD8E6')
                                    .setDescription(`💎 You can only have one of every type of ring 💎`)
                                    .setFooter({
                                        text: `DynastySue Jewelry`,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })

                                return interaction.reply({
                                    embeds: [AlreadyInInv]
                                })
                            }

                        }
                    }
                },

                test: {
                    description: "test",
                    args: [{
                        name: "channel",
                        description: "testing",
                        type: "CHANNEL",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        if (collectionDocs.rings.includes(1) && collectionDocs.rings.includes(2) && collectionDocs.rings.includes(3) && collectionDocs.rings.includes(4) && collectionDocs.rings.includes(5) && collectionDocs.rings.includes(6) && collectionDocs.rings.includes(7)) {

                            const OwnAll = new MessageEmbed()
                                .setTitle("Woah")
                                .setColor('#ADD8E6')
                                .setDescription(`You already have all of the rings that we sell, come again later we might have some new ones`)
                                .setFooter({
                                    text: `DynastySue Jewels`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })

                            return interaction.reply({
                                embeds: [OwnAll]
                            })
                        }

                        //Docs for the user money, RP, level, Rank
                        let accountDocs = await MoneySchema.findOne({
                            userId: interaction.user.id
                        }).catch(err => console.log(err))
                        //Docs for story progression, type
                        let storyDocs = await StoryProgressSchema.findOne({
                            userId: interaction.user.id
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

                        const ShopMenu = new MessageEmbed()
                            .setTitle("DynastySue Jewels 2")
                            .setColor('#ADD8E6')
                            .setDescription(`Please use /buy <ID> to buy a ring!`)
                            .addFields({
                                name: "Level 1 Diamond Ring 💎 (ID: R1)",
                                value: "**₲50,000**",
                                inline: false
                            }, {
                                name: "Level 2 Diamond Ring 💎 (ID: R2)",
                                value: "**₲100,000**",
                                inline: false
                            }, {
                                name: "Level 3 Diamond Ring 💎 (ID: R3)",
                                value: "**₲200,000**"
                            }, {
                                name: "Level 4 Diamond Ring 💎 (ID: R4)",
                                value: "**₲500,000**"
                            }, {
                                name: "\u200b",
                                value: "**Top Rings**\n"
                            }, {
                                name: "Musgravite Ring 💍 (ID: TR1)",
                                value: "**₲5,000,000**"
                            }, {
                                name: "Painite Ring 💍 (ID: TR2)",
                                value: "**₲8,000,000**"
                            }, {
                                name: "Pink Star Diamond Ring 💍 (ID: TR3)",
                                value: "**₲15,000,000**"
                            })
                            .setFooter({
                                text: `Current location: DynastySue, SueLuz`,
                                iconURL: interaction.user.displayAvatarURL()
                            })

                        return interaction.reply({
                            embeds: [ShopMenu]
                        })
                    }
                },
            }
        })
    }
}
