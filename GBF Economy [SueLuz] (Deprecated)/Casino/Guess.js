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

const {
    delay,
    NeededRP
} = require("../../utils/engine");

module.exports = class GuessingGame extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "guess",
            category: "Economy",
            description: "Higher or lower game at the casino",
            usage: "/guess",
            examples: "/guess",

            options: [{
                name: "bet",
                description: "The amount that you want to bet",
                type: 'NUMBER',
                required: true
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

        const UserBet = interaction.options.getNumber("bet");

        //Getting the user info from DB

        //Docs for the user money, RP, level, Rank
        let accountDocs = await MoneySchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        //Docs for story progression, type, etc
        let storyDocs = await StoryProgressSchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        //Docs for casino stats
        let casinoDocs = await CasinoSchema.findOne({
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
        //Limiting the bets to 50, 500k
        if (UserBet < 50 || UserBet > 500000) {

            const BadBets = new MessageEmbed()
                .setTitle("You can't do that")
                .setColor(colours.ERRORRED)
                .setDescription(`**Rules for betting:**\n\n-Minimum bet: **₲50**\n-Maximum bet: **₲500,000**`)
            return interaction.reply({
                embeds: [BadBets]
            })

        }

        //Checking the user bal

        const NoFunds = new MessageEmbed()

            .setTitle(titles.ERROR)
            .setColor(colours.ERRORRED)
            .setDescription(`You don't have sufficient funds to play this, you need **₲${UserBet.toLocaleString()}**`)
            .setTimestamp()

        if (Number(accountDocs.walletBal) < UserBet) {
            if (Number(accountDocs.bankBal) < UserBet) {
                return interaction.reply({
                    embeds: [NoFunds]
                })
            } else {

                await accountDocs.updateOne({
                    bankBal: Number(accountDocs.bankBal) - UserBet
                })
            }
            if (Number(accountDocs.bankBal) < UserBet && Number(accountDocs.walletBal) < UserBet) {
                return interaction.reply({
                    embeds: [NoFunds]
                })
            }
        } else {

            await accountDocs.updateOne({
                walletBal: Number(accountDocs.walletBal) - UserBet
            })
        }

        //System

        const GuessedNumber = Math.floor(Math.random() * 100)
        const DisplayNumber = Math.floor(Math.random() * 100)

        const CasinoGame = new MessageEmbed()
            .setTitle(`${emojis.PARROT} HIGHER OR LOWER ${emojis.PARROT}`)
            .setColor(colours.DEFAULT)
            .setDescription(`**I'm gonna guess a number, give you a second and you gotta say if it's HIGHER, SAME OR LOWER!**\n\nNumber: **${DisplayNumber.toLocaleString()}**\n\nIs **${DisplayNumber.toLocaleString()}** higher or lower than my guessed number 🤔?\n\n**⚠ This is a double or nothing game ⚠**`)
            .setFooter({
                text: `Current location: Nova Casino and resort || Remember the house always wins`,
                iconURL: interaction.user.displayAvatarURL()
            })

        let answer

        if (DisplayNumber < GuessedNumber) {
            answer = '1'
        } else if (DisplayNumber > GuessedNumber) {
            answer = '2'
        } else {
            answer = '0'
        }

        console.log(`1: ${GuessedNumber}\n2: ${DisplayNumber}`)

        const LowerB = new MessageButton()
            .setCustomId("lower")
            .setLabel("Lower!")
            .setStyle("SECONDARY")
        const higherB = new MessageButton()
            .setCustomId("higher")
            .setLabel("Higher!")
            .setStyle("SECONDARY")
        const sameB = new MessageButton()
            .setCustomId("same")
            .setLabel("Same!")
            .setStyle("SECONDARY")

        const ButtonsRow = new MessageActionRow().addComponents([LowerB, sameB, higherB])

        await interaction.reply({
            embeds: [CasinoGame],
            components: [ButtonsRow]
        })
        //To prevent AFK
        setTimeout(() => {
            return interaction.editReply({
                components: []
            })
        }, 299400);
        //Level up system
        const UserRP = Number(accountDocs.RP) + 200

        let RPForNextLVL = NeededRP(accountDocs.Rank)

        const RankedUp = new MessageEmbed()
            .setTitle("Ranked up")
            .setDescription(`Rank: **${Number(accountDocs.Rank) + 1}**\nRP required for level ${Number(accountDocs.Rank) + 2}: **${NeededRP(accountDocs.Rank + 2)}**`)
            .setColor(colours.DEFAULT)
        //Embeds 

        //User money options
        //Multi for the user's money
        let WonMoney = Math.round(Number(UserBet * 2))
        const AddedBet = Number(casinoDocs.totalBet + UserBet)
        console.log(WonMoney)

        const Victory = new MessageEmbed()
            .setTitle("Winner 🥳")
            .setColor(colours.DEFAULT)
            .setDescription(`**Your guess was CORRECT! \`Number: ${GuessedNumber}\`**\n\nBet: **₲${UserBet.toLocaleString()}**\nWon: **₲${WonMoney.toLocaleString()}**\nRP gained: **200RP**`)
            .setFooter({
                text: `Nova Casino and resort`,
                iconURL: interaction.user.displayAvatarURL()
            })

        const Loss = new MessageEmbed()
            .setTitle("Better luck next time 🙁")
            .setColor(colours.DEFAULT)
            .setDescription(`**The number was: ${GuessedNumber}**\n\nBet: **₲${UserBet.toLocaleString()}**`)
            .setFooter({
                text: `Nova Casino and resort`,
                iconURL: interaction.user.displayAvatarURL()
            })

        const filter = i => {
            return i.user.id === interaction.user.id;
        };

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            idle: 30000,
            time: 300000,
            maxComponents: 1
        });

        collector.on('collect', async i => {
            await i.deferUpdate();
            await delay(750);

            if (i.customId === 'lower' && answer === '1') {

                const AddedWins = Number(casinoDocs.gameWins) + 1
                const GameWins = Number(casinoDocs.totalWon) + WonMoney

                const UpdatingNetWorth = Number(accountDocs.netWorth + WonMoney) - UserBet

                await accountDocs.updateOne({
                    walletBal: Number(accountDocs.walletBal) + WonMoney,
                    RP: Number(accountDocs.RP) + 200,
                    netWorth: UpdatingNetWorth
                })

                await casinoDocs.updateOne({
                    gameWins: AddedWins,
                    totalWon: GameWins,
                    totalBet: AddedBet
                })

                if (UserRP >= RPForNextLVL) {

                    await accountDocs.updateOne({
                        RP: 0,
                        Rank: Number(accountDocs.Rank) + 1
                    })

                    await interaction.channel.send({
                        embeds: [RankedUp]
                    })
                }

                return interaction.editReply({
                    embeds: [Victory],
                    components: []
                })
            } else if (i.customId === 'higher' && answer === '2') {

                const AddedWins = Number(casinoDocs.gameWins) + 1
                const GameWins = Number(casinoDocs.totalWon) + WonMoney

                const UpdatingNetWorth = Number(accountDocs.netWorth + WonMoney) - UserBet

                await accountDocs.updateOne({
                    walletBal: Number(accountDocs.walletBal) + WonMoney,
                    RP: Number(accountDocs.RP) + 200,
                    netWorth: UpdatingNetWorth
                })

                await casinoDocs.updateOne({
                    gameWins: AddedWins,
                    totalWon: GameWins,
                    totalBet: AddedBet
                })

                if (UserRP >= RPForNextLVL) {

                    await accountDocs.updateOne({
                        RP: 0,
                        Rank: Number(accountDocs.Rank) + 1
                    })

                    await interaction.channel.send({
                        embeds: [RankedUp]
                    })
                }

                return interaction.editReply({
                    embeds: [Victory],
                    components: []
                })
            } else if (i.customId === 'same' && answer === '0') {

                const AddedWins = Number(casinoDocs.gameWins) + 1
                const GameWins = Number(casinoDocs.totalWon) + WonMoney

                const UpdatingNetWorth = Number(accountDocs.netWorth + WonMoney) - UserBet

                await accountDocs.updateOne({
                    walletBal: Number(accountDocs.walletBal) + WonMoney,
                    RP: Number(accountDocs.RP) + 200,
                    netWorth: UpdatingNetWorth
                })

                await casinoDocs.updateOne({
                    gameWins: AddedWins,
                    totalWon: GameWins,
                    totalBet: AddedBet
                })

                if (UserRP >= RPForNextLVL) {

                    await accountDocs.updateOne({
                        RP: 0,
                        Rank: Number(accountDocs.Rank) + 1
                    })

                    await interaction.channel.send({
                        embeds: [RankedUp]
                    })
                }

                return interaction.editReply({
                    embeds: [Victory],
                    components: []
                })

            } else {

                const AddedLoss = Number(casinoDocs.gameLosses) + 1
                const GameLoss = Number(casinoDocs.totalLost) + WonMoney

                await casinoDocs.updateOne({
                    gameLosses: AddedLoss,
                    totalLost: GameLoss,
                    totalBet: AddedBet
                })

                return interaction.editReply({
                    embeds: [Loss],
                    components: []
                })
            }
        })

        collector.on("end", async (collected) => {

            if (collected.size === 0) {

                const eightyOfMoney = Number(80 / 100) * UserBet

                console.log(eightyOfMoney)

                const NoResponde = new MessageEmbed()
                    .setTitle('Game Ended')
                    .setDescription(`Looks like you didn't respond! I've refunded 80% of your money **₲${eightyOfMoney}**`)
                    .setColor(colours.LIGHTBLUE)
                    .setFooter({
                        text: `If you think there is a mistake please contact support`,
                        iconURL: interaction.user.displayAvatarURL()
                    })

                const Updating = Number(accountDocs.walletBal) + UserBet
                await accountDocs.updateOne({
                    walletBal: Updating
                })

                return interaction.editReply({
                    embeds: [NoResponde],
                    components: []
                })
            } else {
                return
            }
        });
    }
}
