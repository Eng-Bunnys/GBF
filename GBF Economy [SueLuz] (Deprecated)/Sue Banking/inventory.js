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

module.exports = class InventorySlash extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "inventory",
            category: "Economy",
            description: "Show's a user's inventory",
            usage: "/inventory <user>",
            examples: "/inventory <user>",

            options: [{
                name: "user",
                description: "The user to get their inventory",
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

        let collectionStats = await CollectionSchema.findOne({
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

        let DiamondLevel1 //1
        let DiamondLevel2 //2
        let DiamondLevel3 //3 
        let DiamondLevel4 //4
        let MusgraviteRing //5
        let PainiteRing //6
        let PinkStarRing //7
        let num = 0

        if (collectionStats.rings.includes(1)) {
            DiamondLevel1 = '✅'
            num++
        } else {
            DiamondLevel1 = '❌'
        }
        if (collectionStats.rings.includes(2)) {
            DiamondLevel2 = '✅'
            num++
        } else {
            DiamondLevel2 = '❌'
        }
        if (collectionStats.rings.includes(3)) {
            DiamondLevel3 = '✅'
            num++
        } else {
            DiamondLevel3 = '❌'
        }
        if (collectionStats.rings.includes(4)) {
            DiamondLevel4 = '✅'
            num++
        } else {
            DiamondLevel4 = '❌'
        }
        if (collectionStats.rings.includes(5)) {
            MusgraviteRing = '✅'
            num++
        } else {
            MusgraviteRing = '❌'
        }
        if (collectionStats.rings.includes(6)) {
            PainiteRing = '✅'
            num++
        } else {
            PainiteRing = '❌'
        }
        if (collectionStats.rings.includes(7)) {
            PinkStarRing = '✅'
            num++
        } else {
            PinkStarRing = '❌'
        }

        const PercentageRings = Number((num / 7) * 100)
        const FinalRings = `${(Math.round(PercentageRings)).toString()}%`

        const UserInv = new MessageEmbed()
            .setTitle(`**${user.username}'s** inventory`)
            .setColor(colours.DEFAULT)
            .addFields({
                name: "**💎 Owned Rings: 💎**",
                value: `**-Level One Diamond Ring:** ${DiamondLevel1}\n**-Level Two Diamond Ring:** ${DiamondLevel2}\n**-Level Three Diamond Ring:** ${DiamondLevel3}\n**-Level Four Diamond Ring:** ${DiamondLevel4}\n**-Musgravite Ring:** ${MusgraviteRing}\n**-Painite Ring:** ${PainiteRing}\n**-Pink Star Diamond Ring:** ${PinkStarRing}\n**-Percentage of rings owned: ${FinalRings}**`
            })
            .setTimestamp()
            .setFooter({
                text: `Checking ${user.username}'s inventory || GBF Banking`,
                iconURL: user.displayAvatarURL()
            })

        await interaction.reply({
            embeds: [UserInv]
        })

    }
}