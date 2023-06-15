             for (
                let i = 0;
                i < TargetMember.presence.activities.length;
                i++
              ) {
                const UserActivity = TargetMember.presence.activities[i];
                let StatusName: string;
                let StatusState: string;
                let StatusEmoji: string;
                if (UserActivity.type === ActivityType.Custom) {
                  StatusName = UserActivity?.name ?? "Custom Status";
                  StatusState = UserActivity?.state ?? "";
                  StatusEmoji = StatusEmoji =
                    UserActivity.emoji?.toString() ?? "";
                  UserInfoEmbed.addFields({
                    name: `${StatusName}:`,
                    value: `${StatusEmoji} ${StatusState}`,
                    inline: true
                  });
                } else if (UserActivity.type === ActivityType.Listening) {
                  StatusName = UserActivity?.name ?? "Listening";

                  StatusState = UserActivity?.state ?? "";
                  const TrackName = UserActivity.details;
                  const AlbumName = UserActivity.assets.largeText;

                  const SongEndTimestamp =
                    UserActivity.timestamps?.end?.getTime();
                  const RemainingTime = SongEndTimestamp
                    ? SongEndTimestamp - Date.now()
                    : null;
                  const SongEndedTimeStamp = RemainingTime
                    ? duration(RemainingTime, {
                        units: ["y", "mo", "w", "d", "h", "m", "s"],
                        round: true
                      })
                    : "Just Ended";

                  const SpotfiyEmoji = `<:Spotify:962905037649096815>`;

                  if (StatusName === "Spotify") StatusEmoji = SpotfiyEmoji;
                  else StatusEmoji = `🎧`;
                  if (StatusState.includes(";")) {
                    StatusState = StatusState.split(";").join(", ");
                  }

                  UserInfoEmbed.addFields({
                    name: `Listening to ${StatusName} ${StatusEmoji}:`,
                    value: `**[${TrackName}](${`https://open.spotify.com/search/${TrackName.split(
                      " "
                    ).join(
                      "%20"
                    )}`})**\nby ${StatusState}\non [${AlbumName}](${`https://open.spotify.com/search/${AlbumName.split(
                      " "
                    ).join("%20")}`})\nTrack ends in: ${SongEndedTimeStamp}`,
                    inline: true
                  });
                } else if (UserActivity.type === ActivityType.Playing) {
                  let GameName: string; //League of legends etc
                  let GameDetails: string; //Customs, etc
                  let GameState: string; //In queue, in game etc
                  let EndsIn: string; //1 minute ago etc
                  let StartedPlaying: string;
                  GameName = UserActivity.name;
                  GameDetails = UserActivity.details ?? "";
                  GameState = UserActivity.state ?? "";

                  if (GameName === "YouTube") {
                    if (UserActivity.state === null) {
                      if (UserActivity.timestamps?.start) {
                        const StartTime =
                          UserActivity.timestamps.start?.getTime();
                        const CurrentTime = Date.now();
                        StartedPlaying = duration(StartTime - CurrentTime, {
                          units: ["y", "mo", "w", "d", "h", "m", "s"],
                          round: true
                        });
                      } else {
                        StartedPlaying = "Just Started";
                      }

                      UserInfoEmbed.addFields({
                        name: `Watching YouTube :YouTube::`,
                        value: `${GameDetails} for: ${StartedPlaying}`
                      });
                    } else {
                      let EndsInText: string;
                      if (
                        UserActivity.timestamps?.end &&
                        UserActivity.assets?.smallText === "Live"
                      ) {
                        EndsIn = "Live Stream [No Known End Time]";
                        EndsInText = `Ends In:`;
                      } else if (UserActivity.timestamps?.end) {
                        const EndTime = UserActivity.timestamps.end?.getTime();
                        const CurrentTime = Date.now();
                        EndsIn = duration(EndTime - CurrentTime, {
                          units: ["y", "mo", "w", "d", "h", "m", "s"],
                          round: true
                        });
                        EndsInText = `Video Ends In:`;
                      } else {
                        EndsIn = "Just Ended";
                        EndsInText = `Video `;
                      }

                      const VideoState = UserActivity.assets?.smallText;
                      UserInfoEmbed.addFields({
                        name: `Watching YouTube :YouTube::`,
                        value: `**Video:** ${GameDetails}\n**Channel:** ${GameState}\n**Video Status:** ${VideoState}\n**${EndsInText}** ${EndsIn}`
                      });
                    }
                  } else {
                    let PlayTimeText: string;
                    const { timestamps } = UserActivity;
                    switch (true) {
                      case timestamps?.start !== null:
                        const StartedPlayingTimeStamp = new Date(
                          timestamps.start
                        ).getTime();
                        const CurrentTime = Date.now();
                        StartedPlaying = duration(
                          StartedPlayingTimeStamp - CurrentTime,
                          {
                            units: ["y", "mo", "w", "d", "h", "m", "s"],
                            round: true
                          }
                        );
                        PlayTimeText = `Current Session:`;
                        break;
                      case timestamps?.start === null ||
                        timestamps?.end !== null:
                        StartedPlaying = "";
                        PlayTimeText = `In-Game`;
                        break;
                      default:
                        StartedPlaying = "Just Started";
                        PlayTimeText = `Current Session:`;
                        break;
                    }

                    const DetailsValue =
                      GameDetails !== "" && GameState !== ""
                        ? `🕑 ${PlayTimeText} ${StartedPlaying}\n\n${GameDetails}\n${GameState}`
                        : `${PlayTimeText} ${StartedPlaying}`;

                    UserInfoEmbed.addFields({
                      name: `Playing ${GameName}:`,
                      value: `${DetailsValue}`,
                      inline: true
                    });
                  }
              }
