const SlashCommand = require('../../utils/slashCommands');

const {
    MessageEmbed
} = require('discord.js')

const titles = require('../../gbfembedmessages.json')
const emojis = require('../../GBFEmojis.json')
const colours = require('../../GBFColor.json');
const MoneySchema = require('../../schemas/SueLuz-Account-Info-Schema');
const StoryProgressSchema = require('../../schemas/SueLuz-Story-Progress-Schema');

module.exports = class TransferMoney extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "leaderboard",
            category: "Economy",
            description: "GBF Money leaderboards",
            usage: "/leaderboard",
            examples: "/leaderboard",

            options: [{
                name: "type",
                description: "The type of leaderboard that you would like to show",
                type: 'STRING',
                choices: [{
                    name: "Wallet",
                    value: "Wallet"
                }, {
                    name: "Bank",
                    value: "Bank"
                }, {
                    name: "Total",
                    value: "Total"
                }],
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

        const type = interaction.options.getString("type");

        if (type === 'Total') {

            const NetWorthBoard = await MoneySchema.find({}).limit(10).sort({
                netWorth: -1
            })

            const ranks = NetWorthBoard.sort((a, b) => {
                if (a.netWorth > b.netWorth) return -1;
                else if (a.netWorth < b.netWorth) return 1;
                else return 0;
            });

            let leaderboard = ''
            for (let counter = 0; counter < NetWorthBoard.length; ++counter) {
                const {
                    userNameNoTag,
                    netWorth = 0
                } = NetWorthBoard[counter]

                leaderboard += `**${counter + 1}. ${userNameNoTag}** with a net worth of **₲${netWorth.toLocaleString()}**\n`
            }
            const networthlb = new MessageEmbed()
                .setTitle("Top 10 || Total Net Worth Leaderboard")
                .setDescription(`**${emojis.LOGOTRANS} GBF Global Leaderboards ${emojis.LOGOTRANS}**\n\n**You're rank: ${ranks.indexOf(ranks.find((m) => m.userId === interaction.member.id)) + 1}**\n\n${leaderboard}`)
                .setColor(colours.DEFAULT)
                .setFooter({
                    text: `Offical leaderboards || GBF Banking`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()

            return interaction.reply({
                embeds: [networthlb]
            })
        } else if (type === 'Wallet') {

            const WalletBoard = await MoneySchema.find({}).limit(10).sort({
                walletBal: -1
            })

            let leaderboard = ''
            for (let counter = 0; counter < WalletBoard.length; ++counter) {
                const {
                    userNameNoTag,
                    walletBal = 0
                } = WalletBoard[counter]

                leaderboard += `**${counter + 1}. ${userNameNoTag}** with **₲${walletBal.toLocaleString()}** in their wallet\n`
            }

            const ranks = WalletBoard.sort((a, b) => {
                if (a.walletBal > b.walletBal) return -1;
                else if (a.walletBal < b.walletBal) return 1;
                else return 0;
            });

            const walletlb = new MessageEmbed()
                .setTitle("Top 10 || Wallet Leaderboard")
                .setDescription(`**${emojis.LOGOTRANS} GBF Global Leaderboards ${emojis.LOGOTRANS}**\n\n**You're rank: ${ranks.indexOf(ranks.find((m) => m.userId === interaction.member.id)) + 1}**\n\n${leaderboard}`)
                .setColor(colours.DEFAULT)
                .setFooter({
                    text: `Offical leaderboards || GBF Banking`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()
            return interaction.reply({
                embeds: [walletlb]
            })

        } else if (type === 'Bank') {

            const BankBoard = await MoneySchema.find({}).limit(10).sort({
                bankBal: -1
            })

            let leaderboard = ''
            for (let counter = 0; counter < BankBoard.length; ++counter) {
                const {
                    userNameNoTag,
                    bankBal = 0
                } = BankBoard[counter]

                leaderboard += `**${counter + 1}. ${userNameNoTag}** with **₲${bankBal.toLocaleString()}** in their bank\n`
            }

            const ranks = BankBoard.sort((a, b) => {
                if (a.bankBal > b.bankBal) return -1;
                else if (a.bankBal < b.bankBal) return 1;
                else return 0;
            });

            const banklb = new MessageEmbed()
                .setTitle("Top 10 || Bank Leaderboard")
                .setDescription(`**${emojis.LOGOTRANS} GBF Global Leaderboards ${emojis.LOGOTRANS}**\n\n**You're rank: ${ranks.indexOf(ranks.find((m) => m.userId === interaction.member.id)) + 1}**\n\n${leaderboard}`)
                .setColor(colours.DEFAULT)
                .setFooter({
                    text: `Offical leaderboards || GBF Banking`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()
            return interaction.reply({
                embeds: [banklb]
            })

        }
    }
}