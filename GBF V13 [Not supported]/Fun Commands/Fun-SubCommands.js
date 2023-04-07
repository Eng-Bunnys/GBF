const SlashCommand = require('../../utils/slashCommands');

const {
    MessageEmbed
} = require('discord.js');

const figlet = require('figlet');

const colours = require('../../GBFColor.json');
const emojis = require('../../GBFEmojis.json');
const titles = require('../../gbfembedmessages.json');

const fetch = require('node-fetch');

module.exports = class FunCommands extends SlashCommand {
    constructor(client) {
        super(client, {
            name: "fun",
            description: "Fun and miscallenous commands",
            category: "Fun",
            botPermission: ['SEND_MESSAGES', 'EMBED_LINKS'],
            cooldown: 2,
            development: true,
            subcommands: {
                ['8ball']: {
                    description: "Ask the magic 8ball a question",
                    args: [{
                        name: "question",
                        description: "The question you want to ask the magic 8ball",
                        type: "STRING",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const MessageArgs = interaction.options.getString('question');

                        const answers = ['Yes', 'No', 'Maybe', 'Ask Later', 'No time to tell now', 'As I see it, yes.', 'Cannot predict now.', 'Concentrate and ask again.', 'It is certain.', 'I don\'t know '] // All the responses
                        const response = answers[Math.floor(Math.random() * answers.length)]

                        const answerEmbed = new MessageEmbed()
                            .setTitle("🎱 Magic 8Ball")
                            .setDescription(`**Question »** ${MessageArgs} \n **Answer »** ${response}`)
                            .setColor(colours.DEFAULT)
                            .setFooter({
                                text: `Requested by: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                        return interaction.reply({
                            embeds: [answerEmbed]
                        })
                    }
                },
                ascii: {
                    description: "Change text to ascii",
                    args: [{
                        name: "text",
                        description: "The text that you want to convert to ascii",
                        type: "STRING",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        let msg = interaction.options.getString('text')

                        const NP1ErrorEmbed = new MessageEmbed()
                            .setTitle(`${emojis.ERROR} NP1 Error `)
                            .setDescription(`Please run \`/error np1\` to know more about the error and how to fix it`)
                            .setColor(colours.ERRORRED)
                            .setTimestamp()

                        await interaction.deferReply({
                            ephemeral: true
                        })

                        figlet.text(msg, function (err, data) {
                            if (err) {
                                console.log("Something went wrong");
                                console.dir(err);
                            }
                            if (data.length > 2000) return interaction.reply({
                                content: "Please provide text shorter than 2000 characters",
                                ephemeral: true
                            })

                            return interaction.channel.send({
                                content: '```' + data + '```'
                            }).catch(err => {
                                console.log(`Ascii Command Error: ${err.message}`)
                                return interaction.reply({
                                    embeds: [NP1ErrorEmbed],
                                    ephemeral: true
                                })
                            })
                        })
                    }
                },
                destroy: {
                    description: "Create a message with a timer 👀",
                    args: [{
                        name: "message",
                        description: "The message that you want to create",
                        type: "STRING",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const msg = interaction.options.getString('message');

                        const MessageSent = await interaction.reply({
                            content: msg,
                            allowedMentions: {
                                parse: []
                            },
                            fetchReply: true
                        })

                        setTimeout(() => interaction.editReply({
                            content: "This message is going to blow up any second now! 💣",
                            allowedMentions: false
                        }), 2500);

                        setTimeout(() => interaction.editReply({
                            content: "GET DOWN IT'S GONNA EXPLODE!!",
                            allowedMentions: false
                        }), 5000);

                        setTimeout(() => interaction.editReply({
                            content: "https://tenor.com/view/saussi%C3%A7on-explode-boom-gif-16089684",
                            allowedMentions: false
                        }), 8000);

                        setTimeout(() => MessageSent.delete(), 10000);

                    }
                },
                gayrate: {
                    description: "Gay rate machine",
                    args: [{
                        name: "user",
                        description: "The user that you want to use this machine on",
                        type: "USER",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const member = interaction.options.getUser('user') || interaction.user;

                        const gayEmbed = new MessageEmbed()
                            .setTitle("Gay rate machine 🏳️‍🌈")
                            .setDescription(`${member.username} is **${Math.floor(Math.random() * 100)}%** gay 🏳️‍🌈`)
                            .setColor(colours.DEFAULT)

                        return interaction.reply({
                            embeds: [gayEmbed]
                        })
                    }
                },
                pprate: {
                    description: "Rate a user's pp 😳",
                    args: [{
                        name: "user",
                        description: "The user that you want to... Oh my 😳",
                        type: "USER",
                        required: false
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const mentionedUser = interaction.options.getUser('user') || interaction.user;

                        function random_item(items) {
                            return items[Math.floor(Math.random() * items.length)];
                        }

                        const items = ['=', '==', '===', '====', '=====', '======', '=======', ''];

                        let trueorfalse = random_item(items);

                        const mainembed = new MessageEmbed()
                            .setTitle('PP rating machine')
                            .setColor(colours.DEFAULT)

                        if (trueorfalse === '=') {

                            mainembed.setDescription(`**${mentionedUser.username}'s PP:**\n` + '8' + trueorfalse + 'D' + `\n**${mentionedUser.username} I rate your PP a 1 🤢🤮**\nPut that thing away! 🤢`)

                            let send = await interaction.reply({
                                embeds: [mainembed],
                                fetchReply: true
                            })
                            send.react('1️⃣')
                            send.react('🤮')
                        } else if (trueorfalse === '==') {

                            mainembed.setDescription(`**${mentionedUser.username}'s PP:**\n` + '8' + trueorfalse + 'D' + `\n**${mentionedUser.username} I rate your PP a 2 🤮**\nWhere did you get the confidence to do this ?!🧐🤨😐`)

                            let send = await interaction.reply({
                                embeds: [mainembed],
                                fetchReply: true
                            })
                            send.react('2️⃣')
                            send.react('🥱')
                        } else if (trueorfalse === '===') {

                            mainembed.setDescription(`**${mentionedUser.username}'s PP:**\n` + '8' + trueorfalse + 'D' + `\n**${mentionedUser.username} I rate your PP a 4 👍**\nIts not bad, good for you! You got decent length 😁`)

                            let send = await interaction.reply({
                                embeds: [mainembed],
                                fetchReply: true
                            })
                            send.react('4️⃣')
                            send.react('👍')
                        } else if (trueorfalse === '====') {

                            mainembed.setDescription(`**${mentionedUser.username}'s PP:**\n` + '8' + trueorfalse + 'D' + `\n**${mentionedUser.username} I rate your PP a 6 😄**\nNice cock bro! Average length! Looking good 😊`)

                            let send = await interaction.reply({
                                embeds: [mainembed],
                                fetchReply: true
                            })
                            send.react('6️⃣')
                            send.react('😄')
                        } else if (trueorfalse === '=====') {

                            mainembed.setDescription(`**${mentionedUser.username}'s PP:**\n` + '8' + trueorfalse + 'D' + `\n**${mentionedUser.username} I rate your PP a 8 😋**\nThat's one nice cock bro! Keep it up 🥰`)

                            let send = await interaction.reply({
                                embeds: [mainembed],
                                fetchReply: true
                            })
                            send.react('8️⃣')
                            send.react('😋')
                        } else if (trueorfalse === '======') {

                            mainembed.setDescription(`**${mentionedUser.username}'s PP:**\n` + '8' + trueorfalse + 'D' + `\n**${mentionedUser.username} I rate your PP a 9 🤩**\nI'm jealous how do you even walk with that massive shlong!`)

                            let send = await interaction.reply({
                                embeds: [mainembed],
                                fetchReply: true
                            })
                            send.react('9️⃣')
                            send.react('🤩')

                        } else if (trueorfalse === '=======') {

                            mainembed.setDescription(`**${mentionedUser.username}'s PP:**\n` + '8' + trueorfalse + 'D' + `\n**${mentionedUser.username} I rate your PP a 10 😍**\nThis you?`)
                            mainembed.setImage('https://i.ytimg.com/vi/Ux5cQbO_ybw/maxresdefault.jpg')

                            let send = await interaction.reply({
                                embeds: [mainembed],
                                fetchReply: true
                            })
                            send.react('🔟')
                            send.react('😍')
                            send.react('😋')
                            send.react('💦')
                        } else {

                            mainembed.setDescription(`**${mentionedUser.username}'s PP:**\n` + '8' + trueorfalse + 'D' + `\n**${mentionedUser.username} I rate your PP a 0 😐**\nWTF is this 😶🥱`)

                            let send = await interaction.reply({
                                embeds: [mainembed],
                                fetchReply: true
                            })
                            send.react('0️⃣')
                            send.react('😶')
                        }
                    }
                },
                topic: {
                    description: "Gives a random question",
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        let topicQ = ['What are the top three things on your bucket list?', 'How do you think you will die?', 'If you could ask for a miracle, what would it be?', 'What is the biggest risk you’ve ever taken?', 'What would your ideal life look like?', 'If someone gave you an envelope with your death date inside of it, would you open it?', 'When have you been the most happy?', 'What is your idea of the perfect day?', 'Do you think your priorities have changed since you were younger?', 'What keeps you up at night?', 'What scares you most about your future?', 'What is the most difficult thing you’ve ever done?', 'What does success mean to you?', 'What makes you smile?', 'Is there a dream you’ve always had?', 'What gives you butterflies?', 'What motivates you most in life?', 'What makes you feel discouraged?', 'What’s something not many people know about you?', 'What are you most passionate about?', 'Who do you text the most?', 'What was your favorite thing to do as a kid?', 'What’s your dream job?', 'What is your favorite weekend activity?', 'What makes you most uncomfortable about dating?', 'If you could have dinner with anyone living or not, who would it be?', 'Are you a cat person or a dog person?', 'What is the silliest thing you’ve posted online?', 'What was your worst wardrobe mistake?', 'What is the best restaurant you’ve been to?', 'What is your favorite kitchen smell?', 'When you die, what do you want to be reincarnated as?', 'What is your favorite guilty pleasure TV show?', 'Who would you swap lives with for a day?', 'If you could live anywhere in the world, where would it be?', 'Would you prefer to live in an urban area or a rural area?', 'What is the strangest gift you have ever received?', 'What’s the best compliment you’ve ever received?', 'Would you rather be invisible or have X-ray vision?', 'If you could only save one item from a house fire, what would it be?', `You're house is on fire and you can only save one person do you: save your mom,dad or do you let both of them die?`, 'If you could have picked your own name, what would it be?', 'What time period would you travel to?', 'What is one thing you can’t live without?', 'What is your least favorite chore?', 'Who are you most thankful for and why?', 'What makes you most proud?', 'What makes you the happiest?', 'Who makes you the happiest?', 'If you could be an animal, what would it be and why?', 'If you could be any age, what age would you choose?', 'When is the last time you laughed so hard that you cried?', 'What did you think was the most challenging part of being a kid?', 'If you could be any age, what age would you choose?', 'What are you reading right now?', 'How long can you go without checking your phone?', 'Do you have a morning ritual?', 'What bad habits do you wish you could stop?', 'Are you a jealous person?', 'If someone offered to tell you your future, would you accept it?', 'If you were to remove one social media app from your phone, which would it be and why?', 'If you were on death row, what would your last meal be?', 'If you could sit down with your 13-year old self, what would you say?', 'What makes you really angry?', 'What’s your guilty pleasure?', 'What bores you?', 'If your plane was going down, who would you would call?', 'What would you do if you were home alone and the power went out?', 'What do you do in your free time?', 'What do you wish you had more time for?', 'What is your favorite movie soundtrack?']
                        const response = topicQ[Math.floor(Math.random() * topicQ.length)]

                        const topicEmbed = new MessageEmbed()
                            .setTitle("<:BlueThinking:825400207344140298> Random Topic:")
                            .addFields({
                                name: '━━━━━━━━━',
                                value: (response)
                            })
                            .setColor("#00FFFF")
                            .setFooter({
                                text: `Requested by ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                            .setThumbnail('https://cdn.discordapp.com/attachments/791309678092353536/822294803504562206/speech_ballon.gif')

                        return interaction.reply({
                            embeds: [topicEmbed]
                        })
                    }
                },
                say: {
                    description: "Make me say whatever you want!",
                    args: [{
                        name: "text",
                        description: "The text that you want me to say",
                        type: "STRING",
                        required: true
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {

                        const userMessage = interaction.options.getString("text");

                        await interaction.deferReply({
                            ephemeral: true
                        })

                        const CharacterLimit = new MessageEmbed()
                            .setTitle(`You can't do that`)
                            .setDescription(`Your message is too long, I can only send up to 1024 characters\n\nYour message: ${userMessage.length} characters`)
                            .setColor(colours.ERRORRED)

                        if (userMessage.length > 1024) return interaction.reply({
                            embeds: [CharacterLimit],
                            ephemeral: true
                        })

                        await interaction.channel.send({
                            content: `${userMessage}`,
                            allowedMentions: {
                                parse: []
                            }
                        }).then(() => {
                            return interaction.editReply({
                                content: `${emojis.VERIFY} Message sent || Feel free to dismiss this message`
                            })
                        })

                    }
                },
                mimic: {
                    description: "Make a user say whatever you want!",
                    args: [{
                        name: 'user',
                        type: 'USER',
                        description: 'The user that you want to mimic',
                        required: true
                    }, {
                        name: 'text',
                        type: 'STRING',
                        description: 'The text that you want the bot to say',
                        required: true,
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const member = interaction.options.getUser('user');
                        const text = interaction.options.getString('text');

                        const GuildMember = interaction.guild.members.cache.get(member.id);

                        let userDisplayName

                        if (!GuildMember) userDisplayName = member.username
                        else userDisplayName = GuildMember.nickname || member.username

                        const mimicWebhook = await interaction.channel.createWebhook(userDisplayName, {
                            avatar: member.displayAvatarURL({
                                dynamic: true
                            })
                        })

                        const CharacterLimit = new MessageEmbed()
                            .setTitle(`You can't do that`)
                            .setDescription(`Your message is too long, I can only send up to 1024 characters\n\nYour message: ${text.length} characters`)
                            .setColor(colours.ERRORRED)

                        if (text.length >= 1024) return interaction.reply({
                            embeds: [CharacterLimit],
                            ephemeral: true
                        })

                        await interaction.deferReply({
                            ephemeral: true
                        })

                        await mimicWebhook.send({
                            content: `${text}`,
                            allowedMentions: {
                                parse: []
                            }
                        }).then(() => {
                            interaction.editReply({
                                content: `${emojis.VERIFY} Message sent || Feel free to dismiss this message`
                            })
                            return setTimeout(() => mimicWebhook.delete(), 3000);
                        })

                    }
                },
                kill: {
                    description: "Kill a user",
                    args: [{
                        name: "target",
                        description: "The user that you want to kill",
                        type: "USER",
                        required: false
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const TargetUser = interaction.options.getUser('target');

                        const User = interaction.member.nickname || interaction.user.username

                        if (!TargetUser || TargetUser.id === interaction.user.id) {
                            return interaction.reply({
                                content: `${User} committed no life 🙊`
                            })
                        } else {
                            const GuildMember = interaction.guild.members.cache.get(TargetUser.id);
                            let Target

                            if (GuildMember) Target = GuildMember.nickname || TargetUser.username
                            else Target = TargetUser.username

                            let deathmsg = [`${Target} watched a female comedian`, `Jett couldnt revive ${Target}`, `${Target}'s elytra broke`, `${Target} forgot their water bucket`, `${Target} bullied the quiet kid`, `${Target} fought the blue-haired girl`, `${Target} had america's oil`, `${Target} found the cure for cancer, the next day they magically disappeared`, `${Target} cancelled their subscription for living`, `${Target} died from AIDS...`, `${Target} died waiting for GBF to have good commands`, `${Target} was eaten by the duolingo owl...`, `${Target} killed their snapstreak with ${User} causing ${User} to get really angry at them then they shot them twice`, `${Target} missed their duolingo spanish lessons...`, `${Target} died from a heartbreak after being rejected by their crush ${User}`, `${Target} got dunk'd on by a fortnite kid cranking 90s`, `${Target} choked on their own saliva`, `${Target} died from a botched boob job`, `${Target} was stabbed by ${interaction.user.username} after they called their mom fat`, `${User} dropped a nokia phone on ${Target}`, `${Target} choked on..... water`, `${Target} died from loneliness`,
                                `${Target} got dabbed on for being a hater`, `${Target} tripped on nothing and died`, `${Target} killed themselves after ${interaction.user.username} showed them some unfunny memes`, `${interaction.user.username} tried to kill ${Target} but failed`, `${Target} used bots in general`, `${Target} sent NSFW in general!`, `${Target} talked back to their mom`, `${Target} said a no no word in a Christian Minecraft server`, `${Target} got a stroke after watching jake paul`, `${Target} killed themselves after getting cheated on by ${User}`, `${Target} was blown up by a creeper`, `${User} tried to kill ${Target} but ${Target} shot ${User} twice`, `${Target} was ran over by ${User}`, `${Target} got into an argument with an angry feminist`, `${Target} default danced to death`, `${Target} drowned`, `${Target} drowned after being pushed into the water by ${User}`
                            ]

                            let result = Math.floor((Math.random() * deathmsg.length));

                            return interaction.reply({
                                content: deathmsg[result]
                            })
                        }
                    }
                },
                yomama: {
                    description: "Yomama so dumb she had to check the command description",
                    args: [{
                        name: "target",
                        description: "The person to perform the epic troll on",
                        type: "USER"
                    }],
                    execute: async ({
                        client,
                        interaction
                    }) => {
                        const member = interaction.options.getUser('target') || interaction.user

                        const emoji = `<:trollface:838959517965353060>`

                        const ran = Math.floor(Math.random() * 5)

                        const res = await fetch('https://api.yomomma.info');
                        let joke = (await res.json()).joke;
                        joke = joke.charAt(0).toLowerCase() + joke.slice(1);
                        if (!joke.endsWith('!') && !joke.endsWith('.') && !joke.endsWith('"')) joke += '!';

                        if (member.id === client.user.id) {
                            if (ran >= 3 && ran <= 5 || ran === 0) {
                                return interaction.reply({
                                    content: `${interaction.user.username}, ${joke} ${emoji}`
                                })
                            } else {
                                return interaction.reply({
                                    content: `${interaction.user.username}, ${joke}`
                                })
                            }
                        }

                        if (ran >= 3 && ran <= 5 || ran === 0) {
                            return interaction.reply({
                                content: `${member.username}, ${joke} ${emoji}`
                            })
                        } else {
                            return interaction.reply({
                                content: `${member.username}, ${joke}`
                            })
                        }
                    }
                },
            }
        })
    }
}
