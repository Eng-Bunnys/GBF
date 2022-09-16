const SlashCommand = require('../../utils/slashCommands');

const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js');

const titles = require('../../gbfembedmessages.json');
const emojis = require('../../GBFEmojis.json');
const colours = require('../../GBFColor.json');
const MoneySchema = require('../../schemas/SueLuz-Account-Info-Schema');
const StoryProgressSchema = require('../../schemas/SueLuz-Story-Progress-Schema');
const CasinoSchema = require('../../schemas/SueLuz-Casino-Stats');
const CollectionSchema = require('../../schemas/SueLuz-Collection-Schema');

const {
    delay,
    NeededRP
} = require("../../utils/engine");

module.exports = class LuckyWheelGame extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "wheel",
            category: "Economy",
            description: "Spin the lucky wheel!",
            usage: "/wheel",
            examples: "/wheel",

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

        //Getting the user info from DB

        let accountDocs = await MoneySchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        let storyDocs = await StoryProgressSchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        let casinoDocs = await CasinoSchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        let collectionDocs = await CollectionSchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))

        //Checking if the user is new or not

        if (!storyDocs || !accountDocs) {
            const IntroRequired = new MessageEmbed()
                .setTitle('Feature unavailable')
                .setDescription(`Please complete the intro mission to unlock this feature\nTo play the intro mission use /intro`)
                .setColor(colours.DEFAULT)

            return interaction.reply({
                embeds: [IntroRequired]
            })
        }

        const WheelNumber = Math.floor(Math.random() * 20) + 1 //The number that the wheel will land on
        let rewardType
        let reward
        if (WheelNumber === 1) {
            rewardType = 'RP'
            reward = 200
        } else if (WheelNumber === 2) {
            rewardType = 'RP'
            reward = 400
        } else if (WheelNumber === 3) {
            rewardType = 'RP'
            reward = 600
        } else if (WheelNumber === 4) {
            rewardType = 'RP'
            reward = 800
        } else if (WheelNumber === 5) {
            rewardType = 'RP'
            reward = 1000
        } else if (WheelNumber === 6) {
            rewardType = 'Cash'
            reward = 500
        } else if (WheelNumber === 7) {
            rewardType = 'Cash'
            reward = 1000
        } else if (WheelNumber === 8) {
            rewardType = 'Cash'
            reward = 2000
        } else if (WheelNumber === 9) {
            rewardType = 'Cash'
            reward = 3000
        } else if (WheelNumber === 10) {
            rewardType = 'Cash'
            reward = 10000
        } else if (WheelNumber === 11) {
            rewardType = 'Rank'
            reward = 2
        } else if (WheelNumber === 12) {
            rewardType = 'Rank'
            reward = 3
        } else if (WheelNumber === 13) {
            rewardType = 'Rank'
            reward = 4
        } else if (WheelNumber === 14) {
            rewardType = 'Cash'
            reward = 30000
        } else if (WheelNumber === 15) {
            rewardType = 'Cash'
            reward = 50000
        } else if (WheelNumber === 16) {
            rewardType = 'Cash'
            reward = 60000
        } else if (WheelNumber === 17) {
            rewardType = 'Cash'
            reward = 70000
        } else if (WheelNumber === 18) {
            rewardType = 'Cash'
            reward = 80000
        } else if (WheelNumber === 19) {
            rewardType = 'Ring'
            reward = 4
        } else if (WheelNumber === 20) {
            rewardType = 'Ring'
            reward = 6
        } else if (WheelNumber > 20 || WheelNumber <= 0) {
            rewardType = 'Ring'
            reward = 6
        }

        console.log(`X: ${WheelNumber}`)
        //Embed for rewards
        const RewardsEmbed = new MessageEmbed()
            .setTitle("Lucky wheel prizes!")
            .setDescription(`There are **20** total prizes\n\n**RP:**\n1-**200**\n2-**400**\n3-**600**\n4-**800**\n5-**1000**\n\n**Cash:**\n6-**₲500**\n7-**₲1000**\n8-**₲2000**\n9-**₲3000**\n10-**₲10,000**\n\n**JackPots:**\n11- **2 Ranks**\n12- **3 Ranks**\n13-**4 Ranks**\n14- **₲30,000**\n15- **₲50,000**\n16- **₲60,000**\n17- **₲70,000**\n18- **80,000**\n\n**Super Jackpots:**\n19- 💎 **Level Four Diamond Ring** 💎 (Worth: ₲500,000)\n20- 💎 **Painite  Ring** 💎 (Worth: ₲8,000,000)`)
            .setColor(colours.LIGHTBLUE)
            .setFooter({
                text: `Current location: Nova Casino and resort || Spin the lucky wheel!`,
                iconURL: interaction.user.displayAvatarURL()
            })
        //Embed for daily unavailable
        const NotAvailable = new MessageEmbed()
            .setTitle("You can't use that yet")
            .setColor(colours.DEFAULT)
            .setDescription(`You've already used your daily spin!\nCome back **<t:${Math.floor(casinoDocs.WheelTimer / 1000 + 86400)}:R>**`)
            .setFooter({
                text: `Nova Casino and Resort || Lucky Wheel`,
                iconURL: interaction.user.displayAvatarURL()
            })

        //86400000
        if ((Date.parse(casinoDocs.WheelTimer) + 86400000) > Date.now()) {

            return interaction.reply({
                embeds: [NotAvailable]
            })

        } else {

            const SpinB = new MessageButton()
                .setCustomId(`spin`)
                .setLabel("Spin")
                .setStyle("PRIMARY")
            const SpinR = new MessageActionRow().addComponents([SpinB])

            await interaction.reply({
                embeds: [RewardsEmbed],
                components: [SpinR]
            })

            const filter = i => {
                return i.user.id === interaction.user.id;
            };

            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                idle: 5000, //30000
                time: 300000
            });

            setTimeout(() => {
                return interaction.editReply({
                    components: []
                })
            }, 299400);

            collector.on('collect', async i => {
                await i.deferUpdate();
                await delay(750);

                const DisplayReward = Number(reward).toLocaleString()

                if (i.customId === 'spin') {

                    if (rewardType === 'RP') {

                        let RPForNextLVL = NeededRP(accountDocs.Rank)

                        const UserRP = Number(accountDocs.RP) + reward
                        const NewRank = Number(accountDocs.Rank + 1).toLocaleString()
                        const NextRank = Number(accountDocs.Rank + 2).toLocaleString()
                        const RPneededForNextRank = Number(NeededRP(Number(accountDocs.Rank) + 2)).toLocaleString()
                        const RankedUp = new MessageEmbed()
                            .setTitle("Ranked up")
                            .setDescription(`Rank: **${NewRank}**\nRP required for level ${NextRank}: **${RPneededForNextRank}**`)
                            .setColor(colours.DEFAULT)

                        //User account
                        await accountDocs.updateOne({
                            RP: accountDocs.RP + reward, //Adding RP to the schema
                        })
                        //Casino account
                        await casinoDocs.updateOne({
                            WheelTimer: new Date(Date.now()) //Updating the date 
                        })
                        RewardsEmbed.setTitle(`Congrats ${interaction.user.username}`)
                        RewardsEmbed.setDescription(`**🏆 Prize won: 🏆**\n**${DisplayReward} RP**\nYou can spin it again in **24 hours**`)

                        if (UserRP >= RPForNextLVL) {
                            await accountDocs.updateOne({
                                RP: 0,
                                Rank: Number(accountDocs.Rank) + 1
                            })
                            await interaction.channel.send({
                                embeds: [RankedUp]
                            })
                        }

                        return await i.editReply({
                            embeds: [RewardsEmbed],
                            components: []
                        })

                    } else if (rewardType === 'Ring') {

                        let DiamondLevel4
                        let PainiteRing

                        if (collectionDocs.rings.includes(4)) {
                            DiamondLevel4 = false
                        } else {
                            DiamondLevel4 = true
                        }

                        if (collectionDocs.rings.includes(6)) {
                            PainiteRing = false
                        } else {
                            PainiteRing = true
                        }

                        if (reward === 4) {

                            if (DiamondLevel4 === true) {
                                RewardsEmbed.setTitle(`Congrats ${interaction.user.username}`)
                                RewardsEmbed.setDescription(`**🎉 We have a lucky winner 🎉**\n**Prize won:**\n**Level Four Diamond Ring || Worth: ₲500,000**`)

                                await collectionDocs.rings.push(4);
                                await collectionDocs.save().catch(err => console.log(err));

                                await casinoDocs.updateOne({
                                    WheelTimer: new Date(Date.now()) //Updating the date 
                                })

                                return await i.editReply({
                                    embeds: [RewardsEmbed],
                                    components: []
                                })
                            } else {
                                RewardsEmbed.setTitle(`Congrats ${interaction.user.username}`)
                                RewardsEmbed.setDescription(`**🎉 We have a lucky winner 🎉**\n**⚠ Looks like you already have that item, we've given you cash as an alternative ⚠**\n**Prize won:**\n**Level Four Diamond Ring || Cash received: ₲250,000**`)

                                await accountDocs.updateOne({
                                    walletBal: Number(accountDocs.walletBal) + 250000, //Adding cash to the schema
                                })

                                await casinoDocs.updateOne({
                                    WheelTimer: new Date(Date.now()) //Updating the date 
                                })

                                return await i.editReply({
                                    embeds: [RewardsEmbed],
                                    components: []
                                })
                            }
                        } else if (reward === 6) {

                            if (PainiteRing === true) {
                                RewardsEmbed.setTitle(`Congrats ${interaction.user.username}`)
                                RewardsEmbed.setDescription(`**🎉 We have a lucky winner 🎉**\n**Prize won:**\n**Painite Ring || Worth: ₲8,000,000**`)

                                await collectionDocs.rings.push(6);
                                await collectionDocs.save().catch(err => console.log(err));

                                await casinoDocs.updateOne({
                                    WheelTimer: new Date(Date.now()) //Updating the date 
                                })

                                return i.update({
                                    embeds: [RewardsEmbed],
                                    components: []
                                })
                            } else {
                                RewardsEmbed.setTitle(`Congrats ${interaction.user.username}`)
                                RewardsEmbed.setDescription(`**🎉 We have a lucky winner 🎉**\n**⚠ Looks like you already have that item, we've given you cash as an alternative ⚠**\n**Prize won:**\n\n**Painite Ring || Cash received: ₲2,000,000**`)

                                await casinoDocs.updateOne({
                                    WheelTimer: new Date(Date.now()) //Updating the date 
                                })

                                await accountDocs.updateOne({
                                    walletBal: Number(accountDocs.walletBal) + 2000000, //Adding cash to the schema
                                })

                                return await i.editReply({
                                    embeds: [RewardsEmbed],
                                    components: []
                                })
                            }
                        }
                    } else if (rewardType === 'Cash') {

                        //User account
                        await accountDocs.updateOne({
                            bankBal: accountDocs.bankBal + reward, //Adding RP to the schema
                        })
                        //Casino account
                        await casinoDocs.updateOne({
                            WheelTimer: new Date(Date.now()) //Updating the date 
                        })
                        RewardsEmbed.setTitle(`Congrats ${interaction.user.username}`)
                        RewardsEmbed.setDescription(`**🏆 Prize won: 🏆**\n**₲${DisplayReward}**\nCome back in **<t:${Math.floor(casinoDocs.WheelTimer / 1000 + 86400)}:R>**`)

                        return await i.editReply({
                            embeds: [RewardsEmbed],
                            components: []
                        })

                    } else if (rewardType === 'Rank') {

                        //User account
                        await accountDocs.updateOne({
                            RP: 0,
                            Rank: accountDocs.Rank + reward, //Adding Ranks to the schema
                        })
                        //Casino account
                        await casinoDocs.updateOne({
                            WheelTimer: new Date(Date.now()) //Updating the date 
                        })
                        RewardsEmbed.setTitle(`Congrats ${interaction.user.username}`)
                        RewardsEmbed.setDescription(`**🏆 Prize won: 🏆**\n**+${DisplayReward} Ranks**\nCome back in **<t:${Math.floor(casinoDocs.WheelTimer / 1000 + 86400)}:R>**`)

                        const NewRank = Number(accountDocs.Rank + reward).toLocaleString()
                        const NextRank = Number(accountDocs.Rank + reward + 1).toLocaleString()
                        const RPneededForNextRank = Number(NeededRP(Number(accountDocs.Rank) + reward + 1)).toLocaleString()

                        const NewRankS = new MessageEmbed()
                            .setTitle("New Rank")
                            .setDescription(`Rank: **${NewRank}**\nRP required for level ${NextRank}: **${RPneededForNextRank}**`)
                            .setColor(colours.DEFAULT)

                        await i.channel.send({
                            embeds: [NewRankS]
                        })

                        return i.editReply({
                            embeds: [RewardsEmbed],
                            components: []
                        })

                    }
                }
            }) //End of collector
        }
    }
}