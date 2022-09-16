const SlashCommand = require('../../utils/slashCommands');

const {
    MessageEmbed
} = require('discord.js')

const titles = require('../../gbfembedmessages.json')
const emojis = require('../../GBFEmojis.json')
const colours = require('../../GBFColor.json');
const MoneySchema = require('../../schemas/SueLuz-Account-Info-Schema');
const StoryProgressSchema = require('../../schemas/SueLuz-Story-Progress-Schema');

const {
    NeededRP
} = require('../../utils/engine');

module.exports = class BalanceSlash extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "balance",
            category: "Economy",
            description: "Show's a user's balance",
            usage: "/balance <user>",
            examples: "/balance <user>",

            options: [{
                name: "user",
                description: "The user to get their balance",
                type: 'USER',
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

        const user = interaction.options.getUser("user") || interaction.user

        if (user.bot) {
            const userBot = new MessageEmbed()
                .setTitle(titles.ERROR)
                .setColor(colours.ERRORRED)
                .setDescription(`Captha failed ❌\nUnable to verify that the user is human`)

            return interaction.reply({
                embeds: [userBot]
            })
        }

        let userDocs = await MoneySchema.findOne({
            userId: user.id
        }).catch(err => console.log(err))

        let storyProgress = await StoryProgressSchema.findOne({
            userId: user.id
        }).catch(err => console.log(err))

        if (!storyProgress) {

            const IntroRequired = new MessageEmbed()
                .setTitle('Feature unavailable')
                .setDescription(`${user.username} hasn't completed the intro mission to unlock this feature\nTo play the intro mission use /intro`)
                .setColor(colours.DEFAULT)

            return interaction.reply({
                embeds: [IntroRequired]
            })

        }

        const WalletMoney = Number(userDocs.walletBal).toLocaleString()
        const BankMoney = Number(userDocs.bankBal).toLocaleString()
        const TotalMoney = Number(Number(userDocs.walletBal) + Number(userDocs.bankBal)).toLocaleString()

        await userDocs.updateOne({
            netWorth: Number(Number(userDocs.walletBal) + Number(userDocs.bankBal)),
            userNameNoTag: user.username,
            userName: user.tag
        })

        const UserBalance = new MessageEmbed()
            .setTitle(`**${user.username}'s** account`)
            .setColor(colours.DEFAULT)
            .setDescription(`Wallet: **₲${WalletMoney}**\nBank: **₲${BankMoney}**\nTotal:** ₲${TotalMoney}**`)
            .setTimestamp()
            .setFooter({
                text: `Checking ${user.username}'s balance || Thanks for using GBF Banking`,
                iconURL: user.displayAvatarURL()
            })

        await interaction.reply({
            embeds: [UserBalance]
        })

    }
}
