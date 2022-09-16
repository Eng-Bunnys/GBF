const SlashCommand = require('../../../utils/slashCommands');

const {
    MessageEmbed,
    MessageActionRow,
    MessageButton
} = require('discord.js')

const titles = require('../../../gbfembedmessages.json')
const emojis = require('../../../GBFEmojis.json')
const colours = require('../../../GBFColor.json');
const MoneySchema = require('../../../schemas/SueLuz-Account-Info-Schema');
const StoryProgressSchema = require('../../../schemas/SueLuz-Story-Progress-Schema');
const HeistProgressSchema = require('../../../schemas/SueLuz-Heist-Info-Schema');
const UserCollectionSchema = require('../../../schemas/SueLuz-Collection-Schema');
const UserCasinoSchema = require('../../../schemas/SueLuz-Casino-Stats');

const {
    delay
} = require("../../../utils/engine");

module.exports = class IntroductionSueLuz extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "intro",
            category: "Games",
            description: "Welcome to SueLuz, the city of saints and sinners",
            usage: "/intro",
            examples: "/intro",

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

        let userProfile = await StoryProgressSchema.findOne({
            userId: interaction.user.id
        }).catch(err => console.log(err))

        const AlreadyComplete = new MessageEmbed()
            .setTitle("You can't use this")
            .setDescription(`You've already completed this non-replayable mission`)
            .setColor(colours.ERRORRED)
            .setFooter({
                text: `GBF Games`,
                iconURL: interaction.user.displayAvatarURL()
            })

        let x

        if (userProfile) {

            if (userProfile.introComplete === 'Yes') {
                x = '1'
            } else {
                x = '2'
            }

            if (x === '1') {
                return interaction.reply({
                    embeds: [AlreadyComplete]
                })
            }
        }
        if (!userProfile || x === '2') {

            const IntroMessage = new MessageEmbed()
                .setTitle(`Welcome to SueLuz || Welcome to the land where we be doing the most for nothing`)
                .setColor(colours.DEFAULT)
                .addFields({
                    name: `Welcome to SueLuz ${interaction.user.username}, don't get fooled by the palm trees, it's real over here on these cold streets`,
                    value: `\n\n**SueLuz** is a city full of dreams, a place where people come to hoping to make it big like the famous actors and musicians who sold their soul to make it big, the goal here is to make it big, only the top dogs survive in this fast and big place, so keep yourself alive.`
                }, {
                    name: "\u200b",
                    value: `To reach the top you need alot of **GBF Cash** and **RP**, those can be earned through **missions, mini-games or test your knowledge** and get rewarded depending on your performance.\nUse that money to buy **tools** to help you complete missions more, unlock new areas and much more.`
                }, {
                    name: "\u200b",
                    value: `The leaderboard shows the **top dogs, the masterminds,** top 10 get big rewards but having your name on that list puts you at great risk, remember, only the strongest survive in this large city that's full of scumbags and corruption.`
                }, {
                    name: "\u200b",
                    value: `Good luck ${interaction.user.username}, Choose which path you want to take, this **cannot** be changed and it will affect how your story is`
                })
                .setFooter({
                    text: `SueLuz || The city of saints and sinners`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()

            const Criminal = new MessageButton()
                .setCustomId('Crime')
                .setLabel('Criminal 🔫')
                .setStyle("SECONDARY")
            const Citizen = new MessageButton()
                .setCustomId('Normal')
                .setLabel('Citizen 👨‍✈️')
                .setStyle("SECONDARY")
            const Hybrid = new MessageButton()
                .setCustomId("Hybrid")
                .setLabel("Hybrid 👨‍👩‍👧")
                .setStyle("SECONDARY")
            const Cancel = new MessageButton()
                .setCustomId('Cancel')
                .setLabel('Cancel')
                .setStyle('DANGER')

            const MainRow = new MessageActionRow().addComponents([Criminal, Citizen, Hybrid, Cancel])

            await interaction.reply({
                embeds: [IntroMessage],
                components: [MainRow]
            })

            await interaction.followUp({
                content: `Warning: After 30 seconds of inactivity the menu closes, you will get a "Interaction failed" message`,
                ephemeral: true
            })

            const filter = i => {
                return i.user.id === interaction.user.id;
            };

            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                idle: 30000,
                time: 150000
            });

            collector.on('collect', async i => {
                await i.deferUpdate();
                await delay(750);

                if (i.customId === 'Cancel') {

                    const Failed = new MessageEmbed()
                        .setTitle("Mission Failed")
                        .setDescription(`${interaction.user.username} quit`)
                        .setColor(colours.ERRORRED)
                        .setFooter({
                            text: `You can re-run the mission and give it another go`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    return interaction.editReply({
                        embeds: [Failed],
                        components: []
                    })
                }

                if (i.customId === 'Crime') {

                    const ConfirmCrime = new MessageButton()
                        .setCustomId("confirmC")
                        .setEmoji(emojis.VERIFY)
                        .setStyle("SUCCESS")
                    const DenyCrime = new MessageButton()
                        .setCustomId("denyC")
                        .setEmoji(emojis.ERROR)
                        .setStyle("DANGER")

                    const ConfirmOrDenyC = new MessageActionRow().addComponents([ConfirmCrime, DenyCrime])

                    const CrimeIntro = new MessageEmbed()
                        .setTitle("Criminal")
                        .setDescription(`The sprawling city of SueLuz isn't the easiest place to live in, it's the city of dreams, home to all of stars, sunlight, heat and scumbags.\nEveryone comes here with hopes of making it big but either turn into moronic hipsters or deranged killers, the rest end up dying because of how bad the pollution is.\nOne way to make it big in this shit-hole of a city is to be a deranged killer who robs people for a living, or maybe for fun.\nAre you sure that you want to continue with this path?`)
                        .setColor(colours.SUCCESSGREEN)
                        .setFooter({
                            text: `The Green Button will confirm, red button will go back to the main menu`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    await interaction.editReply({
                        embeds: [CrimeIntro],
                        components: [ConfirmOrDenyC]
                    })

                } else if (i.customId === 'confirmC') {

                    const ConfirmedC = new MessageEmbed()
                        .setTitle("Be careful: Easily friends turn into enemies")
                        .setDescription(`**David Jakowski:** "Welcome to the crew kid, we're all outcast rebels who got struck by the harsh reality, the only way to make serious cash and make it big is crime in this shit hole, but many have lost their lives trying to make it big, so be careful kid.\nI'll help you with your startup then you'll have to continue on your own, here's **₲500** this will help you get started, give me a call and we will get started, other than that enjoy your stay here."`)
                        .setColor(colours.DEFAULT)
                        .setFooter({
                            text: `Welcome to SueLuz, to start your first mission use /heist-s`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    let newBankAccount = new MoneySchema({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        walletBal: 500,
                        bankBal: 0,
                        netWorth: 500,
                        RP: 50,
                        Rank: 1
                    });

                    await newBankAccount.save().catch(e => {
                        console.error("Error:", e)
                    })

                    let newProfileAccount = new StoryProgressSchema({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        introComplete: 'Yes',
                        storyChoice: 'Crime',
                        storyProgress: 0,
                        heistProgress: 0,
                        normalProgress: 0,
                        hybridProgess: 0,
                        Respect: 0
                    });

                    await newProfileAccount.save().catch(e => {
                        console.error("Error:", e)
                    })

                    await newBankAccount.save().catch(e => {
                        console.error("Error:", e)
                    })

                    let newHeistProfile = new HeistProgressSchema({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        ActiveHeist: 'None',
                    });

                    await newHeistProfile.save().catch(e => {
                        console.error("Error:", e)
                    })

                    let newCollectionProfile = new UserCollectionSchema({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                    });

                    await newCollectionProfile.save().catch(e => {
                        console.error("Error:", e)
                    })

                    let newCasinoSchema = new UserCasinoSchema({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                    });

                    await newCasinoSchema.save().catch(e => {
                        console.error("Error:", e)
                    })

                    const MissionComplete = new MessageEmbed()
                        .setTitle("Mission complete")
                        .setColor(colours.SUCCESSGREEN)
                        .setDescription(`**Introduction complete || Criminal Path**\n**${interaction.user.username}** - 100% 🥇\n**Rewards:** **+₲500 +50RP**`)
                        .setFooter({
                            text: `RP required to reach level 1: 150`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    await interaction.followUp({
                        embeds: [MissionComplete]
                    })

                    const AccountCreated = new MessageEmbed()
                        .setTitle("GBF Banking account created")
                        .setColor(colours.DEFAULT)
                        .setDescription(`**Account name:** ${interaction.user.tag}\n**Account ID:** ${interaction.user.id}\n\nYou've unlocked new features:\n-Balance\n-Give\n-Profile\n-Transfer`)
                        .setFooter({
                            text: `Welcome to SueLuz, We hope you have a terrible time here`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    await interaction.channel.send({
                        embeds: [AccountCreated]
                    })

                    return interaction.editReply({
                        embeds: [ConfirmedC],
                        components: []

                    })

                } else if (i.customId === 'denyC') {
                    await interaction.editReply({
                        embeds: [IntroMessage],
                        components: [MainRow]
                    })
                } else if (i.customId === 'Normal') {

                    const ConfirmNorm = new MessageButton()
                        .setCustomId("confirmNorm")
                        .setEmoji(emojis.VERIFY)
                        .setStyle("SUCCESS")
                    const DenyNorm = new MessageButton()
                        .setCustomId("denyNorm")
                        .setEmoji(emojis.ERROR)
                        .setStyle("DANGER")

                    const ConfirmOrDenyN = new MessageActionRow().addComponents([ConfirmNorm, DenyNorm])

                    const NormalIntro = new MessageEmbed()
                        .setTitle("Normal")
                        .setDescription(`SueLuz is a city of saints, but also a city of sinners, full of hipsters wearing skinny jeans and sipping on their 4th sugar free latte in the middle of the summer heat while riding their red mini-peyote, full of morons who think that the only way to get big is to rob and kill but end up getting shot in the chest after their first "big bank job".\nIt's a shit hole of a city, but in the long run, you can make money legit, work in companies then buy your own and grow an empire, or die trying...\nAre you sure that you want to continue with this path?`)
                        .setColor(colours.DEFAULT)
                        .setFooter({
                            text: `The Green Button will confirm, red button will go back to the main menu`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    await interaction.editReply({
                        embeds: [NormalIntro],
                        components: [ConfirmOrDenyN]
                    })

                } else if (i.customId === 'confirmNorm') {

                    const ConfirmedC = new MessageEmbed()
                        .setTitle("In a hall walking to the bright light, dying inside.")
                        .setDescription(`**Amanda Johnson:** "How was that plane ride ${interaction.user.username}? Anyways, welcome to SueLuz, I like to call it SL, this is a big and scary city but I'm with you, here to guide you through everything, here's **₲250**, this will help you get you started, I also hooked you up with a little job until you can stand on your own two feet, btw you can crash at my place until you get your own, let's get back home I'll show you the city"`)
                        .setColor(colours.DEFAULT)
                        .setFooter({
                            text: `Welcome to SueLuz, to start your first mission use /garden-e`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    let newBankAccount = new MoneySchema({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        walletBal: 250,
                        bankBal: 0,
                        netWorth: 250,
                        RP: 50,
                        Rank: 1
                    });

                    await newBankAccount.save().catch(e => {
                        console.error("Error:", e)
                    })

                    let newProfileAccount = new StoryProgressSchema({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        introComplete: 'Yes',
                        storyChoice: 'Normal',
                        storyProgress: 0,
                        heistProgress: 0,
                        normalProgress: 0,
                        hybridProgess: 0,
                        Respect: 5
                    });

                    await newProfileAccount.save().catch(e => {
                        console.error("Error:", e)
                    })


                    let newCollectionProfile = new UserCollectionSchema({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                    });

                    await newCollectionProfile.save().catch(e => {
                        console.error("Error:", e)
                    })

                    let newCasinoSchema = new UserCasinoSchema({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                    });

                    await newCasinoSchema.save().catch(e => {
                        console.error("Error:", e)
                    })

                    const MissionComplete = new MessageEmbed()
                        .setTitle("Mission complete")
                        .setColor(colours.SUCCESSGREEN)
                        .setDescription(`**Introduction complete || Normal Path**\n**${interaction.user.username}** - 100% 🥇\n**Rewards:** **+₲250 +50RP +5 Respect**`)
                        .setFooter({
                            text: `RP required to reach level 1: 150`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    await interaction.followUp({
                        embeds: [MissionComplete]
                    })

                    const AccountCreated = new MessageEmbed()
                        .setTitle("GBF Banking account created")
                        .setColor(colours.DEFAULT)
                        .setDescription(`**Account name:** ${interaction.user.tag}\n**Account ID:** ${interaction.user.id}\n\nYou've unlocked new features:\n-Balance\n-Give\n-Profile\n-Transfer`)
                        .setFooter({
                            text: `Welcome to SueLuz, We hope you have a terrible time here`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    await interaction.channel.send({
                        embeds: [AccountCreated]
                    })


                    return interaction.editReply({
                        embeds: [ConfirmedC],
                        components: []

                    })

                } else if (i.customId === 'denyNorm') {
                    await interaction.editReply({
                        embeds: [IntroMessage],
                        components: [MainRow]
                    })

                } else if (i.customId === 'Hybrid') {

                    const ConfirmHybrid = new MessageButton()
                        .setCustomId("confirmH")
                        .setEmoji(emojis.VERIFY)
                        .setStyle("SUCCESS")
                    const DenyHybrid = new MessageButton()
                        .setCustomId("denyH")
                        .setEmoji(emojis.ERROR)
                        .setStyle("DANGER")

                    const ConfirmOrDenyH = new MessageActionRow().addComponents([ConfirmHybrid, DenyHybrid])

                    const HybridIntro = new MessageEmbed()
                        .setTitle("Hybrid")
                        .setDescription(`SueLuz is a very interesting place, so many different types of people, you have hobos who came here with hopes that just got crushed, criminals who either end up dead, serving life or extremely rich and powerful, then you have the rest of us, average people, weird hipsters, people who believe in superfical cults and so many more people, the more you venture in SL the more you meet new people!\nIt's a harsh place, the coldest streets lye here, so be careful, people can make a living off selling dope or working a normal 9-5, you're not sure about which path to choose so you go with the flow and what comes comes\nAre you sure that you want to continue with this path?`)
                        .setColor(colours.Cyan)
                        .setFooter({
                            text: `The Green Button will confirm, red button will go back to the main menu`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    await interaction.editReply({
                        embeds: [HybridIntro],
                        components: [ConfirmOrDenyH]
                    })

                } else if (i.customId === 'confirmH') {

                    const ConfirmedC = new MessageEmbed()
                        .setTitle("This city has so many people but it got no soul")
                        .setDescription(`**Joel Richards:** "Welcome to the city where the sun shines the brightest, this place is what I've always dreamt of living in as a child and here I am haha, I love this place, full of energy and love, you'll love it here!\nSo you don't know what you want to do here, I was just like you when my plane landed here *sigh*, but I gotchu I hooked you up with a job at a place that a good friend of mine owns, you'll love it!\nMan I love this place but it turned me into this sorrow f*ck who has rich people problems like "Is my wife sleeping with the tennis coach?" haha I love you man good luck out there, here's **₲1000** to get you started, give me a call when you're ready, but other than, enjoy your stay here!"`)
                        .setColor(colours.DEFAULT)
                        .setFooter({
                            text: `Welcome to SueLuz, to start your first mission use /office-e`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    let newBankAccount = new MoneySchema({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        walletBal: 250,
                        bankBal: 750,
                        netWorth: 1000,
                        RP: 50,
                        Rank: 1
                    });

                    await newBankAccount.save().catch(e => {
                        console.error("Error:", e)
                    })

                    let newProfileAccount = new StoryProgressSchema({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                        introComplete: 'Yes',
                        storyChoice: 'Hybrid',
                        storyProgress: 0,
                        heistProgress: 0,
                        normalProgress: 0,
                        hybridProgess: 0,
                        Respect: 5
                    });

                    await newProfileAccount.save().catch(e => {
                        console.error("Error:", e)
                    })

                    let newCollectionProfile = new UserCollectionSchema({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                    });

                    await newCollectionProfile.save().catch(e => {
                        console.error("Error:", e)
                    })

                    let newCasinoSchema = new UserCasinoSchema({
                        userId: interaction.user.id,
                        userName: interaction.user.tag,
                        userNameNoTag: interaction.user.username,
                    });

                    await newCasinoSchema.save().catch(e => {
                        console.error("Error:", e)
                    })

                    const MissionComplete = new MessageEmbed()
                        .setTitle("Mission complete")
                        .setColor(colours.SUCCESSGREEN)
                        .setDescription(`**Introduction complete || Hybrid Path**\n**${interaction.user.username}** - 100% 🥇\n**Rewards:** **+₲1000 +50RP +5 Respect*`)
                        .setFooter({
                            text: `RP required to reach level 1: 150`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    await interaction.followUp({
                        embeds: [MissionComplete]
                    })

                    const AccountCreated = new MessageEmbed()
                        .setTitle("GBF Banking account created")
                        .setColor(colours.DEFAULT)
                        .setDescription(`**Account name:** ${interaction.user.tag}\n**Account ID:** ${interaction.user.id}\n\nYou've unlocked new features:\n-Balance\n-Give\n-Profile\n-Transfer`)
                        .setFooter({
                            text: `Welcome to SueLuz, We hope you have a terrible time here`,
                            iconURL: interaction.user.displayAvatarURL()
                        })

                    await interaction.channel.send({
                        embeds: [AccountCreated]
                    })


                    return interaction.editReply({
                        embeds: [ConfirmedC],
                        components: []

                    })

                } else if (i.customId === 'denyH') {
                    await interaction.editReply({
                        embeds: [IntroMessage],
                        components: [MainRow]
                    })


                }
            })

        }

    }
}
