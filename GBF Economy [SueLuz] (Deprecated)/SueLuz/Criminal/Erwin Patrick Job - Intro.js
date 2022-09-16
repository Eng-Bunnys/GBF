const SlashCommand = require('../../../utils/slashCommands');

const {
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    Message
} = require('discord.js')

const titles = require('../../../gbfembedmessages.json')
const emojis = require('../../../GBFEmojis.json')
const colours = require('../../../GBFColor.json');
const MoneySchema = require('../../../schemas/SueLuz-Account-Info-Schema');
const StoryProgressSchema = require('../../../schemas/SueLuz-Story-Progress-Schema');
const HeistProgressSchema = require('../../../schemas/SueLuz-Heist-Info-Schema');

const {
    delay,
    NeededRP
} = require("../../../utils/engine");

module.exports = class HeistBegineerSLash extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "heist-b",
            category: "Economy",
            description: "You and David follow Mr Walker's plan to rob a small bank by the highway",
            usage: "/heist-e",
            examples: "/heist-e",

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

        //Docs for the user money, RP, level, Rank
        let accountDocs = await MoneySchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        //Docs for story progression, type
        let storyDocs = await StoryProgressSchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        //Docs for heist progression, completed jobs, etc
        let heistDocs = await HeistProgressSchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))

        if (!storyDocs || !accountDocs) {
            const IntroRequired = new MessageEmbed()
                .setTitle('Feature unavailable')
                .setDescription(`Please complete the intro mission to unlock this feature\nTo play the intro mission use /intro`)
                .setColor(colours.DEFAULT)

            return interaction.reply({
                embeds: [IntroRequired]
            })
        }

        const UserType = storyDocs.storyChoice

        if (UserType !== 'Crime') {
            const NotCrime = new MessageEmbed()
                .setTitle('Mission locked')
                .setDescription(`This mission is locked 🔐\nPrerequisites:\nPath: **Crime**\nYour Path:**${UserType}**`)
                .setColor(colours.ERRORRED)
                .setFooter({
                    text: "SueLuz, the city of saints and sinners",
                    iconURL: interaction.user.displayAvatarURL()
                })

            return interaction.reply({
                embeds: [NotCrime]
            })
        }

        let RPForNextLVL = NeededRP(accountDocs.Rank)

        const UserRP = Number(accountDocs.RP) + 1200

        const RankedUp = new MessageEmbed()
            .setTitle("Ranked up")
            .setDescription(`Rank: **${Number(accountDocs.Rank) + 1}**\nRP required for level ${Number(accountDocs.Rank) + 2}: **${NeededRP(accountDocs.Rank + 2)}**`)
            .setColor(colours.SUCCESSGREEN)

        const StoryProgress = Number(storyDocs.storyProgress)
        const HeistProgress = Number(storyDocs.heistProgress)

        const LockedContent = new MessageEmbed()
            .setTitle('Mission locked')
            .setDescription(`This mission is locked 🔐\nPrerequisites:\nPath: **Crime**\nStory progress: **2% or more**\nHeist progress: **10% or more**\nYou can check your progress by using /profile`)
            .setColor(colours.ERRORRED)
            .setFooter({
                text: "SueLuz, the city of saints and sinners",
                iconURL: interaction.user.displayAvatarURL()
            })

        const AlreadyStarted = new MessageEmbed()
            .setTitle('Heist already in progress')
            .setDescription(`You've already started this heist`)
            .setColor(colours.ERRORRED)
            .setFooter({
                text: "SueLuz, the city of saints and sinners",
                iconURL: interaction.user.displayAvatarURL()
            })

        if (Number(accountDocs.Rank) < 5) {
            const RankLock = new MessageEmbed()
                .setTitle("You can't uses this yet")
                .setDescription(`You need to be rank **5 or higher** to play this heist`)
                .setColor(colours.ERRORRED)
                .setFooter({
                    text: `An easy way to gain RP is to play jobs or gamble at the casino! check /jobs-list or /casino-games for more info`,
                    iconURL: interaction.user.displayAvatarURL()
                })

            return interaction.reply({
                embeds: [RankLock]
            })
        }

        const FirstDialouge = new MessageEmbed()
            .setColor(colours.SUCCESSGREEN)
            .setDescription(`**Jay:** "Okay you're here, I thought you wouldn't come, okay so, there's this job, very big job but that has to wait, you have to prove yourself to me first and build up a crew, anyways there's this rich f.ck who got himself in a bit of a pinch and it's our job to get him out of it and he will pay, he pays really well, but we need equipment, I have a list of things we need, I'll send it to you, you can either pay someone to go get them or get them yourself, I'll talk to you later I have personal stuff to do, now go f.ck off I'll send you the list"`)

        const SkipDialogue = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomId('Continue/Skip dialogue')
                .setLabel('Continue/Skip dialogue')
                .setStyle('SECONDARY')
                .setEmoji('⏩'),
            );

        await interaction.reply({
            embeds: [FirstDialouge],
            components: [SkipDialogue]
        })

        await storyDocs.updateOne({
            userId: interaction.user.id,
            userName: interaction.user.tag,
            userNameNoTag: interaction.user.username,
            storyProgress: 3,
            heistProgress: 11,
            activeHeist: 'Erwin Patrick Job'
        })

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

        })

    }
}
