const SlashCommand = require('../../utils/slashCommands');

const {
    MessageEmbed
} = require('discord.js')

const titles = require('../../gbfembedmessages.json')
const emojis = require('../../GBFEmojis.json')
const colours = require('../../GBFColor.json');
const MoneySchema = require('../../schemas/SueLuz-Account-Info-Schema');

module.exports = class DEVRemoveMoney extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "dev-clear",
            category: "Economy",
            description: "Resets a user's money",
            usage: "/clear <user>",
            examples: "/clear <user>",

            options: [{
                name: "user",
                description: "The user",
                type: 'USER',
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

        if (target.bot) {
            const DeveloperActionERR = new MessageEmbed()
                .setTitle(`⚠ Developer Action ⚠`)
                .setColor(colours.ERRORRED)
                .setDescription(`I **can't** remove money from a bot`)
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
                bankBal: 0,
                walletBal: 0,
                netWorth: 0
            });

            await userStuff.save().catch(e => {
                console.error("Error:", e)
            })

            const DeveloperAction = new MessageEmbed()
                .setTitle(`⚠ Developer Action ⚠`)
                .setColor(colours.DEFAULT)
                .setDescription(`Removed all of ${target.tag}'s money`)
                .setTimestamp()

            return interaction.reply({
                embeds: [DeveloperAction]
            })

        } else {
            await userDocs.updateOne({
                userId: target.id,
                userName: target.tag,
                userNameNoTag: target.username,
                bankBal: 0,
                walletBal: 0,
                netWorth: 0
            });

            let text

            if (Number(userDocs.bankBal) <= 0) {
                text = `Removed all of ${target.tag}'s money`
            } else {
                text = `Removed all of ${target.tag}'s money`
            }

            const DeveloperAction = new MessageEmbed()
                .setTitle(`⚠ Developer Action ⚠`)
                .setColor(colours.DEFAULT)
                .setDescription(text)
                .setTimestamp()

            return interaction.reply({
                embeds: [DeveloperAction]
            })

        }

    }
}
