const SlashCommand = require('../../utils/slashCommands');

const {
    MessageEmbed,
    MessageButton,
    MessageActionRow
} = require('discord.js')

const titles = require('../../gbfembedmessages.json')
const emojis = require('../../GBFEmojis.json')
const colours = require('../../GBFColor.json');
const MoneySchema = require('../../schemas/SueLuz-Account-Info-Schema');
const StoryProgressSchema = require('../../schemas/SueLuz-Story-Progress-Schema');
const CasinoSchema = require('../../schemas/SueLuz-Casino-Stats');
const CollectionSchema = require('../../schemas/SueLuz-Collection-Schema');

const {
    delay,
    NeededRP
} = require("../../utils/engine");

module.exports = class ProfileSlash extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "profile",
            category: "Economy",
            description: "Show's a user's profile",
            usage: "/profile <user>",
            examples: "/profile <user>",

            options: [{
                name: "user",
                description: "The user to get their profile",
                type: 'USER',
                required: false
            }],

            devOnly: false,
            userPermission: [],
            botPermission: [],
            cooldown: 0,
            development: '✅',
            Partner: false,
        });
    }


    async execute({
        client,
        interaction
    }) {
        //Getting the user
        const user = interaction.options.getUser("user") || interaction.user
        //If the user mentioned is a bot
        if (user.bot) {
            const userBot = new MessageEmbed()
                .setTitle(titles.ERROR)
                .setColor(colours.ERRORRED)
                .setDescription(`Captha failed ❌\nUnable to verify that the user is human`)

            return interaction.reply({
                embeds: [userBot]
            })
        }
        //Importing the schemas
        let userDocs = await MoneySchema.findOne({
            userId: user.id
        }).catch(err => console.log(err))

        let storyProgress = await StoryProgressSchema.findOne({
            userId: user.id
        }).catch(err => console.log(err))

        let collectionStats = await CollectionSchema.findOne({
            userId: user.id
        }).catch(err => console.log(err))

        let casinoDocs = await CasinoSchema.findOne({
            userId: user.id
        }).catch(err => console.log(err))
        //If the user has not completed the intro
        if (!storyProgress) {

            const IntroRequired = new MessageEmbed()
                .setTitle('Feature unavailable')
                .setDescription(`${user.username} hasn't completed the intro mission to unlock this feature\nTo play the intro mission use /intro`)
                .setColor(colours.DEFAULT)

            return interaction.reply({
                embeds: [IntroRequired]
            })
        }
        //If the user has their settings to private
        if (userDocs.PrivateAccount === 'Yes' && interaction.user.id !== user.id) {

            const PrivateAccount = new MessageEmbed()
                .setTitle('Private Account')
                .setColor(colours.ERRORRED)
                .setDescription(`${user.username} has their account privacy set to \`PRIVATE\`, only they can see their stats`)

            return interaction.reply({
                embeds: [PrivateAccount]
            })

        }
        //To hide the message if the user is the owner of the account and has it to private
        let settingsBool

        if (userDocs.PrivateAccount === 'Yes' && interaction.user.id === user.id) {
            settingsBool = true
        } else {
            settingsBool = false
        }

        const RankedUp = new MessageEmbed()
            .setTitle("Ranked up")
            .setDescription(`Rank: **${Number(userDocs.Rank) + 1}**\nRP required for level ${Number(userDocs.Rank) + 2}: **${NeededRP(userDocs.Rank + 2)}**`)
            .setColor(colours.DEFAULT)
            .setFooter({
                text: `To compensate for the late level up we've given you 20RP`,
                iconURL: interaction.user.displayAvatarURL()
            })

        //Money stuff
        const WalletMoney = Number(userDocs.walletBal).toLocaleString()
        const BankMoney = Number(userDocs.bankBal).toLocaleString()
        const NetWorthMoney = Number(userDocs.netWorth).toLocaleString()

        //RP stuff
        const UserRPDisplay = Number(userDocs.RP).toLocaleString()
        const UserRank = Number(userDocs.Rank).toLocaleString()

        const NextRank = Number(userDocs.Rank + 1).toLocaleString()
        const RPneededForNextRank = Number(NeededRP(Number(userDocs.Rank) + 1)).toLocaleString()

        let RPForNextLVL = NeededRP(userDocs.Rank)

        const UserRP = Number(userDocs.RP)

        //Ring stuff

        let num = 0
        let invNetWorth = 0
        if (collectionStats.rings.includes(1)) {
            num++
            invNetWorth = invNetWorth + 50000
        }
        if (collectionStats.rings.includes(2)) {
            num++
            invNetWorth = invNetWorth + 100000
        }
        if (collectionStats.rings.includes(3)) {
            num++
            invNetWorth = invNetWorth + 200000
        }
        if (collectionStats.rings.includes(4)) {
            num++
            invNetWorth = invNetWorth + 500000
        }
        if (collectionStats.rings.includes(5)) {
            num++
            invNetWorth = invNetWorth + 5000000
        }
        if (collectionStats.rings.includes(6)) {
            num++
            invNetWorth = invNetWorth + 8000000
        }
        if (collectionStats.rings.includes(7)) {
            num++
            invNetWorth = invNetWorth + 15000000
        }
        //Calculating the value of the rings and the % of rings owned
        const PercentageRings = Number((num / 7) * 100)
        const FinalRings = `${(Math.round(PercentageRings)).toString()}%`
        //Total net worth and inv net worth 
        const FinalInvWorth = Number(invNetWorth).toLocaleString()

        const FinalNetWorth = Number(userDocs.netWorth) + Number(invNetWorth)

        //Casino info

        const CasinoWins = Number(casinoDocs.gameWins).toLocaleString()
        const CasinoLosses = Number(casinoDocs.gameLosses).toLocaleString()
        const CasinoCashWon = Number(casinoDocs.totalWon).toLocaleString()
        const CasinoCashLost = Number(casinoDocs.totalLost).toLocaleString()
        const CasinoCashBet = Number(casinoDocs.totalBet).toLocaleString()
        //To get winrate
        const Wins = Number(casinoDocs.gameWins)
        const SigmaGames = Number(casinoDocs.gameWins + casinoDocs.gameLosses)
        let Summination

        if (SigmaGames > 0) {
            Summination = SigmaGames
        } else {
            Summination = 1
        }

        const WinRate = Math.round((Wins / Summination) * 100)
        //To calculate profits/loss, math.abs can be used but too lazy to change
        let delta = Number(casinoDocs.totalBet - casinoDocs.totalWon)
        const WinsOutOfTotal = Number(casinoDocs.gameWins - casinoDocs.gameLosses)
        let DifferenceGames
        let WonOrLost

        if (delta < 0) {
            DifferenceGames = (delta * -1)
            WonOrLost = `Lost: ₲${DifferenceGames.toLocaleString()}`
        } else if (delta > 0) {
            DifferenceGames = delta
            WonOrLost = `Won: ₲${DifferenceGames.toLocaleString()}`
        } else if (delta === 0) {
            DifferenceGames = delta
            WonOrLost = `No Profit/Loss: ₲${DifferenceGames.toLocaleString()}`
        }

        //Updating the docs
        await casinoDocs.updateOne({
            Difference: WinsOutOfTotal
        })
        //Checking who the user is married to
        const MarriedTo = userDocs.MarriedTo

        //Streaks

        const Streaks = Number(userDocs.StreakCounter).toLocaleString()
        let StreakDays
        if ((Date.parse(userDocs.DailyStreak) + 172800000) > Date.now()) {
            StreakDays = Streaks
        } else {
            StreakDays = 1
        }

        //Updating user info

        await userDocs.updateOne({
            netWorth: Number(userDocs.walletBal + userDocs.bankBal) //Updating the net worth
        })
        //Rank up event
        if (UserRP >= RPForNextLVL) {

            await userDocs.updateOne({
                RP: 20,
                Rank: Number(userDocs.Rank) + 1
            })

            await interaction.followUp({
                embeds: [RankedUp],
                ephemeral: settingsBool
            })
        }

        const ProfileEmbed = new MessageEmbed()
            .setTitle(`${user.username}'s profile`)
            .setColor(colours.DEFAULT)
            .setThumbnail(user.displayAvatarURL({
                dynamic: true
            }))
            .addFields({
                name: `**💰 Cash:**`,
                value: `**Wallet:** \`₲${WalletMoney}\`\n**Bank:** \`₲${BankMoney}\`\n**Combined:** \`₲${NetWorthMoney}\`\n**Total Net Worth:** \`₲${FinalNetWorth.toLocaleString()}\``,
                inline: true
            }, {
                name: `**💍 Ring Stats:**`,
                value: `**Percentage of owned rings:** \`${FinalRings}\`\n**Price of owned rings:** \`₲${FinalInvWorth}\`\n**Married To:** \`${MarriedTo}\``,
                inline: true
            }, {
                name: `**🎰 Casino Stats:**`,
                value: `**Game Wins:** \`${CasinoWins}\`\n**Game Losses:** \`${CasinoLosses}\`\n**Cash Won:** \`₲${CasinoCashWon}\`\n**Cash Lost:** \`₲${CasinoCashLost}\`\n**Total Cash Bet:** \`₲${CasinoCashBet}\`\n**Win Rate:** \`${WinRate}%\``,
                inline: true
            }, {
                name: `**🥇 Rank:**`,
                value: `\`${UserRank}\``,
                inline: true
            }, {
                name: `**📩 RP:**`,
                value: `\`${UserRPDisplay}/${RPneededForNextRank}\``,
                inline: true
            }, {
                name: `**🔥 Daily Streak Counter:**`,
                value: `\`${StreakDays} day(s)\``,
                inline: true
            })
            .setFooter({
                text: `${user.username}'s profile || Use the buttons for more advanced stats`,
                iconURL: user.displayAvatarURL()
            })

        const GamblingStats = new MessageButton()
            .setCustomId('gambling')
            .setLabel('Gambling Stats')
            .setEmoji("🎰")
            .setStyle('SECONDARY')
        const StreakTimers = new MessageButton()
            .setCustomId('streak')
            .setLabel('Daily Timers')
            .setEmoji("🕐")
            .setStyle('SECONDARY')
        const MarriageStats = new MessageButton()
            .setCustomId('marriage')
            .setLabel('Marriage Stats')
            .setEmoji("💍")
            .setStyle('SECONDARY')
        const MarriageStatsD = new MessageButton()
            .setCustomId('marriageD')
            .setLabel('Marriage Stats')
            .setDisabled(true)
            .setEmoji("💍")
            .setStyle('SECONDARY')
        const StoryStats = new MessageButton()
            .setCustomId('story')
            .setLabel('Story Stats')
            .setEmoji("🔫")
            .setStyle('SECONDARY')
        const ExpandedStats = new MessageActionRow().setComponents([GamblingStats, MarriageStats, StoryStats, StreakTimers])
        const ExpandedStatsD = new MessageActionRow().setComponents([GamblingStats, MarriageStatsD, StoryStats, StreakTimers])
        //If the user has marriage to private
        if (userDocs.MarriagePrivate === 'Yes' && interaction.user.id !== user.id) {

            const ProfileEmbed = new MessageEmbed()
                .setTitle(`${user.username}'s profile || Marriage Stats are hidden`)
                .setColor(colours.DEFAULT)
                .setThumbnail(user.displayAvatarURL({
                    dynamic: true
                }))
                .addFields({
                    name: `**💰 Cash:**`,
                    value: `**Wallet:** \`₲${WalletMoney}\`\n**Bank:** \`₲${BankMoney}\`\n**Combined:** \`₲${NetWorthMoney}\`\n**Total Net Worth:** \`₲${FinalNetWorth.toLocaleString()}\``,
                    inline: true
                }, {
                    name: `**💍 Ring Stats:**`,
                    value: `**Percentage of owned rings:** \`${FinalRings}\`\n**Price of owned rings:** \`₲${FinalInvWorth}\``,
                    inline: true
                }, {
                    name: `**🎰 Casino Stats:**`,
                    value: `**Game Wins:** \`${CasinoWins}\`\n**Game Losses:** \`${CasinoLosses}\`\n**Cash Won:** \`₲${CasinoCashWon}\`\n**Cash Lost:** \`₲${CasinoCashLost}\`\n**Total Cash Bet:** \`₲${CasinoCashBet}\`\n**Win Rate:** \`${WinRate}%\``,
                    inline: true
                }, {
                    name: `**🥇 Rank:**`,
                    value: `\`${UserRank}\``,
                    inline: true
                }, {
                    name: `**📩 RP:**`,
                    value: `\`${UserRPDisplay}/${RPneededForNextRank}\``,
                    inline: true
                }, {
                    name: `**🔥 Daily Streak Counter:**`,
                    value: `\`${StreakDays} day(s)\``,
                    inline: true
                })
                .setFooter({
                    text: `${user.username}'s profile || Use the buttons for more advanced stats`,
                    iconURL: user.displayAvatarURL()
                })

            await interaction.reply({
                embeds: [ProfileEmbed],
                components: [ExpandedStatsD],
                ephemeral: settingsBool
            })
        } else {

            await interaction.reply({
                embeds: [ProfileEmbed],
                components: [ExpandedStats],
                ephemeral: settingsBool
            })
        }
        const GoBackB = new MessageButton()
            .setCustomId('back')
            .setLabel('Go back to general profile')
            .setStyle('DANGER')
            .setEmoji(emojis.ERROR)
        const GoBackR = new MessageActionRow().addComponents([GoBackB])

        const filter = i => {
            return i.user.id === interaction.user.id;
        };

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            idle: 30000,
            time: 300000
        });

        collector.on('collect', async i => {
            await i.deferUpdate();
            await delay(750);

            if (i.customId === 'back') {
                await interaction.editReply({
                    embeds: [ProfileEmbed],
                    components: [ExpandedStats],
                    ephemeral: settingsBool
                })
            } else if (i.customId === 'gambling') {

                let DisplayWheelTimerOne
                const TimeUntilNextSpinOne = Math.floor(casinoDocs.WheelTimer / 1000 + 86400)
                if ((Date.parse(casinoDocs.WheelTimer) + 86400000) > Date.now()) {
                    DisplayWheelTimerOne = `<t:${TimeUntilNextSpinOne}:R>`
                } else {
                    DisplayWheelTimerOne = `Spin Available`
                }

                const GamblingStatsEmbed = new MessageEmbed()
                    .setTitle(`${user.username}'s gambling stats`)
                    .setColor(colours.DEFAULT)
                    .setThumbnail(user.displayAvatarURL({
                        dynamic: true
                    }))
                    .addFields({
                        name: "Games Played:",
                        value: `\`${SigmaGames}\``
                    }, {
                        name: "Games Won:",
                        value: `\`${CasinoWins}\``,
                        inline: true
                    }, {
                        name: "Games Lost:",
                        value: `\`${CasinoLosses}\``,
                        inline: true
                    }, {
                        name: "Win Rate:",
                        value: `\`${WinRate}%\``,
                        inline: true
                    }, {
                        name: "Cash Won:",
                        value: `\`₲${CasinoCashWon}\``,
                        inline: true
                    }, {
                        name: "Cash Lost:",
                        value: `\`₲${CasinoCashLost}\``,
                        inline: true
                    }, {
                        name: '\u200b',
                        value: '\u200b',
                        inline: true
                    }, {
                        name: "Total Bet:",
                        value: `\`${CasinoCashBet}\``,
                        inline: true
                    }, {
                        name: '\u200b',
                        value: '\u200b',
                        inline: true
                    }, {
                        name: "Cash Won/Lost:",
                        value: `\`${WonOrLost}\``,
                        inline: true
                    }, {
                        name: "Lucky Wheel Cooldown:",
                        value: `**${DisplayWheelTimerOne}**`
                    })
                    .setFooter({
                        text: `${user.username}'s profile || Use the buttons to go back to the main profile`,
                        iconURL: user.displayAvatarURL()
                    })

                await interaction.editReply({
                    embeds: [GamblingStatsEmbed],
                    components: [GoBackR],
                    ephemeral: settingsBool
                })

            } else if (i.customId === 'streak') {

                const StreakDays = Number(userDocs.StreakCounter).toLocaleString()

                const TimeUntilNextDailyCollect = Math.floor(userDocs.DailyStreak / 1000 + 86400)

                let DisplayDailyTimer

                if ((Date.parse(userDocs.DailyStreak) + 86400000) > Date.now()) {
                    DisplayDailyTimer = `<t:${TimeUntilNextDailyCollect}:R>`
                } else {
                    DisplayDailyTimer = `Daily Available`
                }

                const TimeUntilNextSpin = Math.floor(casinoDocs.WheelTimer / 1000 + 86400)

                let DisplayWheelTimer

                if ((Date.parse(casinoDocs.WheelTimer) + 86400000) > Date.now()) {
                    DisplayWheelTimer = `<t:${TimeUntilNextSpin}:R>`
                } else {
                    DisplayWheelTimer = `Spin Available`
                }

                let MarriedBool

                if (userDocs.Married === 'Yes') {
                    MarriedBool = 'True'
                } else {
                    MarriedBool = 'False'
                }

                const StreakAdvanced = new MessageEmbed()
                    .setTitle(`${user.username}'s streak stats`)
                    .setColor(colours.DEFAULT)
                    .addFields({
                        name: "🕑 Time Until Next Daily:",
                        value: `**${DisplayDailyTimer}**`,
                        inline: true
                    }, {
                        name: "🕑 Time Until Next Lucky Wheel Spin",
                        value: `**${DisplayWheelTimer}**`,
                        inline: true
                    }, {
                        name: "\u200b",
                        value: '\u200b',
                        inline: true
                    }, {
                        name: "Daily Streak:",
                        value: `\`${StreakDays} days 🔥\``,
                        inline: true
                    }, {
                        name: "Double Money and RP on daily:",
                        value: `\`${MarriedBool}\``,
                        inline: true
                    }, {
                        name: "\u200b",
                        value: '\u200b',
                        inline: true
                    })
                    .setThumbnail(user.displayAvatarURL({
                        dynamic: true
                    }))
                    .setFooter({
                        text: `${user.username}'s profile || Use the buttons to go back to the main profile`,
                        iconURL: user.displayAvatarURL()
                    })

                await interaction.editReply({
                    embeds: [StreakAdvanced],
                    components: [GoBackR],
                    ephemeral: settingsBool
                })

            } else if (i.customId === 'marriage') {

                const UserMarried = userDocs.Married
                const MarriedtoWho = userDocs.MarriedTo
                let MarriedAtTimer
                if (userDocs.MarriedAt !== undefined) {
                    MarriedAtTimer = `**<t:${MarriedtoWho}:f>, <t:${MarriedtoWho}:R>**`
                } else {
                    MarriedAtTimer = `\`User is not married\``
                }

                const AdvancedMarriageStats = new MessageEmbed()
                    .setTitle(`${user.username}'s marriage stats`)
                    .setColor(colours.DEFAULT)
                    .addFields({
                        name: "\u200b",
                        value: '\u200b',
                        inline: true
                    }, {
                        name: "Married:",
                        value: `\`${UserMarried}\``,
                        inline: true
                    }, {
                        name: "\u200b",
                        value: '\u200b',
                        inline: true
                    }, {
                        name: "Married to:",
                        value: `\`${MarriedtoWho}\``,
                        inline: true
                    }, {
                        name: "Married At",
                        value: `${MarriedAtTimer}`
                    })

            }
        })
    }
}
