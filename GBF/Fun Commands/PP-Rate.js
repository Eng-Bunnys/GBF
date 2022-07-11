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
                }
