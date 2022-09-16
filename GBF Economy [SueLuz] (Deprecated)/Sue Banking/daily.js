const SlashCommand = require('../../utils/slashCommands');

const {
    MessageEmbed
} = require('discord.js')

const titles = require('../../gbfembedmessages.json')
const emojis = require('../../GBFEmojis.json')
const colours = require('../../GBFColor.json');
const MoneySchema = require('../../schemas/SueLuz-Account-Info-Schema');
const StoryProgressSchema = require('../../schemas/SueLuz-Story-Progress-Schema');
const CollectionSchema = require('../../schemas/SueLuz-Collection-Schema');

const {
    delay,
    NeededRP
} = require("../../utils/engine");

module.exports = class DailySlash extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "daily",
            category: "Economy",
            description: "Collect your daily rewards! (Caps at 10k and 2k RP)",
            usage: "/daily",
            examples: "/daily",

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
        //Getting user settings
        let userDocs = await MoneySchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        let storyProgress = await StoryProgressSchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        let collectionStats = await CollectionSchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        //If the user has not completed the intro
        if (!storyProgress) {

            const IntroRequired = new MessageEmbed()
                .setTitle('Feature unavailable')
                .setDescription(`You have to complete the intro mission to unlock this feature\nTo play the intro mission use /intro`)
                .setColor(colours.DEFAULT)

            return interaction.reply({
                embeds: [IntroRequired]
            })
        }
        //Checking if the user is married with a top tier ring
        let RingMulti
        if (userDocs.Married === 'Yes' && Number(userDocs.MarriedRing) >= 6) {
            RingMulti = 2 //Double the reward for married with high end rings
        } else {
            RingMulti = 1
        }

        //System to give money and RP

        //RP calculator one

        let RPForNextLVL = NeededRP(userDocs.Rank)

        const StreakDays = Number(userDocs.StreakCounter) //Gets the streak from the DB (Def. 1)

        let GivenMoney
        let GivenRP
        let GivenRank //For 100 days
        //What we use to calculate the money and RP given depending on the streak days
        const MoneyMulti = Math.round(Number(StreakDays * 500))
        const RPMulti = Math.round(Number(StreakDays * 200))

        //For under 99 days (100 streak reward)

        if (StreakDays < 99 || StreakDays >= 100) {
            //Making sure the user can't get more than 10k a day
            if (MoneyMulti >= 10000) {
                GivenMoney = 10000 * RingMulti
            } else {
                GivenMoney = MoneyMulti * RingMulti
            }
            //Making sure the user can't get more than 2k RP a day
            if (RPMulti >= 2000) {
                GivenRP = 2000 * RingMulti
            } else {
                GivenRP = RPMulti * RingMulti
            }
        } else {
            //For 100 days
            GivenRP = RPForNextLVL
            GivenMoney = 500000 * RingMulti
        }

        //RP calculator two

        const UserRP = Number(Number(userDocs.RP) + GivenRP)

        //For high end ring users

        let text

        if (RingMulti === 2) {
            text = `Looks like you have a high end ring, you have been awarded double money and RP`
            GivenRank = 10
        } else {
            text = `If you marry someone with a Painite Ring or higher you get double money and RP!`
            GivenRank = 5
        }

        //Embed for daily not available

        //For commas
        const DisplayMoney = Number(GivenMoney).toLocaleString()
        const DisplayRP = Number(GivenRP).toLocaleString()
        const DisplayStreak = Number(StreakDays).toLocaleString()
        //Embed for daily unavailable 
        const NotAvailable = new MessageEmbed()
            .setTitle("You can't use that yet")
            .setColor(colours.DEFAULT)
            .setDescription(`You have already collected your daily reward!\n\nYou can collect it again **<t:${Math.floor(userDocs.DailyStreak / 1000 + 86400)}:R>**\n\nCurrent streak: **${DisplayStreak} day(s) 🔥**`)
            .setFooter({
                text: `Thank you for choosing GBF Banking || Continue to be an active member and we will reward you with better rewards!`,
                iconURL: interaction.user.displayAvatarURL()
            })
        //Embed for daily available
        const Available = new MessageEmbed()
            .setTitle("Collected 💰")
            .setColor(colours.DEFAULT)
            .setDescription(`**Collected your daily reward!**\n\n**₲${DisplayMoney}** ${emojis.VERIFY}\n**+${DisplayRP} RP** ${emojis.VERIFY}\n\nDaily Streak: **${Number(StreakDays + 1).toLocaleString()} day(s) 🔥**\n\n${text}`)
            .setFooter({
                text: `Keep the streak up for better rewards! || The streak dies after 48 hours of not claiming your reward`,
                iconURL: interaction.user.displayAvatarURL()
            })
        //Embed for 100 day streak
        const Hundred = new MessageEmbed()
            .setTitle(`100 Days 💯🔥`)
            .setColor(colours.DEFAULT)
            .setDescription(`Woah what a milestone!\nI've given you **+${GivenRank} Ranks** and **₲${DisplayMoney}** for you efforts!\n\n${text}`)
        //Embed for lost streak
        const LostStreak = new MessageEmbed()
            .setTitle("Collected 💰")
            .setColor(colours.DEFAULT)
            .setDescription(`Looks like you failed to keep up the streak 🙊\nYour last streak was: **${DisplayStreak} day(s)**\n**₲500** ${emojis.VERIFY}\n**+200 RP** ${emojis.VERIFY}\n\nDaily Streak: **1 day(s) 🔥**\n\n${text}, **Warning: This does not count for day number one**`)
            .setFooter({
                text: `If you think there is a mistake please contact support (/invite) || The streak dies after 48 hours of not claiming your reward`,
                iconURL: interaction.user.displayAvatarURL()
            })
        //Ranked up embed and system
        const NewRank = Number(userDocs.Rank + 1).toLocaleString()
        const NextRank = Number(userDocs.Rank + 2).toLocaleString()
        const RPneededForNextRank = Number(NeededRP(Number(userDocs.Rank) + 2)).toLocaleString()
        const RankedUp = new MessageEmbed()
            .setTitle("Ranked up")
            .setDescription(`Rank: **${NewRank}**\nRP required for level ${NextRank}: **${RPneededForNextRank}**`)
            .setColor(colours.DEFAULT)

        //Checking if the user can claim the daily reward
        //If the user timer is 24 hours before todays timer
        if ((Date.parse(userDocs.DailyStreak) + 86400000) > Date.now()) {

            return interaction.reply({
                embeds: [NotAvailable]
            })

        } else {

            //Checking the user streak cooldown
            //Checking if it has been 48 hours
            //If the user timer is 48 hours before todays timer 172800000 ms
            if ((Date.parse(userDocs.DailyStreak) + 172800000) > Date.now()) {
                if (StreakDays < 99 || StreakDays >= 100) {
                    //Checking if the user's streak
                    await interaction.reply({
                        embeds: [Available]
                    })

                    await userDocs.updateOne({
                        RP: userDocs.RP + GivenRP, //Adding RP to the schema
                        bankBal: userDocs.bankBal + GivenMoney, //Adding money to the bank schema
                        StreakCounter: userDocs.StreakCounter + 1, //Adding 1 to the streak 
                        DailyStreak: new Date(Date.now()) //Updating the date for the streaks
                    })
                    //Checking if the user has enough RP to level
                    if (UserRP >= RPForNextLVL) {
                        await userDocs.updateOne({
                            RP: 0,
                            Rank: Number(userDocs.Rank) + 1
                        })
                        return interaction.channel.send({
                            embeds: [RankedUp]
                        })
                    }
                    return
                } else {
                    //If the user has achieved 100 days
                    await interaction.reply({
                        embeds: [Hundred]
                    })

                    await userDocs.updateOne({
                        Rank: userDocs.Rank + GivenRank, //Adding 5/10 ranks,
                        RP: 0, //Reseting RP
                        bankBal: userDocs.bankBal + GivenMoney, //Adding money to the bank schema
                        StreakCounter: userDocs.StreakCounter + 1, //Adding 1 to the streak 
                        DailyStreak: new Date(Date.now()) //Updating the date for the streaks
                    })

                    return
                }
            } else {
                //If 48 hours have passed
                await interaction.reply({
                    embeds: [LostStreak]
                })

                await userDocs.updateOne({
                    RP: userDocs.RP + 200, //Adding RP to the schema
                    bankBal: userDocs.bankBal + 500, //Adding money to the bank schema
                    StreakCounter: 1, //Reseting the streak 
                    DailyStreak: new Date(Date.now()) //Updating the date for the streaks
                })
                //Checking if the user has enough RP to level
                if (UserRP >= RPForNextLVL) {
                    await userDocs.updateOne({
                        RP: 0,
                        Rank: Number(userDocs.Rank) + 1
                    })
                    return interaction.channel.send({
                        embeds: [RankedUp]
                    })
                }
                return
            }
        }

    }
}