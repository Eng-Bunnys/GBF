                             //Getting the user from the cache, you can also use .fetch(), or if you're not using a non-author you can use interaction.member
                             //The user needs to be a GuildMember type so we can access the prescence : https://discord.js.org/#/docs/discord.js/stable/class/GuildMember
                             const GuildMember = interaction.guild.members.cache.get(user.id);
                             //Once you console log member.presence.activities it will give an array so we check it's length and loop through them all
                             for (let i = 0; i < GuildMember.presence.activities.length; i++) {
                                     //I added notes to what each variable is made for and what each presence means
                                    let FirstName //Application name Ex: League, Spotfiy, etc
                                    let StatusState //Status itself like "Hello World" or "Playing Overwatch", "In Game", etc
                                    let FirstEmoji //Emoji next to the status 
                                    //Custom status means the status that the user can put and customize aka the text one
                                    if (GuildMember.presence.activities[i].type === 'CUSTOM') {
                                        FirstName = GuildMember.presence.activities[i].name //Custom Status
                                        StatusState = GuildMember.presence.activities[i].state ?? "" //The status 
                                        FirstEmoji = GuildMember.presence.activities[i].emoji ?? "" //Emoji
                                        UserInfoEmbed.addFields({
                                            name: `${FirstName}:`,
                                            value: `${FirstEmoji} ${StatusState}`,
                                            inline: true
                                        })
                                    //From my experience with discord the listening can be either spotify or youtube music so I added one just for spotify and the rest are automatic
                                    } else if (GuildMember.presence.activities[i].type === 'LISTENING') {
                                        //The variable names are self explantory 
                                        let TrackName
                                        let AlbumName
                                        let Artist
                                        let AppEmoji
                                        let SongEndedTimeStamp
                                        FirstName = GuildMember.presence.activities[i].name //Spotfiy etc
                                        TrackName = GuildMember.presence.activities[i].details //Song name
                                        AlbumName = (GuildMember.presence.activities[i].assets.largeText) //Album Name
                                        //Sometimes the timestamps can be null so we check null
                                        //It's always good to also check if timestampes.end is not equal to null too, since sometimes start or end could be null
                                        if (GuildMember.presence.activities[i].timestamps !== null) {
                                            const ends = new Date(GuildMember.presence.activities[i].timestamps.end).getTime()
                                             //Getting the current time to calculate when the song ends
                                            const now = new Date()
                                            SongEndedTimeStamp = duration(ends - now, {
                                                units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                round: true
                                            });
                                        } else SongEndedTimeStamp = `Just Ended` //If timestampes is null
                                        Artist = GuildMember.presence.activities[i].state //Artist name
                                        if (FirstName === 'Spotify') AppEmoji = `<:Spotify:962905037649096815>` //Add your own spotify logo here
                                        else AppEmoji = `🎧`
                                        if (Artist.includes(";")) { //If there are multiple artists it seperates them with ;, so we remove the ; and change it to a ,
                                            Artist = Artist.split(";").join(", ")
                                        }

                                        UserInfoEmbed.addFields({
                                            name: `Listening to ${FirstName} ${AppEmoji}:`,
                                            //We want the Track name and album to be clickable, so we use simple editing to create a spotify link that searches for them
                                            value: `**[${TrackName}](${`https://open.spotify.com/search/${TrackName.split(" ").join("%20")}`})**\nby ${Artist}\non [${AlbumName}](${`https://open.spotify.com/search/${AlbumName.split(" ").join("%20")}`})\nTrack ends in: ${SongEndedTimeStamp}`,
                                            inline: true
                                        })
                                    } else if (GuildMember.presence.activities[i].type === 'PLAYING') {

                                        let GameName //Overwatch
                                        let GameDetails //Customs, etc
                                        let GameState //In queue, in game etc
                                        let EndsIn //1 minute ago etc
                                        let StartedPlaying
                                        GameName = GuildMember.presence.activities[i].name;
                                        GameDetails = GuildMember.presence.activities[i].details ?? '';
                                        GameState = GuildMember.presence.activities[i].state ?? '';
                                        //From testing, Premid YouTube breaks this, so I added it's own custom code
                                        if (GameName === 'YouTube') {
                                            if (!GuildMember.presence.activities[i].state) {
                                                //Checking if the timestamps are not equal to null, just like with LISTENING
                                                if (GuildMember.presence.activities[i].timestamps !== null && GuildMember.presence.activities[i].timestamps.start !== null) {
                                                    const StartedPlayingTimeStamp = new Date(GuildMember.presence.activities[i].timestamps.start).getTime()
                                                    const now = new Date()
                                                    StartedPlaying = duration(StartedPlayingTimeStamp - now, {
                                                        units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                        round: true
                                                    });
                                                } else StartedPlaying = `Just Started`
                                                //This occurs if the user is just scrolling through the homepage, or has privacy mode on
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
                                                    //In the event of the user watching a livestream
                                                    if (GuildMember.presence.activities[i].assets.smallText === 'Live') {
                                                        EndsIn = 'Live Stream [No Known End Time]'
                                                        EndsInTxt = `Ends In:`
                                                    } else {
                                                        EndsIn = 'Just Ended'
                                                        EndsInTxt = `Video `
                                                    }
                                                }
                                                //If privacy mode is disabled and the user is watching a video
                                                let videoState = GuildMember.presence.activities[i].assets.smallText
                                                UserInfoEmbed.addFields({
                                                    name: `Watching YouTube <:YouTube:962905816833327124>:`,
                                                    value: `**Video:** ${GameDetails}\n**Channel:** ${GameState}\n**Video Status:** ${videoState}\n**${EndsInTxt}** ${EndsIn}`,
                                                })
                                            }
                                        } else {
                                            //The same logic for YouTube goes here except it goes for all games
                                            //Some games only display "Playing for n hours" while others display more infomration like Paladins, Leauge of Legends etc
                                            //So we need to create code that is works for both and displays adequate information
                                            let PlayTimeTxt
                                            if (GuildMember.presence.activities[i].timestamps !== null && GuildMember.presence.activities[i].timestamps.start !== null) {
                                                const StartedPlayingTimeStamp = new Date(GuildMember.presence.activities[i].timestamps.start).getTime()
                                                const now = new Date()
                                                StartedPlaying = duration(StartedPlayingTimeStamp - now, {
                                                    units: ["y", "mo", "w", "d", "h", "m", "s"],
                                                    round: true
                                                });
                                                PlayTimeTxt = `Current Session:`
                                            } else if (GuildMember.presence.activities[i].timestamps.start === null || GuildMember.presence.activities[i].timestamps.end !== null) {
                                                StartedPlaying = ''
                                                PlayTimeTxt = `In-Game`
                                            } else {
                                                StartedPlaying = 'Just Started'
                                                PlayTimeTxt = `Current Session:`
                                            }
                                            //We set the details to be empty if it only shows the hours playing
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
                                        //If another event other than LISTENING, PLAYING, CUSTOM occur
                                        UserInfoEmbed.addFields({
                                            name: `${capitalize(GuildMember.presence.activities[0].type)}:`,
                                            value: `${GuildMember.presence.activities[0].name}`,
                                        })
                                    }
                                }
