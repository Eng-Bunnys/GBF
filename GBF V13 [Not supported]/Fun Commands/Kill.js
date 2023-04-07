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
                }
