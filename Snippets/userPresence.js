                        try {
                            if (GuildMember.presence !== null && user.bot === false) {
                                for (let i = 0; i < GuildMember.presence.activities.length; i++) {

                                    let FirstName //Application name Ex: League, Spotfiy, etc
                                    let StatusState //Status itself like "Hello World" or "Playing Overwatch", "In Game", etc
                                    let FirstEmoji //Emoji next to the status 
                                    if (GuildMember.presence.activities[i].type === 'CUSTOM') {
                                        FirstName = GuildMember.presence.activities[i].name //Custom Status
                                        StatusState = GuildMember.presence.activities[i].state ?? "" //The status 
                                        FirstEmoji = GuildMember.presence.activities[i].emoji ?? "" //Emoji
                                        UserInfoEmbed.addFields({
                                            name: `${FirstName}:`,
                                            value: `${FirstEmoji} ${StatusState}`,
                                            inline: true
                                        })
                                    } else if (GuildMember.presence.activities[i].type === 'LISTENING') {
                                        let TrackName
                                        let AlbumName
                                        let Artist
                                        let AppEmoji
                                        let SongEndedTimeStamp
                                        FirstName = GuildMember.presence.activities[i].name //Spotfiy etc
                                        TrackName = GuildMember.presence.activities[i].details //Song name
                                        AlbumName = (GuildMember.presence.activities[i].assets.largeText) //Album Name
                                        if (GuildMember.presence.activities[i].timestamps !== null && GuildMember.presence.activities[i].timestamps.end !== null) {
                                            const ends = new Date(GuildMember.presence.activities[i].timestamps.end).getTime()
                                            const now = new Date()
                                            SongEndedTimeStamp = duration(ends - now, {
                                                units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                round: true
                                            });
                                        } else SongEndedTimeStamp = `Just Ended`
                                        Artist = GuildMember.presence.activities[i].state //Artist name
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
                                    } else if (GuildMember.presence.activities[i].type === 'PLAYING') {

                                        let GameName //League of legends etc
                                        let GameDetails //Customs, etc
                                        let GameState //In queue, in game etc
                                        let EndsIn //1 minute ago etc
                                        let StartedPlaying
                                        GameName = GuildMember.presence.activities[i].name;
                                        GameDetails = GuildMember.presence.activities[i].details ?? '';
                                        GameState = GuildMember.presence.activities[i].state ?? '';

                                        if (GameName === 'YouTube') {
                                            if (!GuildMember.presence.activities[i].state) {
                                                if (GuildMember.presence.activities[i].timestamps !== null && GuildMember.presence.activities[i].timestamps.start !== null) {
                                                    const StartedPlayingTimeStamp = new Date(GuildMember.presence.activities[i].timestamps.start).getTime()
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
                                                if (GuildMember.presence.activities[i].timestamps !== null && GuildMember.presence.activities[i].timestamps.end !== null) {
                                                    const ends = new Date(GuildMember.presence.activities[i].timestamps.end).getTime()
                                                    const now = new Date()
                                                    EndsIn = duration(ends - now, {
                                                        units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                        round: true
                                                    });
                                                    EndsInTxt = `Video Ends In:`
                                                } else {
                                                    if (GuildMember.presence.activities[i].assets.smallText === 'Live') {
                                                        EndsIn = 'Live Stream [No Known End Time]'
                                                        EndsInTxt = `Ends In:`
                                                    } else {
                                                        EndsIn = 'Just Ended'
                                                        EndsInTxt = `Video `
                                                    }
                                                }
                                                let videoState = GuildMember.presence.activities[i].assets.smallText
                                                UserInfoEmbed.addFields({
                                                    name: `Watching YouTube <:YouTube:962905816833327124>:`,
                                                    value: `**Video:** ${GameDetails}\n**Channel:** ${GameState}\n**Video Status:** ${videoState}\n**${EndsInTxt}** ${EndsIn}`,
                                                })
                                            }
                                        } else {
                                            let PlayTimeTxt
                                            if (GuildMember.presence.activities[i].timestamps !== null && GuildMember.presence.activities[i].timestamps.start !== null) {
                                                const StartedPlayingTimeStamp = new Date(GuildMember.presence.activities[i].timestamps.start).getTime()
                                                const now = new Date()
                                                StartedPlaying = duration(StartedPlayingTimeStamp - now, {
                                                    units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                    round: true
                                                });
                                                PlayTimeTxt = `Current Session:`
                                            } else if (GuildMember.presence.activities[i].timestamps !== null && GuildMember.presence.activities[i].timestamps?.start === null || GuildMember.presence.activities[i].timestamps?.end !== null) {
                                                StartedPlaying = ''
                                                PlayTimeTxt = `In-Game`
                                            } else {
                                                StartedPlaying = 'Just Started'
                                                PlayTimeTxt = `Current Session:`
                                            }

                                            if (GameDetails !== '' && GameState !== '') {
                                                UserInfoEmbed.addFields({
                                                    name: `Playing ${GameName}:`,
                                                    value: `🕑 ${PlayTimeTxt} ${StartedPlaying}\n\n${GameDetails}\n${GameState}`,
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
