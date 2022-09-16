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
            name: "transfer",
            category: "Economy",
            description: "Transfer money from your wallet to bank, vise versa",
            usage: "/transfer <type> <amount>",
            examples: "/transfer <type> <amount>",

            options: [{
                name: "type",
                description: "The place that you want to transfer the money to",
                choices: [{
                    name: "Wallet",
                    value: "Wallet"
                }, {
                    name: "Bank",
                    value: "Bank"
                }],
                type: 'STRING',
                required: true
            }, {
                name: "value",
                description: "Amount of money to transfer",
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

        const value = interaction.options.getNumber("value");
        const type = interaction.options.getString("type");

        const user = interaction.user

        //Validation

        if (value <= 0) {

            const ZeroError = new MessageEmbed()
                .setTitle(titles.ERROR)
                .setColor(colours.ERRORRED)
                .setDescription(`You need to give transfer atleast ₲1`)
                .setFooter({
                    text: `Amount entered: ₲${value} || GBF Banking`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()

            return interaction.reply({
                embeds: [ZeroError]
            })

        }

        let storyProgress = await StoryProgressSchema.findOne({
            userId: user.id
        }).catch(err => console.log(err))

        if (!storyProgress || storyProgress.introComplete === 'No') {

            const IntroRequired = new MessageEmbed()
                .setTitle('Feature unavailable')
                .setDescription(`${interaction.user.username} hasn't completed the intro mission to unlock this feature\nTo play the intro mission use /intro`)
                .setColor(colours.DEFAULT)

            return interaction.reply({
                embeds: [IntroRequired]
            })

        }

        let userAccount = await MoneySchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))

        const UserBankBalance = Number(userAccount.bankBal).toLocaleString()
        const UserWalletBalance = Number(userAccount.walletBal).toLocaleString()

        const NewWallet = Number(Number(userAccount.walletBal) + value).toLocaleString()
        const NewBank = Number(Number(userAccount.bankBal) - value).toLocaleString()
        const Total = Number(Number(userAccount.walletBal) + Number(userAccount.bankBal)).toLocaleString()

        if (type === 'Wallet') {

            if (UserBankBalance < value) {

                const InsufficientFunds = new MessageEmbed()
                    .setTitle(`Insufficient funds`)
                    .setColor(colours.ERRORRED)
                    .setDescription(`Amount required: ₲**${value.toLocaleString()}**\nAmount inside of bank: ₲**${UserBankBalance}**`)
                    .setFooter({
                        text: `GBF Banking || Fund Transfer`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp()

                return interaction.reply({
                    embeds: [InsufficientFunds]
                })

            }

            await userAccount.updateOne({
                walletBal: (Number(userAccount.walletBal) + value),
                bankBal: (Number(userAccount.bankBal) - value),
                netWorth: (Number(userAccount.walletBal) + Number(userAccount.bankBal)),
                userName: interaction.user.tag,
                userNameNoTag: interaction.user.username,
            })

            const NewBalanceWallet = new MessageEmbed()
                .setTitle(titles.SUCCESS)
                .setColor(colours.DEFAULT)
                .setDescription(`Transferred ₲**${value.toLocaleString()}** from your **bank** to **wallet**\nWallet:** ₲${NewWallet}**\nBank:** ₲${NewBank}**\nTotal:** ₲${Total}**`)
                .setTimestamp()
                .setFooter({
                    text: `Tranferring funds || GBF Banking`,
                    iconURL: interaction.user.displayAvatarURL()
                })

            return interaction.reply({
                embeds: [NewBalanceWallet]
            })

        } else if (type === 'Bank') {

            if (UserWalletBalance < value) {

                const InsufficientFunds = new MessageEmbed()
                    .setTitle(`Insufficient funds`)
                    .setColor(colours.ERRORRED)
                    .setDescription(`Amount required: ₲**${value.toLocaleString()}**\nAmount inside of wallet: ₲**${UserWalletBalance}**`)
                    .setFooter({
                        text: `GBF Banking || Fund Transfer`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp()

                return interaction.reply({
                    embeds: [InsufficientFunds]
                })

            }

            await userAccount.updateOne({
                walletBal: (Number(userAccount.walletBal) - value),
                bankBal: (Number(userAccount.bankBal) + value),
                netWorth: (Number(userAccount.walletBal) + Number(userAccount.bankBal)),
                userName: interaction.user.tag,
                userNameNoTag: interaction.user.username
            })

            const NewWallet2 = Number(Number(userAccount.walletBal) - value).toLocaleString()
            const NewBank2 = Number(Number(userAccount.bankBal) + value).toLocaleString()

            const NewBalanceWalletE = new MessageEmbed()
                .setTitle(titles.SUCCESS)
                .setColor(colours.DEFAULT)
                .setDescription(`Transferred ₲**${value.toLocaleString()}** from your **wallet** to **bank**\nWallet:** ₲${NewWallet2}**\nBank:** ₲${NewBank2}**\nTotal:** ₲${Total}**`)
                .setTimestamp()
                .setFooter({
                    text: `Tranferring funds || GBF Banking`,
                    iconURL: interaction.user.displayAvatarURL()
                })

            return interaction.reply({
                embeds: [NewBalanceWalletE]
            })

        }

    }
}
