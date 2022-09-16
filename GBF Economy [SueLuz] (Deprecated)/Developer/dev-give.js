const SlashCommand = require('../../utils/slashCommands');

const {
    MessageEmbed
} = require('discord.js')

const titles = require('../../gbfembedmessages.json')
const emojis = require('../../GBFEmojis.json')
const colours = require('../../GBFColor.json');
const MoneySchema = require('../../schemas/SueLuz-Account-Info-Schema');

module.exports = class DEVGiveMoney extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "dev-give",
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

            devOnly: true,
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

        const target = interaction.options.getUser("user")
        const value = interaction.options.getNumber("value")


        if (target.bot) {
            const DeveloperActionERR = new MessageEmbed()
                .setTitle(`⚠ Developer Action ⚠`)
                .setColor(colours.ERRORRED)
                .setDescription(`I **can't** give money to a bot`)
                .setTimestamp()

            return interaction.reply({
                embeds: [DeveloperActionERR]
            })
        }

        let userDocs = await MoneySchema.findOne({
            userId: target.id
        }).catch(err => console.log(err))

        if (!userDocs) {

            let userStuff = new MoneySchema({
                userId: target.id,
                userName: target.tag,
                userNameNoTag: target.username,
                walletBal: 0,
                bankBal: value,
                netWorth: value
            });

            await userStuff.save().catch(e => {
                console.error("Error:", e)
            })

            const DeveloperAction = new MessageEmbed()
                .setTitle(`⚠ Developer Action ⚠`)
                .setColor(colours.DEFAULT)
                .setDescription(`Gave **₲${value.toLocaleString()}** to ${target.tag}`)
                .setTimestamp()

            return interaction.reply({
                embeds: [DeveloperAction]
            })

        } else {
            await userDocs.updateOne({
                userId: target.id,
                userName: target.tag,
                userNameNoTag: target.username,
                bankBal: Number(Number(userDocs.bankBal) + value),
                netWorth: Number(Number(userDocs.netWorth) + value)
            });

            const DeveloperAction = new MessageEmbed()
                .setTitle(`⚠ Developer Action ⚠`)
                .setColor(colours.DEFAULT)
                .setDescription(`Gave **₲${value.toLocaleString()}** to ${target.tag}`)
                .setTimestamp()

            return interaction.reply({
                embeds: [DeveloperAction]
            })

        }

    }
}