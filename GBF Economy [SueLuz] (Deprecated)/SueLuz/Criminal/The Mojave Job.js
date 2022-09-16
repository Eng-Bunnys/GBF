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

module.exports = class TheMojaveJobSueLuz extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "the-mojave-job",
            category: "Economy",
            description: "You and David follow Mr Walker's plan to rob a small bank by the highway",
            usage: "/the-mojave-job",
            examples: "/the-mojave-job",

            devOnly: true,
            userPerheist: [],
            botPerheist: [],
            cooldown: 0,
            development: true,
            Partner: false,
        });
    }


    async execute({
        client,
        interaction
    }) {

        const HeistName = "The Mojave Job"

        //Getting the user info

        //Docs for the user money, RP, level, Rank
        let accountDocs = await MoneySchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        //Docs for story progression, type, etc
        let storyDocs = await StoryProgressSchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))
        //Docs for the heist progression active heist, etc
        let heistDocs = await HeistProgressSchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))

        //Checking if the user is new or not

        if (!storyDocs || !accountDocs) {
            const IntroRequired = new MessageEmbed()
                .setTitle('Feature unavailable')
                .setDescription(`Please complete the intro heist to unlock this feature\nTo play the intro heist use /intro`)
                .setColor(colours.DEFAULT)

            return interaction.reply({
                embeds: [IntroRequired]
            })
        }

        //Checking if the user is capable of playing the heist

        if (storyDocs.storyChoice !== 'Crime') {
            const NotCrime = new MessageEmbed()
                .setTitle('Heist locked')
                .setDescription(`This heist is locked 🔐\nPrerequisites:\nPath: **Crime**\nYour Path:**${UserType}**`)
                .setColor(colours.ERRORRED)
                .setFooter({
                    text: "SueLuz, the city of saints and sinners",
                    iconURL: interaction.user.displayAvatarURL()
                })

            return interaction.reply({
                embeds: [NotCrime]
            })
        }

        let starter

        //Checking the users active heist

        if (heistDocs.ActiveHeist !== HeistName) {
            //Checking if it's the user has no active heist
            if (heistDocs.ActiveHeist === 'None') {
                starter = true
            } else {
                const ActiveHeist = new MessageEmbed()
                    .setTitle("You already have an active heist")
                    .setDescription(`This heist is locked 🔐\nYou have to complete your currently active heist, **${heistDocs.ActiveHeist}**, in order to start a new one`)
                    .setColor(colours.ERRORRED)
                    .setFooter({
                        text: "SueLuz, the city of saints and sinners",
                        iconURL: interaction.user.displayAvatarURL()
                    })

                starter = false

                return interaction.reply({
                    embeds: [ActiveHeist]
                })
            }
        }

        const IntroMSG = new MessageEmbed()
            .setTitle("Heist started: The Mojave Job")
            .setColor(colours.SUCCESSGREEN)
            .setDescription(`You and David follow the carefully made plan by Jay to go into the Mojave Highway bank, David takes out the security cameras, you have to get one money bag but one of the two contains a dye pack, set it off, and the job is blown, you have 5 minutes to get in and out so be quick\n\nDifficulty: **Easy**\n\nPayOut: **₲15,000 150RP**\n\nEntry free: **₲50**\n\nUpgrades: **₲250 (75%), ₲1,000 (80%), ₲1,500 (90%), ₲2,000 (99%)**\n\nNote: You **must** have the money in your **wallet**, to transfer money from your bank use /transfer`)
            .setFooter({
                text: `Tip: The amount of money you spend on the startup dertirmes the percentage of the bag taken not being a dye pack, you only need to pay once`,
                iconURL: interaction.user.displayAvatarURL()
            })

        const SkipDialogue = new MessageActionRow()
            .addComponents(new MessageButton()
                .setCustomId('Continue/Skip dialogue')
                .setLabel('Continue/Skip dialogue')
                .setStyle('SECONDARY')
                .setEmoji('⏩'),
            );

        const UserStoryProgress = Number(storyDocs.storyProgress)
        const UserHeistProgress = Number(storyDocs.heistProgress)

        //Ranking system

        let RPForNextLVL = NeededRP(accountDocs.Rank)

        //Checking if the user has enough money to start the heist

        const UserBal = Number(accountDocs.walletBal)

        if (UserBal < 50) {
            const FundsERR = new MessageEmbed()
                .setTitle(titles.ERROR)
                .setColor(colours.ERRORRED)
                .setDescription(`You don't have sufficient funds to start this heist, you need **₲50** and you have to be level **0**`)
                .setTimestamp()

            return interaction.editReply({
                embeds: [FundsERR]
            })
        }

        //Multiplier for heist

        let Multi

        let CurrentMulti

        CurrentMulti = Number(heistDocs.MojaveJobHacker) || 50

        //Key pad answer

        let keypadNumbers = ['1', '2', '4']
        const FinalANS = keypadNumbers[Math.floor(Math.random() * keypadNumbers.length)]

        //Sending the main message

        const FirstOption = new MessageButton()
            .setCustomId("250")
            .setLabel("₲250")
            .setStyle("SUCCESS")

        const SecondOption = new MessageButton()
            .setCustomId("1000")
            .setLabel("₲1,000")
            .setStyle("SUCCESS")

        const ThirdOption = new MessageButton()
            .setCustomId("1500")
            .setLabel("₲1,500")
            .setStyle("SUCCESS")

        const FourthOption = new MessageButton()
            .setCustomId("2000")
            .setLabel("₲2,000")
            .setStyle("SUCCESS")

        const Cancel = new MessageButton()
            .setCustomId("cancel")
            .setLabel("Cancel Heist")
            .setStyle("DANGER")

        const CurrentSettings = new MessageButton()
            .setCustomId('current')
            .setLabel("No payment")
            .setStyle("SUCCESS")

        const MoneyRow = new MessageActionRow().addComponents([FirstOption, SecondOption, ThirdOption, FourthOption, CurrentSettings])
        const CancelRow = new MessageActionRow().addComponents([Cancel])

        await interaction.reply({
            embeds: [IntroMSG],
            components: [MoneyRow, CancelRow]
        })
        let UserHeistPlays
        if (heistDocs.HeistPlays !== undefined) {
            UserHeistPlays = Number(heistDocs.HeistPlays)
        } else {
            UserHeistPlays = 0
        }
        //To avoid idling

        setTimeout(() => {
            return interaction.editReply({
                components: []
            })
        }, 299400);

        await interaction.followUp({
            content: `Warning: After 30 seconds of inactivity the menu closes, you will get a "Interaction failed" message`,
            ephemeral: true
        })

        //Filter and collectors

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

            //If the user cancelled
            if (i.customId === 'cancel') {
                const Failed = new MessageEmbed()
                    .setTitle("Heist Failed")
                    .setDescription(`${interaction.user.username} quit`)
                    .setColor(colours.ERRORRED)
                    .setFooter({
                        text: `You can re-run the heist and give it another go`,
                        iconURL: interaction.user.displayAvatarURL()
                    })

                return interaction.editReply({
                    embeds: [Failed],
                    components: []
                })

                //User choice for money

            } else if (i.customId === '250') {

                Multi = 75

                if (CurrentMulti >= 75) {
                    const AlreadyHigher = new MessageEmbed()
                        .setTitle("I can't do that")
                        .setDescription(`GBF Cash isn't something that you should waste... Unless it's in the casino then feel free`)
                        .setColor(colours.ERRORRED)
                        .setFooter({
                            text: `Heist will continue as normal, please choose another payment option or click "No payment"`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    Multi = CurrentMulti

                    await interaction.editReply({
                        embeds: [AlreadyHigher]
                    })
                } else {

                    if (UserBal < 300) {
                        const FundsERR = new MessageEmbed()
                            .setTitle(titles.ERROR)
                            .setColor(colours.ERRORRED)
                            .setDescription(`You don't have sufficient funds to start this heist, you need **₲250** and you have to be level **0**`)
                            .setTimestamp()

                        return interaction.editReply({
                            embeds: [FundsERR]
                        })
                    }

                    await heistDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        MojaveJobHacker: Multi
                    })

                    await accountDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        walletBal: Number(accountDocs.walletBal) - 300
                    })

                    const FirstDialouge = new MessageEmbed()
                        .setDescription(`**David:** "Okay tough shot, Jay has setup a plan for us, really detailed he's our guy, we're gonna go to the bank, shoot the cameras and put everyone on gun point, since this is your first time I'ma give you the more skillfull job, you're gonna go inside and look for the safety deposit box 0406, get it but do not set off the dye packs or we're screwed, then we run before the cops show up, 5 minutes in and out, Jay has used the budget to improve the system so now we have a 75% chance of getting it done compared to the 50% before, you can always buy more equipment to make this easier but it's gonna cost you alot of money"`)
                        .setColor(colours.SUCCESSGREEN)

                    await interaction.editReply({
                        embeds: [FirstDialouge],
                        components: [SkipDialogue]
                    })
                }
            } else if (i.customId === '1000') {

                Multi = 80

                if (CurrentMulti >= 80) {
                    const AlreadyHigher = new MessageEmbed()
                        .setTitle("I can't do that")
                        .setDescription(`GBF Cash isn't something that you should waste... Unless it's in the casino then feel free`)
                        .setColor(colours.ERRORRED)
                        .setFooter({
                            text: `Heist will continue as normal, please choose another payment option or click "No payment"`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    Multi = CurrentMulti

                    await interaction.editReply({
                        embeds: [AlreadyHigher]
                    })
                } else {

                    if (UserBal < 1050) {
                        const FundsERR = new MessageEmbed()
                            .setTitle(titles.ERROR)
                            .setColor(colours.ERRORRED)
                            .setDescription(`You don't have sufficient funds to start this heist, you need **₲1000** and you have to be level **0**`)
                            .setTimestamp()

                        return interaction.editReply({
                            embeds: [FundsERR]
                        })
                    }

                    await heistDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        MojaveJobHacker: Multi
                    })

                    await accountDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        walletBal: Number(accountDocs.walletBal) - 1050
                    })

                    const FirstDialouge = new MessageEmbed()
                        .setDescription(`**David:** "Okay tough shot, Jay has setup a plan for us, really detailed he's our guy, we're gonna go to the bank, shoot the cameras and put everyone on gun point, since this is your first time I'ma give you the more skillfull job, you're gonna go inside and look for the safety deposit box 0406, get it but do not set off the dye packs or we're screwed, then we run before the cops show up, 5 minutes in and out, Jay has used the budget to improve the system so now we have a 80% chance of getting it done compared to the 50% before, you can always buy more equipment to make this easier but it's gonna cost you alot of money"`)
                        .setColor(colours.SUCCESSGREEN)

                    await interaction.editReply({
                        embeds: [FirstDialouge],
                        components: [SkipDialogue]
                    })
                }

            } else if (i.customId === '1500') {

                Multi = 90

                if (CurrentMulti >= 90) {
                    const AlreadyHigher = new MessageEmbed()
                        .setTitle("I can't do that")
                        .setDescription(`GBF Cash isn't something that you should waste... Unless it's in the casino then feel free`)
                        .setColor(colours.ERRORRED)
                        .setFooter({   text: `Heist will continue as normal, please choose another payment option or click "No payment"`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    Multi = CurrentMulti

                    await interaction.editReply({
                        embeds: [AlreadyHigher]
                    })
                } else {

                    if (UserBal < 1550) {
                        const FundsERR = new MessageEmbed()
                            .setTitle(titles.ERROR)
                            .setColor(colours.ERRORRED)
                            .setDescription(`You don't have sufficient funds to start this heist, you need **₲1500** and you have to be level **0**`)
                            .setTimestamp()

                        return interaction.editReply({
                            embeds: [FundsERR]
                        })
                    }

                    await heistDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        MojaveJobHacker: Multi
                    })

                    await accountDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        walletBal: Number(accountDocs.walletBal) - 1550
                    })

                    const FirstDialouge = new MessageEmbed()
                        .setDescription(`**David:** "Okay tough shot, Jay has setup a plan for us, really detailed he's our guy, we're gonna go to the bank, shoot the cameras and put everyone on gun point, since this is your first time I'ma give you the more skillfull job, you're gonna go inside and look for the safety deposit box 0406, get it but do not set off the dye packs or we're screwed, then we run before the cops show up, 5 minutes in and out, Jay has used the budget to improve the system so now we have a 90% chance of getting it done compared to the 50% before, you can always buy more equipment to make this easier but it's gonna cost you alot of money"`)
                        .setColor(colours.SUCCESSGREEN)

                    await interaction.editReply({
                        embeds: [FirstDialouge],
                        components: [SkipDialogue]
                    })

                }

            } else if (i.customId === '2000') {

                Multi = 99

                if (CurrentMulti >= 99) {
                    const AlreadyHigher = new MessageEmbed()
                        .setTitle("I can't do that")
                        .setDescription(`GBF Cash isn't something that you should waste... Unless it's in the casino then feel free`)
                        .setColor(colours.ERRORRED)
                        .setFooter({
                            text: `Heist will continue as normal, please choose another payment option or click "No payment"`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    Multi = CurrentMulti

                    await interaction.editReply({
                        embeds: [AlreadyHigher]
                    })
                } else {

                    if (UserBal < 2050) {
                        const FundsERR = new MessageEmbed()
                            .setTitle(titles.ERROR)
                            .setColor(colours.ERRORRED)
                            .setDescription(`You don't have sufficient funds to start this heist, you need **₲2000** and you have to be level **0**`)
                            .setTimestamp()

                        return interaction.editReply({
                            embeds: [FundsERR]
                        })
                    }

                    await heistDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        MojaveJobHacker: Multi
                    })

                    await accountDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        walletBal: Number(accountDocs.walletBal) - 2050
                    })

                    const FirstDialouge = new MessageEmbed()
                        .setDescription(`**David:** "Okay tough shot, Jay has setup a plan for us, really detailed he's our guy, we're gonna go to the bank, shoot the cameras and put everyone on gun point, since this is your first time I'ma give you the more skillfull job, you're gonna go inside and look for the safety deposit box 0406, get it but do not set off the dye packs or we're screwed, then we run before the cops show up, 5 minutes in and out, Jay has used the budget to improve the system so now we have a 99% chance of getting it done compared to the 50% before, you can always buy more equipment to make this easier but it's gonna cost you alot of money"`)
                        .setColor(colours.SUCCESSGREEN)

                    await interaction.editReply({
                        embeds: [FirstDialouge],
                        components: [SkipDialogue]
                    })

                }
            } else if (i.customId === 'current') {

                const HeistProgress = Number(heistDocs.MojaveJobHacker)

                if (!HeistProgress || HeistProgress < 75) {
                    const FirstTime = new MessageEmbed()
                        .setTitle("You can't use that")
                        .setDescription(`This is your first time playing this heist, you are required to choose a payment option\nEg. **₲250**`)
                        .setColor(colours.ERRORRED)

                    const MainMenuB = new MessageButton()
                        .setCustomId('Menu')
                        .setStyle("SECONDARY")
                        .setLabel("Go back to the main menu")
                    const MenuRow = new MessageActionRow().addComponents([MainMenuB])

                    await interaction.editReply({
                        embeds: [FirstTime],
                        components: [MenuRow]
                    })

                } else {

                    const FirstDialouge = new MessageEmbed()
                        .setDescription(`**David:** "Okay tough shot, Jay has setup a plan for us, really detailed he's our guy, we're gonna go to the bank, shoot the cameras and put everyone on gun point, since this is your first time I'ma give you the more skillfull job, you're gonna go inside and look for the safety deposit box 0406, get it but do not set off the dye packs or we're screwed, then we run before the cops show up, 5 minutes in and out, Jay has used the budget to improve the system so now we have a ${CurrentMulti}% chance of getting it done, it's at its max, thanks for funding it big guy"`)
                        .setColor(colours.SUCCESSGREEN)

                    await accountDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        walletBal: Number(accountDocs.walletBal) - 50
                    })

                    Multi = CurrentMulti

                    await interaction.editReply({
                        embeds: [FirstDialouge],
                        components: [SkipDialogue]
                    })
                }

            } else if (i.customId === 'Menu') {
                await interaction.editReply({
                    embeds: [IntroMSG],
                    components: [MoneyRow, CancelRow]
                })
            } else if (i.customId === 'Continue/Skip dialogue') {

                const EmbedTwo = new MessageEmbed()
                    .setColor(colours.SUCCESSGREEN)
                    .setDescription(`Enter the **Great Mojave bank** with David 🏦`)

                const RowTwo = new MessageActionRow()
                    .addComponents(new MessageButton()
                        .setCustomId('Enter')
                        .setLabel('Enter the bank')
                        .setStyle('SECONDARY')
                        .setEmoji('🏦'),
                    );

                await interaction.editReply({
                    embeds: [EmbedTwo],
                    components: [RowTwo]
                })

            } else if (i.customId === 'Enter') {

                const EmbedThree = new MessageEmbed()
                    .setDescription(`**David:** "Quick grab the cash before the cops show up! It's over there on the counter just don't set off the dye packs or we're screwed, quick hurry! we don't got much time!\nI'll take care of the civilians and cameras!"`)
                    .setColor(colours.SUCCESSGREEN)

                let x
                let y

                let Random = Math.floor(Math.random() * 100);

                if (Random <= Multi) {
                    x = 'normal'
                    y = 'dye'
                } else {
                    x = 'dye'
                    y = 'normal'
                }

                const ChoiceOne = new MessageButton()
                    .setCustomId(x)
                    .setLabel(`Money Bag One`)
                    .setStyle("SUCCESS")
                    .setEmoji("💰")
                const ChoiceTwo = new MessageButton()
                    .setCustomId(y)
                    .setLabel(`Money Bag Two`)
                    .setStyle("SUCCESS")
                    .setEmoji("💰")
                const RowThree = new MessageActionRow().addComponents([ChoiceOne, ChoiceTwo])

                await interaction.editReply({
                    embeds: [EmbedThree],
                    components: [RowThree]
                })

            } else if (i.customId === 'normal') {

                let text

                if (Multi <= 90) {
                    text = `If you had gotten a better package Jay could've helped us get the code but now we gotta guess, f*cking hell`
                } else {
                    text = `Good thing you got that upgrade, I can easily give you the code now, Here it is be quick!"\nCode: **3${FinalANS}**`
                }

                const Success = new MessageEmbed()
                    .setDescription(`**David:** "That's the one! Good job kid, now lets get the f.ck out of here"\n**Employee presses on the emergency lock button**\n**David:** "So you wanna play hero dipshit? This will BE YOUR LAST F.CKING MOVE, GREAT ${interaction.user.username} GO HACK THE KEYPAD QUICK YOU CAN'T MESS THIS UP OR WE'RE F.CKED\n${text}`)
                    .setColor(colours.SUCCESSGREEN)

                const RowFour = new MessageActionRow()
                    .addComponents(new MessageButton()
                        .setCustomId('Leave')
                        .setLabel('Hack the keypad')
                        .setStyle('SECONDARY')
                        .setEmoji('🔐'),
                    );

                await interaction.editReply({
                    embeds: [Success],
                    components: [RowFour]
                })

            } else if (i.customId === 'dye') {

                const Failed = new MessageEmbed()
                    .setTitle("Heist Failed")
                    .setDescription(`Dye pack was set off 💥`)
                    .setColor(colours.ERRORRED)
                    .setFooter({
                        text: "You can retry by using /the-mojave-job",
                        iconURL: interaction.user.displayAvatarURL()
                    })

                return interaction.editReply({
                    embeds: [Failed],
                    components: []
                })

            } else if (i.customId === 'Leave') {

                const MathQuestion = new MessageEmbed()
                    .setTitle('Hack the keypad 🔐')
                    .setDescription(`**Enter the security code:**\n\n3_\n`)
                    .setFooter({
                        text: `Do not enter the same number twice`
                    })
                    .setColor(colours.ERRORRED)

                const One = new MessageButton()
                    .setCustomId('1')
                    .setLabel('1')
                    .setStyle('SECONDARY')
                const Two = new MessageButton()
                    .setCustomId('2')
                    .setLabel('2')
                    .setStyle('SECONDARY')
                const Three = new MessageButton()
                    .setCustomId('3')
                    .setLabel('3')
                    .setStyle('SECONDARY')
                const Four = new MessageButton()
                    .setCustomId('4')
                    .setLabel('4')
                    .setStyle('SECONDARY')

                const Numbers = new MessageActionRow().addComponents([One, Two, Three, Four])

                await interaction.editReply({
                    embeds: [MathQuestion],
                    components: [Numbers]
                })
            } else if (i.customId === '1') {

                if (FinalANS === '1') {

                    let s
                    if (CurrentMulti < 99 || Multi < 99) {
                        s = 'you can also upgrade the equipment we use next time, it will help us alot, but will also cost you a pretty penny'
                    } else {
                        s = 'well kid, you\'ve already purchased the highest upgrade, we can hit it again and you won\'t need to pay that 2 grand again, good job kid'
                    }

                    const CompleteHeist = new MessageEmbed()
                        .setDescription(`**David:** "F*ckin ayh! We did it! Good job kid, you still got more to do in this shit of a city, I'll set you up with a friend of mine, good luck kid\nOfcourse if you want to hit this place again we can do it again but wait a bit let it cool down, ${s}"`)
                        .setColor(colours.SUCCESSGREEN)

                    await interaction.editReply({
                        embeds: [CompleteHeist],
                        components: []
                    })

                    const Done = new MessageEmbed()
                        .setTitle('Heist completed')
                        .setColor(colours.SUCCESSGREEN)
                        .setDescription(`**Heist complete**\nDifficulty: **Easy**\n\nPay-Out: **+₲15000 +150 RP +5 Respect**\nUnlocked:\n **Setup One**\n**Jobs**`)

                    if (UserStoryProgress < 2) {
                        await storyDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            storyProgress: 2,
                            Respect: Number(storyDocs.Respect ?? 0) + 5
                        })

                    } else {
                        await storyDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            Respect: Number(storyDocs.Respect ?? 0) + 5
                        })
                    }

                    if (UserHeistProgress < 10) {
                        await storyDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            heistProgress: 10,
                            Respect: Number(storyDocs.Respect ?? 0) + 5
                        })
                    } else {
                        await storyDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            Respect: Number(storyDocs.Respect ?? 0) + 5
                        })
                    }

                    await accountDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        bankBal: Number(accountDocs.bankBal) + 15000,
                        RP: Number(accountDocs.RP) + 150
                    })

                    await heistDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        MojaveComplete: 'Yes'
                    })

                    await heistDocs.updateOne({
                        HeistPlays: Number(UserHeistPlays + 1)
                    })

                    if (Number(Number(accountDocs.RP) + 150) >= RPForNextLVL) {
                        const RankedUp = new MessageEmbed()
                            .setTitle("Ranked up")
                            .setDescription(`Rank: ${Number(accountDocs.Rank) + 1}\nRP required for level ${Number(accountDocs.Rank) + 2}: **${NeededRP(accountDocs.Rank + 2)}**`)
                            .setColor(colours.SUCCESSGREEN)

                        await interaction.channel.send({
                            embeds: [RankedUp]
                        })


                        await accountDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            bankBal: Number(accountDocs.bankBal) + 15000,
                            RP: 0,
                            Rank: Number(accountDocs.Rank) + 1
                        })

                    }

                    return interaction.channel.send({
                        embeds: [Done],
                        components: []
                    })
                } else {

                    const Failed = new MessageEmbed()
                        .setTitle("Heist Failed")
                        .setDescription(`Failed to unlock the door before the cops came`)
                        .setColor(colours.ERRORRED)

                    await storyDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        Respect: Number(storyDocs.Respect ?? 0) - 5
                    })

                    return interaction.editReply({
                        embeds: [Failed],
                        components: []
                    })

                }
            } else if (i.customId === '2') {

                if (FinalANS === '2') {

                    let s
                    if (CurrentMulti < 99 || Multi < 99) {
                        s = 'you can also upgrade the equipment we use next time, it will help us alot, but will also cost you a pretty penny'
                    } else {
                        s = 'well kid, you\'ve already purchased the highest upgrade, we can hit it again and you won\'t need to pay that 2 grand again, good job kid'
                    }

                    const CompleteHeist = new MessageEmbed()
                        .setDescription(`**David:** "F*ckin ayh! We did it! Good job kid, you still got more to do in this shit of a city, I'll set you up with a friend of mine, good luck kid\nOfcourse if you want to hit this place again we can do it again but wait a bit let it cool down, ${s}"`)
                        .setColor(colours.SUCCESSGREEN)

                    await interaction.editReply({
                        embeds: [CompleteHeist],
                        components: []
                    })

                    const Done = new MessageEmbed()
                        .setTitle('Heist completed')
                        .setColor(colours.SUCCESSGREEN)
                        .setDescription(`**Heist complete**\nDifficulty: **Easy**\n\nPay-Out: **+₲15000 +150 RP +5 Respect**\nUnlocked:\n **Setup One**\n**Jobs**`)

                    if (UserStoryProgress < 2) {
                        await storyDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            storyProgress: 2,
                            Respect: Number(storyDocs.Respect ?? 0) + 5
                        })
                    } else {
                        await storyDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            Respect: Number(storyDocs.Respect ?? 0) + 5
                        })
                    }

                    if (UserHeistProgress < 10) {
                        await storyDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            heistProgress: 10,
                            Respect: Number(storyDocs.Respect ?? 0) + 5
                        })
                    } else {
                        await storyDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            Respect: Number(storyDocs.Respect ?? 0) + 5
                        })
                    }

                    await accountDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        bankBal: Number(accountDocs.bankBal) + 15000,
                        RP: Number(accountDocs.RP) + 150
                    })

                    await heistDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        MojaveComplete: 'Yes'
                    })

                    await heistDocs.updateOne({
                        HeistPlays: Number(UserHeistPlays + 1)
                    })

                    if (Number(Number(accountDocs.RP) + 150) >= RPForNextLVL) {
                        const RankedUp = new MessageEmbed()
                            .setTitle("Ranked up")
                            .setDescription(`Rank: ${Number(accountDocs.Rank) + 1}\nRP required for level ${Number(accountDocs.Rank) + 2}: **${NeededRP(accountDocs.Rank + 2)}**`)
                            .setColor(colours.SUCCESSGREEN)

                        await interaction.channel.send({
                            embeds: [RankedUp]
                        })


                        await accountDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            bankBal: Number(accountDocs.bankBal) + 15000,
                            RP: 0,
                            Rank: Number(accountDocs.Rank) + 1
                        })

                    }

                    return interaction.channel.send({
                        embeds: [Done],
                        components: []
                    })
                } else {

                    const Failed = new MessageEmbed()
                        .setTitle("Heist Failed")
                        .setDescription(`Failed to unlock the door before the cops came`)
                        .setColor(colours.ERRORRED)

                    await storyDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        Respect: Number(storyDocs.Respect ?? 0) - 5
                    })

                    return interaction.editReply({
                        embeds: [Failed],
                        components: []
                    })

                }
            } else if (i.customId === '3') {

                const DumbMove = new MessageEmbed()
                    .setDescription(`**David:** "Wow dipshit can't you read?! IT SAYS DO NOT ENTER THE SAME NUMBER AGAIN AND THAT'S EXACTLY WHAT YOU DID WHO TOLD ME TO TAKE THIS DUMBASS WITH ME, SHIT"`)
                    .setColor(colours.ERRORRED)

                const Failed = new MessageEmbed()
                    .setTitle("Heist Failed")
                    .setDescription(`Failed to unlock the door before the cops came`)
                    .setColor(colours.ERRORRED)

                await interaction.channel.send({
                    embeds: [DumbMove]
                })

                await storyDocs.updateOne({
                    userId: interaction.user.id,
                    userName: interaction.user.tag,
                    userNameNoTag: interaction.user.username,
                    Respect: Number(storyDocs.Respect ?? 0) - 5
                })

                return interaction.editReply({
                    embeds: [Failed],
                    components: []
                })

            } else if (i.customId === '4') {

                if (FinalANS === '4') {

                    let s
                    if (CurrentMulti < 99 || Multi < 99) {
                        s = 'you can also upgrade the equipment we use next time, it will help us alot, but will also cost you a pretty penny'
                    } else {
                        s = 'well kid, you\'ve already purchased the highest upgrade, we can hit it again and you won\'t need to pay that 2 grand again, good job kid'
                    }

                    const CompleteHeist = new MessageEmbed()
                        .setDescription(`**David:** "F*ckin ayh! We did it! Good job kid, you still got more to do in this shit of a city, I'll set you up with a friend of mine, good luck kid\nOfcourse if you want to hit this place again we can do it again but wait a bit let it cool down, ${s}"`)
                        .setColor(colours.SUCCESSGREEN)

                    await interaction.editReply({
                        embeds: [CompleteHeist],
                        components: []
                    })

                    const Done = new MessageEmbed()
                        .setTitle('Heist completed')
                        .setColor(colours.SUCCESSGREEN)
                        .setDescription(`**Heist complete**\nDifficulty: **Easy**\n\nPay-Out: **+₲15000 +150 RP +5 Respect**\nUnlocked:\n **Setup One**\n**Jobs**`)

                    if (UserStoryProgress < 2) {
                        await storyDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            storyProgress: 2,
                            Respect: Number(storyDocs.Respect ?? 0) + 5
                        })
                    } else {
                        await storyDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            Respect: Number(storyDocs.Respect ?? 0) + 5
                        })
                    }

                    if (UserHeistProgress < 10) {
                        await storyDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            heistProgress: 10,
                            Respect: Number(storyDocs.Respect ?? 0) + 5
                        })
                    } else {
                        await storyDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            Respect: Number(storyDocs.Respect ?? 0) + 5
                        })
                    }

                    await accountDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        bankBal: Number(accountDocs.bankBal) + 15000,
                        RP: Number(accountDocs.RP) + 150
                    })

                    await heistDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        MojaveComplete: 'Yes'
                    })

                    await heistDocs.updateOne({
                        HeistPlays: Number(UserHeistPlays + 1)
                    })

                    if (Number(Number(accountDocs.RP) + 150) >= RPForNextLVL) {
                        const RankedUp = new MessageEmbed()
                            .setTitle("Ranked up")
                            .setDescription(`Rank: ${Number(accountDocs.Rank) + 1}\nRP required for level ${Number(accountDocs.Rank) + 2}: **${NeededRP(accountDocs.Rank + 2)}**`)
                            .setColor(colours.SUCCESSGREEN)

                        await interaction.channel.send({
                            embeds: [RankedUp]
                        })


                        await accountDocs.updateOne({
                            userId: interaction.user.id,
                            userName: interaction.user.tag,
                            userNameNoTag: interaction.user.username,
                            bankBal: Number(accountDocs.bankBal) + 15000,
                            RP: 0,
                            Rank: Number(accountDocs.Rank) + 1
                        })

                    }

                    return interaction.channel.send({
                        embeds: [Done],
                        components: []
                    })
                } else {

                    const Failed = new MessageEmbed()
                        .setTitle("Heist Failed")
                        .setDescription(`Failed to unlock the door before the cops came`)
                        .setColor(colours.ERRORRED)

                    await storyDocs.updateOne({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        Respect: Number(storyDocs.Respect ?? 0) - 5
                    })

                    return interaction.editReply({
                        embeds: [Failed],
                        components: []
                    })

                }

            }

        })
    }
}