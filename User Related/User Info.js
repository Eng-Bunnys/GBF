//Advanced User Info 
//Under GBF 

//I am fully aware that the status can be done using a loop, this is old code to be honest and I don't feel like updating it, when I do I'll also update this code

                        //Getting the user from slash command options
                        const user = interaction.options.getUser("user") || interaction.user;
                        //I won't explain the code it's too big L
                        const GuildMember = interaction.guild.members.cache.get(user.id);

                        const UserCreated = Math.round(user.createdTimestamp / 1000)

                        if (GuildMember === undefined) {
                            const NotInServer = new MessageEmbed()
                                .setAuthor({
                                    name: `${user.tag}`,
                                    iconURL: user.displayAvatarURL({
                                        dynamic: true
                                    })
                                })
                                .setColor(colours.DEFAULT)
                                .addFields({
                                    name: "Joined Discord:",
                                    value: `<t:${UserCreated}:F>, <t:${UserCreated}:R>`,
                                    inline: true
                                }, {
                                    name: "Username:",
                                    value: `${user.username}`,
                                    inline: true
                                }, {
                                    name: "Tag:",
                                    value: `#${user.discriminator}`,
                                    inline: true
                                }, {
                                    name: "Account Type:",
                                    value: `${user.bot ?"Bot" : "Human"}`,
                                    inline: true
                                }, {
                                    name: "ID:",
                                    value: `${user.id}`,
                                    inline: true
                                }, {
                                    name: "Profile URL:",
                                    value: `[${user.tag}](${`https://discord.com/users/${user.id}`})`,
                                    inline: true
                                })
                                .setThumbnail(user.displayAvatarURL({
                                    dynamic: true
                                }))
                                .setFooter({
                                    text: `TIP: This command shows more information about server members`,
                                    iconURL: `https://emoji.gg/assets/emoji/2487-badge-serverbooster9.png`
                                })
                            return interaction.reply({
                                embeds: [NotInServer]
                            })
                        }

                        const titleCase = str => {
                            return str.toLowerCase().split(" ")
                                .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
                                .join(" ")
                        }

                        let trimArray = (arr, maxLen = 10) => {
                            if (arr.length > maxLen) {
                                const len = arr.length - maxLen;
                                arr = arr.slice(0, maxLen);
                                arr.push(` and ${len} more role(s)...`);
                            }
                            return arr;
                        }

                        function keyPerms(role) {
                            let KeyPermissions = []
                            if (role.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) KeyPermissions.push("Administrator")
                            else {
                                if (role.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) KeyPermissions.push(`Manage Server`)
                                if (role.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) KeyPermissions.push(`Manage Roles`)
                                if (role.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) KeyPermissions.push(`Manage Channels`)
                                if (role.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) KeyPermissions.push(`Kick Members`)
                                if (role.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) KeyPermissions.push(`Ban Members`)
                                if (role.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) KeyPermissions.push(`Manage Nicknames`)
                                if (role.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) KeyPermissions.push(`Manage Emojis & Stickers`)
                                if (role.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) KeyPermissions.push(`Manage Messages`)
                                if (role.permissions.has(Permissions.FLAGS.MENTION_EVERYONE)) KeyPermissions.push(`Mention Everyone`)
                                if (role.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)) KeyPermissions.push(`Moderate Members`)
                            }
                            return KeyPermissions
                        }

                        const BADGES = {
                            "": "None",
                            "DISCORD_EMPLOYEE": "<:D_Staff:826951574088581140>",
                            "DISCORD_PARTNER": "<:D_Partner:826951266357608558>",
                            "BUGHUNTER_LEVEL_1": "<:D_BugHunter:826950777176195123>",
                            "HYPESQUAD_EVENTS": "<:D_HypeSquadEvents:826950445695500358>",
                            "HOUSE_BRAVERY": "<:D_Bravery:826950151444103178>",
                            "HOUSE_BRILLIANCE": "<:D_Brilliance:826949675038801981>",
                            "HOUSE_BALANCE": "<:D_Balance:826948943178760212>",
                            "EARLY_SUPPORTER": "<:D_Earlysupporter:826949248607977474>",
                            "VERIFIED_BOT": "Verified Bot <:verifiedbot:972938255291015248>",
                            "VERIFIED_DEVELOPER": "<:D_VerifBotDev:826952303042101288>",
                            "BOT_HTTP_INTERACTIONS": "",
                            "TEAM_USER": "",
                            "BUGHUNTER_LEVEL_2": "<:bugHunter2:973146470494662677>",
                            "PARTNERED_SERVER_OWNER": "<:D_Partner:826951266357608558>",
                            "DISCORD_CERTIFIED_MODERATOR": "<:certifiedMod:973146823814418492>"
                        };

                        const STATUSES = {
                            "": "None",
                            "online": "<:online:934570010901377025>",
                            "idle": "<:idle:934569895474114611>",
                            "dnd": "<:dnd:934569539776155718>",
                            "streaming": "<:streaming:934569539054731324>",
                            "offline": "<:invs:934569539197341717>"
                        }

                        const DEVICES = {
                            "": "None",
                            web: "🌐",
                            desktop: "💻",
                            mobile: "📱"
                        };

                        let status
                        let statusText
                        if (GuildMember.presence !== null) {
                            if (GuildMember.presence.status === "dnd") {
                                status = "<:dnd:934569539776155718>"
                                statusText = "Do Not Disturb"
                            } else {
                                status = STATUSES[GuildMember.presence.status]
                                statusText = titleCase(GuildMember.presence.status)
                            }
                        } else {
                            statusText = "Offline"
                            status = `<:invs:934569539197341717>`
                        }

                        let userDevice
                        if (GuildMember.presence !== null) {
                            if (GuildMember.presence.status === "offline" || user.bot) {
                                userDevice = ""
                            } else if (!user.bot) {
                                userDevice = DEVICES[Object.keys(GuildMember.presence.clientStatus)[0]]
                            }
                        } else userDevice = ""

                        const UserJoinedServer = Math.round(GuildMember.joinedTimestamp / 1000);
                        let HighestRoleDisplay
                        const HighestRole = GuildMember.roles.highest.id;

                        if (!HighestRole) HighestRoleDisplay = "User Has No Roles"
                        if (HighestRole === interaction.guild.id) HighestRoleDisplay = `@everyone`
                        else HighestRoleDisplay = `<@&${HighestRole}>`


                        const userRoles = GuildMember.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString()).slice(0, -1);
                        const UserRolesTrimmed = trimArray(GuildMember.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString()).slice(0, -1))

                        const TipMessages = ['The user color is clickable', 'You can see which song the user is listening to', 'If you click the song name it will take you to the song on Spotfiy', 'Blue text means you can click it', `This command also works for user's outside of this server`, `If the user has the "Administrator" permission it will only show that in Key Permissions`, `This command works best for server members`, `The joined server and Discord timestamps are in UNIX which means they will update forever`, `We use a "smart" system, that means *some* fields will not show if empty to avoid clutter`, `If the user doesn't have any roles that field will not show`, `If you click the user ID it will take you to their profile`]
                        const DisplayTipMessage = TipMessages[Math.floor(Math.random() * TipMessages.length)]

                        let AccountType
                        if (user.bot === false) AccountType = 'Human'
                        else AccountType = 'Bot'
                        const userFlags = (await GuildMember.user.fetchFlags()).toArray()
                        const UserInfoEmbed = new MessageEmbed()
                            .setAuthor({
                                name: `${user.tag} ${userDevice}`,
                                iconURL: user.displayAvatarURL({
                                    dynamic: true
                                })
                            })
                            .setColor(GuildMember.displayHexColor ?? '#e91e63')
                            .setThumbnail(user.displayAvatarURL({
                                dynamic: true
                            }))
                            .setFooter({
                                text: `TIP: ${DisplayTipMessage}`,
                                iconURL: `https://emoji.gg/assets/emoji/2487-badge-serverbooster9.png`
                            })
                            .addFields({
                                name: "User Badges:",
                                value: `${userFlags.map(flag => BADGES[flag]).join(' ') || "None"}`,
                                inline: false
                            }, {
                                name: "Joined Discord:",
                                value: `<t:${UserCreated}:F>, <t:${UserCreated}:R>`,
                                inline: true
                            }, {
                                name: "Joined Server:",
                                value: `<t:${UserJoinedServer}:F>, <t:${UserJoinedServer}:R>`,
                                inline: true
                            }, {
                                name: "Nickname:",
                                value: `${GuildMember.nickname || user.username}`,
                                inline: true
                            }, {
                                name: "Tag:",
                                value: `#${user.discriminator}`,
                                inline: true
                            }, {
                                name: "Account Type:",
                                value: `${AccountType}`,
                                inline: true
                            }, {
                                name: "Color:",
                                value: `[${GuildMember.displayHexColor}](${`https://www.color-hex.com/color/${GuildMember.displayHexColor.slice(1)}`})`,
                                inline: true
                            }, {
                                name: "ID:",
                                value: `[${GuildMember.id}](${`https://discord.com/users/${GuildMember.id}`})`,
                                inline: true
                            }, {
                                name: "Highest Role:",
                                value: `${HighestRoleDisplay}`,
                                inline: true
                            }, {
                                name: "Status:",
                                value: `${status} ${statusText}`,
                                inline: true
                            })

                        if (userRoles.length > 0) {
                            UserInfoEmbed.addFields({
                                name: `Roles [${userRoles.length}]:`,
                                value: `${UserRolesTrimmed}`,
                                inline: true
                            })
                        }

                        if (keyPerms(GuildMember).length > 0) {
                            UserInfoEmbed.addFields({
                                name: `Key Permissions [${keyPerms(GuildMember).length}]:`,
                                value: `${keyPerms(GuildMember).join(', ') || "None" }`,
                                inline: false
                            })
                        }

                        if (GuildMember.presence !== null && user.bot === true) {
                            if (GuildMember.presence.activities.length > 0) {
                                UserInfoEmbed.addFields({
                                    name: `${capitalize(GuildMember.presence.activities[0].type)}:`,
                                    value: `${GuildMember.presence.activities[0].name}`,
                                    inline: true
                                })
                            }
                            if (GuildMember.presence.activities.length > 1) {
                                UserInfoEmbed.addFields({
                                    name: `${capitalize(GuildMember.presence.activities[1].type)}:`,
                                    value: `${GuildMember.presence.activities[1].name}`,
                                    inline: true
                                })
                            }
                        }
                        try {
                        if (GuildMember.presence !== null && user.bot === false) {
                            if (GuildMember.presence.activities.length > 0) {
                                let FirstName //Application name Ex: League, Spotfiy, etc
                                let StatusState //Status itself like "Hello World" or "Playing Overwatch", "In Game", etc
                                let FirstEmoji //Emoji next to the status 
                                if (GuildMember.presence.activities[0].type === 'CUSTOM') {
                                    FirstName = GuildMember.presence.activities[0].name //Custom Status
                                    StatusState = GuildMember.presence.activities[0].state ?? "None" //The status 
                                    FirstEmoji = GuildMember.presence.activities[0].emoji ?? "" //Emoji
                                    UserInfoEmbed.addFields({
                                        name: FirstName + `:`,
                                        value: `${FirstEmoji} ${StatusState}`,
                                        inline: true
                                    })
                                } else if (GuildMember.presence.activities[0].type === 'LISTENING') {
                                    let TrackName
                                    let AlbumName
                                    let Artist
                                    let AppEmoji
                                    let SongEndedTimeStamp
                                    FirstName = GuildMember.presence.activities[0].name //Spotfiy etc
                                    TrackName = GuildMember.presence.activities[0].details //Song name
                                    AlbumName = (GuildMember.presence.activities[0].assets.largeText) //Album Name
                                    if (GuildMember.presence.activities[0].timestamps !== null) {
                                        const ends = new Date(GuildMember.presence.activities[0].timestamps.end).getTime()
                                        const now = new Date()
                                        SongEndedTimeStamp = duration(ends - now, {
                                            units: ["y", "mo", "w", "d", "h", "m", "s"],
                                            round: true
                                        });
                                    } else SongEndedTimeStamp = `Just Ended`
                                    Artist = GuildMember.presence.activities[0].state //Artist name
                                    if (FirstName === 'Spotify') AppEmoji = `<:Spotify:962905037649096815>`
                                    else AppEmoji = `🎧`
                                    if (Artist.includes(";")) {
                                        Artist = Artist.split(";").join(", ")
                                    }

                                    UserInfoEmbed.addFields({
                                        name: `Listening to ${FirstName} ${AppEmoji}:`,
                                        value: `**[${TrackName}](${`https://open.spotify.com/search/${TrackName.split(" ").join("%20")}`})**\nby ${Artist}\non [${AlbumName}](${`https://open.spotify.com/search/${AlbumName.split(" ").join("%20")}`})\nTrack ends in: ${SongEndedTimeStamp}`,
                                        inline: true
                                    })

                                } else if (GuildMember.presence.activities[0].type === 'PLAYING') {

                                    let GameName //League of legends etc
                                    let GameDetails //Customs, etc
                                    let GameState //In queue, in game etc
                                    let EndsIn //1 minute ago etc
                                    let StartedPlaying
                                    GameName = GuildMember.presence.activities[0].name
                                    GameDetails = GuildMember.presence.activities[0].details ?? ''
                                    GameState = GuildMember.presence.activities[0].state ?? ''

                                    if (GameName === 'YouTube') {
                                        if (!GuildMember.presence.activities[0].state) {
                                            if (GuildMember.presence.activities[0].timestamps !== null && GuildMember.presence.activities[0].timestamps.start !== null) {
                                                const StartedPlayingTimeStamp = new Date(GuildMember.presence.activities[0].timestamps.start).getTime()
                                                const now = new Date()
                                                StartedPlaying = duration(StartedPlayingTimeStamp - now, {
                                                    units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                    round: true
                                                });
                                            } else StartedPlaying = `Just Started`
                                            UserInfoEmbed.addFields({
                                                name: `Watching YouTube <:YouTube:962905816833327124>:`,
                                                value: `${GameDetails} for: ${StartedPlaying}`,
                                            })
                                        } else {
                                            let EndsInTxt
                                            if (GuildMember.presence.activities[0].timestamps !== null) {
                                                const ends = new Date(GuildMember.presence.activities[0].timestamps.end).getTime()
                                                const now = new Date()
                                                EndsIn = duration(ends - now, {
                                                    units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                    round: true
                                                });
                                                EndsInTxt = `Video Ends In:`
                                            } else {
                                                if (GuildMember.presence.activities[0].assets.smallText === 'Live') {
                                                    EndsIn = 'Live Stream [No Known End Time]'
                                                    EndsInTxt = `Ends In:`
                                                } else {
                                                    EndsIn = 'Just Ended'
                                                    EndsInTxt = `Video `
                                                }
                                            }
                                            let videoState = GuildMember.presence.activities[0].assets.smallText
                                            UserInfoEmbed.addFields({
                                                name: `Watching YouTube <:YouTube:962905816833327124>:`,
                                                value: `**Video:** ${GameDetails}\n**Channel:** ${GameState}\n**Video Status:** ${videoState}\n**${EndsInTxt}** ${EndsIn}`,
                                            })
                                        }
                                    } else {
                                        let PlayTimeTxt
                                        if (GuildMember.presence.activities[0].timestamps !== null && GuildMember.presence.activities[0].timestamps.start !== null) {
                                            const StartedPlayingTimeStamp = new Date(GuildMember.presence.activities[0].timestamps.start).getTime()
                                            const now = new Date()
                                            StartedPlaying = duration(StartedPlayingTimeStamp - now, {
                                                units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                round: true
                                            });
                                            PlayTimeTxt = `Current Session:`
                                        } else if (GuildMember.presence.activities[0].timestamps.start === null || GuildMember.presence.activities[0].timestamps.end) {
                                            StartedPlaying = ''
                                            PlayTimeTxt = `In-Game`
                                        } else {
                                            StartedPlaying = 'Just Started'
                                            PlayTimeTxt = `Current Session:`
                                        }

                                        if (GameDetails !== '' && GameState !== '') {
                                            UserInfoEmbed.addFields({
                                                name: `Playing ${GameName}:`,
                                                value: `${PlayTimeTxt} ${StartedPlaying}\n${GameDetails}\n${GameState}`,
                                                inline: true
                                            })
                                        } else {
                                            UserInfoEmbed.addFields({
                                                name: `Playing ${GameName}:`,
                                                value: `${PlayTimeTxt} ${StartedPlaying}`,
                                                inline: true
                                            })
                                        }
                                    }
                                } else {
                                    UserInfoEmbed.addFields({
                                        name: `${capitalize(GuildMember.presence.activities[0].type)}:`,
                                        value: `${GuildMember.presence.activities[0].name}`,
                                    })
                                }
                            }

                            if (GuildMember.presence.activities.length > 1) {
                                let FirstName //Application name Ex: League, Spotfiy, etc
                                let StatusState //Status itself like "Hello World" or "Playing Overwatch", "In Game", etc
                                let FirstEmoji //Emoji next to the status 
                                if (GuildMember.presence.activities[1].type === 'CUSTOM') {
                                    FirstName = GuildMember.presence.activities[1].name //Custom Status
                                    StatusState = GuildMember.presence.activities[1].state ?? "None" //The status 
                                    FirstEmoji = GuildMember.presence.activities[1].emoji ?? "" //Emoji
                                    UserInfoEmbed.addFields({
                                        name: FirstName + `:`,
                                        value: `${FirstEmoji} ${StatusState}`,
                                        inline: true
                                    })
                                } else if (GuildMember.presence.activities[1].type === 'LISTENING') {
                                    let TrackName
                                    let AlbumName
                                    let Artist
                                    let AppEmoji
                                    let SongEndedTimeStamp
                                    let SongURL
                                    FirstName = GuildMember.presence.activities[1].name //Spotfiy etc
                                    TrackName = GuildMember.presence.activities[1].details //Song name
                                    AlbumName = (GuildMember.presence.activities[1].assets.largeText) //Album Name
                                    if (GuildMember.presence.activities[1].timestamps !== null) {
                                        const ends = new Date(GuildMember.presence.activities[1].timestamps.end).getTime()
                                        const now = new Date()
                                        SongEndedTimeStamp = duration(ends - now, {
                                            units: ["y", "mo", "w", "d", "h", "m", "s"],
                                            round: true
                                        });
                                    } else SongEndedTimeStamp = `Just Ended`
                                    Artist = GuildMember.presence.activities[1].state //Artist name
                                    if (FirstName === 'Spotify') AppEmoji = `<:Spotify:962905037649096815>`
                                    else AppEmoji = `🎧`
                                    if (Artist.includes(";")) {
                                        Artist = Artist.split(";").join(", ")
                                    }

                                    UserInfoEmbed.addFields({
                                        name: `Listening to ${FirstName} ${AppEmoji}:`,
                                        value: `**[${TrackName}](${`https://open.spotify.com/search/${TrackName.split(" ").join("%20")}`})**\nby ${Artist}\non [${AlbumName}](${`https://open.spotify.com/search/${AlbumName.split(" ").join("%20")}`})\nTrack ends in: ${SongEndedTimeStamp}`,
                                        inline: true
                                    })

                                } else if (GuildMember.presence.activities[1].type === 'PLAYING') {

                                    let GameName //League of legends etc
                                    let GameDetails //Customs, etc
                                    let GameState //In queue, in game etc
                                    let EndsIn //1 minute ago etc
                                    let StartedPlaying
                                    GameName = GuildMember.presence.activities[1].name
                                    GameDetails = GuildMember.presence.activities[1].details ?? ''
                                    GameState = GuildMember.presence.activities[1].state ?? ''

                                    if (GameName === 'YouTube') {
                                        if (!GuildMember.presence.activities[1].state) {
                                            if (GuildMember.presence.activities[1].timestamps !== null && GuildMember.presence.activities[1].timestamps.start !== null) {
                                                const StartedPlayingTimeStamp = new Date(GuildMember.presence.activities[1].timestamps.start).getTime()
                                                const now = new Date()
                                                StartedPlaying = duration(StartedPlayingTimeStamp - now, {
                                                    units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                    round: true
                                                });
                                            } else StartedPlaying = `Just Started`
                                            UserInfoEmbed.addFields({
                                                name: `Watching YouTube <:YouTube:962905816833327124>:`,
                                                value: `${GameDetails} for: ${StartedPlaying}`,
                                            })
                                        } else {
                                            let EndsInTxt
                                            if (GuildMember.presence.activities[1].timestamps !== null) {
                                                const ends = new Date(GuildMember.presence.activities[1].timestamps.end).getTime()
                                                const now = new Date()
                                                EndsIn = duration(ends - now, {
                                                    units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                    round: true
                                                });
                                                EndsInTxt = `Video Ends In:`
                                            } else {
                                                if (GuildMember.presence.activities[1].assets.smallText === 'Live') {
                                                    EndsIn = 'Live Stream [No Known End Time]'
                                                    EndsInTxt = `Ends In:`
                                                } else {
                                                    EndsIn = 'Just Ended'
                                                    EndsInTxt = `Video `
                                                }
                                            }
                                            let videoState = GuildMember.presence.activities[1].assets.smallText
                                            UserInfoEmbed.addFields({
                                                name: `Watching YouTube <:YouTube:962905816833327124>:`,
                                                value: `**Video:** ${GameDetails}\n**Channel:** ${GameState}\n**Video Status:** ${videoState}\n**${EndsInTxt}** ${EndsIn}`,
                                            })
                                        }
                                    } else {
                                        let PlayTimeTxt
                                        if (GuildMember.presence.activities[1].timestamps !== null && GuildMember.presence.activities[1].timestamps.start !== null) {
                                            const StartedPlayingTimeStamp = new Date(GuildMember.presence.activities[1].timestamps.start).getTime()
                                            const now = new Date()
                                            StartedPlaying = duration(StartedPlayingTimeStamp - now, {
                                                units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                round: true
                                            });
                                            PlayTimeTxt = `Current Session:`
                                        } else if (GuildMember.presence.activities[1].timestamps.start === null || GuildMember.presence.activities[1].timestamps.end) {
                                            StartedPlaying = ''
                                            PlayTimeTxt = `In-Game`
                                        } else {
                                            StartedPlaying = 'Just Started'
                                            PlayTimeTxt = `Current Session:`
                                        }

                                        if (GameDetails !== '' && GameState !== '') {
                                            UserInfoEmbed.addFields({
                                                name: `Playing ${GameName}:`,
                                                value: `${PlayTimeTxt} ${StartedPlaying}\n${GameDetails}\n${GameState}`,
                                                inline: true
                                            })
                                        } else {
                                            UserInfoEmbed.addFields({
                                                name: `Playing ${GameName}:`,
                                                value: `${PlayTimeTxt} ${StartedPlaying}`,
                                                inline: true
                                            })
                                        }
                                    }
                                } else {
                                    UserInfoEmbed.addFields({
                                        name: `${capitalize(GuildMember.presence.activities[1].type)}:`,
                                        value: `${GuildMember.presence.activities[1].name}`,
                                    })
                                }
                            }

                            if (GuildMember.presence.activities.length > 2) {
                                let FirstName //Application name Ex: League, Spotfiy, etc
                                let StatusState //Status itself like "Hello World" or "Playing Overwatch", "In Game", etc
                                let FirstEmoji //Emoji next to the status 
                                if (GuildMember.presence.activities[2].type === 'CUSTOM') {
                                    FirstName = GuildMember.presence.activities[2].name //Custom Status
                                    StatusState = GuildMember.presence.activities[2].state ?? "None" //The status 
                                    FirstEmoji = GuildMember.presence.activities[2].emoji ?? "" //Emoji
                                    UserInfoEmbed.addFields({
                                        name: FirstName + `:`,
                                        value: `${FirstEmoji} ${StatusState}`,
                                        inline: false
                                    })
                                } else if (GuildMember.presence.activities[2].type === 'LISTENING') {
                                    let TrackName
                                    let AlbumName
                                    let Artist
                                    let AppEmoji
                                    let SongEndedTimeStamp
                                    let SongURL
                                    FirstName = GuildMember.presence.activities[2].name //Spotfiy etc
                                    TrackName = GuildMember.presence.activities[2].details //Song name
                                    AlbumName = (GuildMember.presence.activities[2].assets.largeText) //Album Name
                                    if (GuildMember.presence.activities[2].timestamps !== null) {
                                        const ends = new Date(GuildMember.presence.activities[2].timestamps.end).getTime()
                                        const now = new Date()
                                        SongEndedTimeStamp = duration(ends - now, {
                                            units: ["y", "mo", "w", "d", "h", "m", "s"],
                                            round: true
                                        });
                                    } else SongEndedTimeStamp = `Just Ended`
                                    Artist = GuildMember.presence.activities[2].state //Artist name
                                    if (FirstName === 'Spotify') AppEmoji = `<:Spotify:962905037649096815>`
                                    else AppEmoji = `🎧`
                                    if (Artist.includes(";")) {
                                        Artist = Artist.split(";").join(", ")
                                    }

                                    UserInfoEmbed.addFields({
                                        name: `Listening to ${FirstName} ${AppEmoji}:`,
                                        value: `**[${TrackName}](${`https://open.spotify.com/search/${TrackName.split(" ").join("%20")}`})**\nby ${Artist}\non [${AlbumName}](${`https://open.spotify.com/search/${AlbumName.split(" ").join("%20")}`})\nTrack ends in: ${SongEndedTimeStamp}`,
                                        inline: false
                                    })

                                } else if (GuildMember.presence.activities[2].type === 'PLAYING') {

                                    let GameName //League of legends etc
                                    let GameDetails //Customs, etc
                                    let GameState //In queue, in game etc
                                    let EndsIn //2 minute ago etc
                                    let StartedPlaying
                                    GameName = GuildMember.presence.activities[2].name
                                    GameDetails = GuildMember.presence.activities[2].details ?? ''
                                    GameState = GuildMember.presence.activities[2].state ?? ''

                                    if (GameName === 'YouTube') {
                                        if (!GuildMember.presence.activities[2].state) {
                                            if (GuildMember.presence.activities[2].timestamps !== null && GuildMember.presence.activities[2].timestamps.start !== null) {
                                                const StartedPlayingTimeStamp = new Date(GuildMember.presence.activities[2].timestamps.start).getTime()
                                                const now = new Date()
                                                StartedPlaying = duration(StartedPlayingTimeStamp - now, {
                                                    units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                    round: true
                                                });
                                            } else StartedPlaying = `Just Started`
                                            UserInfoEmbed.addFields({
                                                name: `Watching YouTube <:YouTube:962905816833327124>:`,
                                                value: `${GameDetails} for: ${StartedPlaying}`,
                                            })
                                        } else {
                                            let EndsInTxt
                                            if (GuildMember.presence.activities[2].timestamps !== null) {
                                                const ends = new Date(GuildMember.presence.activities[2].timestamps.end).getTime()
                                                const now = new Date()
                                                EndsIn = duration(ends - now, {
                                                    units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                    round: true
                                                });
                                                EndsInTxt = `Video Ends In:`
                                            } else {
                                                if (GuildMember.presence.activities[2].assets.smallText === 'Live') {
                                                    EndsIn = 'Live Stream [No Known End Time]'
                                                    EndsInTxt = `Ends In:`
                                                } else {
                                                    EndsIn = 'Just Ended'
                                                    EndsInTxt = `Video `
                                                }
                                            }
                                            let videoState = GuildMember.presence.activities[2].assets.smallText
                                            UserInfoEmbed.addFields({
                                                name: `Watching YouTube <:YouTube:962905816833327124>:`,
                                                value: `**Video:** ${GameDetails}\n**Channel:** ${GameState}\n**Video Status:** ${videoState}\n**${EndsInTxt}** ${EndsIn}`,
                                            })
                                        }
                                    } else {
                                        let PlayTimeTxt
                                        if (GuildMember.presence.activities[2].timestamps !== null && GuildMember.presence.activities[2].timestamps.start !== null) {
                                            const StartedPlayingTimeStamp = new Date(GuildMember.presence.activities[2].timestamps.start).getTime()
                                            const now = new Date()
                                            StartedPlaying = duration(StartedPlayingTimeStamp - now, {
                                                units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                round: true
                                            });
                                            PlayTimeTxt = `Current Session:`
                                        } else if (GuildMember.presence.activities[2].timestamps.start === null || GuildMember.presence.activities[2].timestamps.end) {
                                            StartedPlaying = ''
                                            PlayTimeTxt = `In-Game`
                                        } else {
                                            StartedPlaying = 'Just Started'
                                            PlayTimeTxt = `Current Session:`
                                        }

                                        if (GameDetails !== '' && GameState !== '') {
                                            UserInfoEmbed.addFields({
                                                name: `Playing ${GameName}:`,
                                                value: `${PlayTimeTxt} ${StartedPlaying}\n${GameDetails}\n${GameState}`,
                                                inline: false
                                            })
                                        } else {
                                            UserInfoEmbed.addFields({
                                                name: `Playing ${GameName}:`,
                                                value: `${PlayTimeTxt} ${StartedPlaying}`,
                                                inline: false
                                            })
                                        }
                                    }
                                } else {
                                    UserInfoEmbed.addFields({
                                        name: `${capitalize(GuildMember.presence.activities[2].type)}:`,
                                        value: `${GuildMember.presence.activities[2].name}`,
                                    })
                                }
                            }
                        }
                    } catch (err) {
                        console.log(`I ran into an error in the userInfo command: ${err}`)
                        return interaction.reply({
                            content: `I ran into an error ${emojis.ERROR}\nI've already reported the error to my developers!`
                        })
                    }
                        return interaction.reply({
                            embeds: [UserInfoEmbed]
                        })

                    }
