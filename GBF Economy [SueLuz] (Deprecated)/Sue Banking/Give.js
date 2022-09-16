const SlashCommand = require('../../utils/slashCommands');

const {
    MessageEmbed
} = require('discord.js')

const titles = require('../../gbfembedmessages.json')
const emojis = require('../../GBFEmojis.json')
const colours = require('../../GBFColor.json');
const MoneySchema = require('../../schemas/SueLuz-Account-Info-Schema');
const StoryProgressSchema = require('../../schemas/SueLuz-Story-Progress-Schema');

module.exports = class GiveMoney extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "give",
            category: "Economy",
            description: "Give a person money",
            usage: "/give <user> <amount>",
            examples: "/give <user> <amount>",

            options: [{
                name: "user",
                description: "The user to give money",
                type: 'USER',
                required: true
            }, {
                name: "value",
                description: "Amount of money to give to the user",
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

        const user = interaction.options.getUser("user") || interaction.user;
        const value = interaction.options.getNumber("value");

        //Validation

        if (value <= 1) {

            const ZeroError = new MessageEmbed()
                .setTitle(titles.ERROR)
                .setColor(colours.ERRORRED)
                .setDescription(`You need to give atleast ₲1`)
                .setFooter({
                    text: `Amount entered: ₲${value} || GBF Banking`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()

            return interaction.reply({
                embeds: [ZeroError]
            })

        }

        if (user.bot) {
            const userBot = new MessageEmbed()
                .setTitle(titles.ERROR)
                .setColor(colours.ERRORRED)
                .setDescription(`Captha failed ❌\nUnable to verify that the user is human`)

            return interaction.reply({
                embeds: [userBot]
            })
        }

        if (user.id === interaction.user.id) {
            const UserERR = new MessageEmbed()
                .setTitle(titles.ERROR)
                .setColor(colours.ERRORRED)
                .setDescription(`You can't give yourself money, what type of logic is that <:wtf:548853705697525761>`)

            return interaction.reply({
                embeds: [UserERR]
            })
        }

        let storyProgress = await StoryProgressSchema.findOne({
            userId: user.id
        }).catch(err => console.log(err))

        if (!storyProgress || storyProgress.introComplete === 'No') {

            const IntroRequired = new MessageEmbed()
                .setTitle('Feature unavailable')
                .setDescription(`${user.username} hasn't completed the intro mission to unlock this feature\nTo play the intro mission use /intro`)
                .setColor(colours.DEFAULT)

            return interaction.reply({
                embeds: [IntroRequired]
            })

        }

        //Giver account

        let giverAccount = await MoneySchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))

        //Tax
        const tax = Number(value * (1.5 / 100))
        const taxedAmount = Number(value + tax)

        const GiverBankBalance = Number(giverAccount.bankBal).toLocaleString()

        if (GiverBankBalance < taxedAmount) {

            const InsufficientFunds = new MessageEmbed()
                .setTitle(`Insufficient funds`)
                .setColor(colours.ERRORRED)
                .setDescription(`Amount required: ₲**${taxedAmount}**\nAmount inside of bank: ₲**${GiverBankBalance}**\nTax: **1.5% => ₲${tax}**`)
                .setFooter({
                    text: `GBF Banking || Fund Transfer`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()

            return interaction.reply({
                embeds: [InsufficientFunds]
            })

        }

        //Reciever account

        let recieverAccount = await MoneySchema.findOne({
            userId: user.id
        }).catch(err => console.log(err))

        if (!recieverAccount) {

            const IntroRequired = new MessageEmbed()
                .setTitle('Feature unavailable')
                .setDescription(`${user.username} hasn't completed the intro mission to unlock this feature\nTo play the intro mission use /intro`)
                .setColor(colours.DEFAULT)

            return interaction.reply({
                embeds: [IntroRequired]
            })


        }

        await recieverAccount.updateOne({
            bankBal: (Number(recieverAccount.bankBal) + value),
            userNameNoTag: user.username,
            userName: user.tag
        })

        const RemainingBalance = Number(Number(giverAccount.bankBal - Number(taxedAmount))).toLocaleString()

        await giverAccount.updateOne({
            bankBal: (Number(giverAccount.bankBal) - taxedAmount),
            userNameNoTag: interaction.user.username,
            userName: interaction.user.tag
        })

        const BeforeTransaction = Number(giverAccount.bankBal).toLocaleString()

        const receipt = new MessageEmbed()

            .setTitle(titles.SUCCESS)
            .setColor(colours.DEFAULT)
            .setDescription(`Transaction complete || Refunds are unavailable`)
            .addFields({
                name: "Sender:",
                value: interaction.user.tag
            }, {
                name: "For:",
                value: user.tag
            }, {
                name: "Balance:",
                value: `Before: **₲${BeforeTransaction}**\nAfter: **₲${RemainingBalance}**`
            }, {
                name: "Amount spent:",
                value: `With tax: **₲${taxedAmount.toLocaleString()}**\nWithout tax: **₲${value.toLocaleString()}**`
            }, {
                name: "Tax:",
                value: `**1.5% || ₲${tax.toLocaleString()}**`
            }, {
                name: "Remaining balance",
                value: `**₲${RemainingBalance}**`
            }, {
                name: "Sent at:",
                value: `<t:${Math.floor(new Date() / 1000)}:f>`
            })
            .setFooter({
                text: `If there are any mistakes or you have any questions please contact support via the support server => /invite`,
                iconURL: interaction.user.displayAvatarURL()
            })

        await interaction.reply({
            embeds: [receipt]
        })

        try {
            await user.send({
                embeds: [receipt]
            })
        } catch (err) {
            return interaction.channel.send({
                content: `Unable to send the confirmation message to ${user.username}, the transaction will still go through`
            })
        }

        return

    }
}
