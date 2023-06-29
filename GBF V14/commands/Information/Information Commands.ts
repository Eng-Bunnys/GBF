import GBFClient from "../../handler/clienthandler";
import SlashCommand from "../../utils/slashCommands";

import {
  ActionRowBuilder,
  ActivityType,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ColorResolvable,
  EmbedBuilder,
  GuildNSFWLevel,
  GuildPremiumTier,
  GuildVerificationLevel,
  User,
  UserFlags,
  hyperlink
} from "discord.js";
import duration from "humanize-duration";

import colors from "../../GBF/GBFColor.json";

import {
  KeyPerms,
  capitalize,
  chooseRandomFromArray,
  msToTime
} from "../../utils/Engine";

export default class UserInfoCommands extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "info",
      description: "User information commands",
      category: "",
      userPermission: [],
      botPermission: [],
      cooldown: 5,
      subcommands: {
        avatar: {
          description: "View a user's avatar",
          args: [
            {
              name: "user",
              description: "View this user's avatar",
              type: ApplicationCommandOptionType.User
            }
          ],
          execute: async ({ client, interaction }) => {
            const TargetUser =
              interaction.options.getUser("user", false) || interaction.user;

            const TargetMember = interaction.guild.members.cache.get(
              TargetUser.id
            );

            let AvatarURLs: string = `${hyperlink(
              "Avatar URL",
              TargetUser.displayAvatarURL({
                extension: "png"
              })
            )}`;

            const AvatarEmbed = new EmbedBuilder()
              .setTitle(`${capitalize(TargetUser.username)}'s Avatar`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setImage(
                TargetUser.displayAvatarURL({
                  extension: "png",
                  size: 1024
                })
              );

            const AvatarButtons: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setLabel("Avatar URL")
                  .setStyle(ButtonStyle.Link)
                  .setURL(
                    TargetUser.displayAvatarURL({
                      extension: "png"
                    })
                  )
              ]);

            if (
              TargetMember &&
              TargetMember.displayAvatarURL() !== TargetUser.displayAvatarURL()
            ) {
              AvatarEmbed.setThumbnail(
                TargetMember.displayAvatarURL({
                  extension: "png"
                })
              );

              AvatarURLs += ` ${hyperlink(
                "Server Avatar",
                TargetMember.displayAvatarURL({
                  extension: "png"
                })
              )}`;

              AvatarButtons.addComponents([
                new ButtonBuilder()
                  .setLabel("Server Avatar URL")
                  .setStyle(ButtonStyle.Link)
                  .setURL(
                    TargetMember.displayAvatarURL({
                      extension: "png"
                    })
                  )
              ]);
            }

            AvatarEmbed.setDescription(AvatarURLs);

            return interaction.reply({
              embeds: [AvatarEmbed],
              components: [AvatarButtons]
            });
          }
        },
        userinfo: {
          description: "Get information about a Discord user",
          args: [
            {
              name: "user",
              description: "View this user's information",
              type: ApplicationCommandOptionType.User
            }
          ],
          execute: async ({ client, interaction }) => {
            const TargetUser =
              interaction.options.getUser("user") || interaction.user;

            const TargetMember = interaction.guild.members.cache.get(
              TargetUser.id
            );

            const UserCreatedTimestamp = Math.round(
              TargetUser.createdTimestamp / 1000
            );

            if (!TargetMember) {
              const DiscordUser = new EmbedBuilder()
                .setAuthor({
                  name: `${TargetUser.username}`,
                  iconURL: TargetUser.displayAvatarURL()
                })
                .setThumbnail(
                  TargetUser.displayAvatarURL({
                    extension: "png"
                  })
                )
                .addFields(
                  {
                    name: "Joined Discord:",
                    value: `<t:${UserCreatedTimestamp}:F>, <t:${UserCreatedTimestamp}:R>`,
                    inline: true
                  },
                  {
                    name: "Username:",
                    value: `${TargetUser.username}`,
                    inline: true
                  },
                  {
                    name: "Account Type:",
                    value: `${TargetUser.bot ? "Bot" : "Human"}`,
                    inline: true
                  },
                  {
                    name: "ID:",
                    value: `${TargetUser.id}`,
                    inline: true
                  },
                  {
                    name: "\u200b",
                    value: "\u200b",
                    inline: true
                  },
                  {
                    name: "Profile URL:",
                    value: `${hyperlink(
                      TargetUser.username,
                      `https://discord.com/users/${TargetUser.id}`
                    )}`,
                    inline: true
                  }
                )
                .setColor(colors.DEFAULT as ColorResolvable)
                .setFooter({
                  text: `TIP: This command shows more information about server members`,
                  iconURL: `https://emoji.gg/assets/emoji/2487-badge-serverbooster9.png`
                });

              return interaction.reply({
                embeds: [DiscordUser]
              });
            }

            const trimArray = <T>(arr: T[], maxLen = 10): T[] => {
              if (arr.length > maxLen) {
                const len = arr.length - maxLen;
                arr = arr.slice(0, maxLen);
                arr.push(` and ${len} more role(s)...` as unknown as T);
              }
              return arr;
            };

            const TipMessages = [
              "The user color is clickable",
              "You can see which song the user is listening to",
              "If you click the song name it will take you to the song on Spotfiy",
              "Blue text means you can click it",
              `This command also works for user's outside of this server`,
              `If the user has the "Administrator" permission it will only show that in Key Permissions`,
              `This command works best for server members`,
              `The joined server and Discord timestamps are in UNIX which means they will update forever`,
              `We use a "smart" system, that means *some* fields will not show if empty to avoid clutter`,
              `If the user doesn't have any roles that field will not show`,
              `If you click the user ID it will take you to their profile`
            ];
            const DisplayTipMessage = chooseRandomFromArray(TipMessages);

            const BadgesMap = {
              "": "None",
              [UserFlags[UserFlags.ActiveDeveloper]]:
                "<:ActiveDeveloper:1118890582673215568>",
              [UserFlags[UserFlags.Staff]]: "<:D_Staff:826951574088581140>",
              [UserFlags[UserFlags.Partner]]: "<:D_Partner:826951266357608558>",
              [UserFlags[UserFlags.BugHunterLevel1]]:
                "<:D_BugHunter:826950777176195123>",
              [UserFlags[UserFlags.Hypesquad]]:
                "<:D_HypeSquadEvents:826950445695500358>",
              [UserFlags[UserFlags.HypeSquadOnlineHouse1]]:
                "<:D_Bravery:826950151444103178>",
              [UserFlags[UserFlags.HypeSquadOnlineHouse2]]:
                "<:D_Brilliance:826949675038801981>",
              [UserFlags[UserFlags.HypeSquadOnlineHouse3]]:
                "<:D_Balance:826948943178760212>",
              [UserFlags[UserFlags.PremiumEarlySupporter]]:
                "<:D_Earlysupporter:826949248607977474>",
              [UserFlags[UserFlags.VerifiedBot]]:
                "Verified Bot <:verifiedbot:972938255291015248>",
              [UserFlags[UserFlags.VerifiedDeveloper]]:
                "<:D_VerifBotDev:826952303042101288>",
              [UserFlags[UserFlags.BotHTTPInteractions]]: "",
              [UserFlags[UserFlags.TeamPseudoUser]]: "",
              [UserFlags[UserFlags.BugHunterLevel2]]:
                "<:bugHunter2:973146470494662677>",
              [UserFlags[UserFlags.CertifiedModerator]]:
                "<:certifiedMod:973146823814418492>"
            };

            const StatusesMap = {
              "": "None",
              "online": "<:online:934570010901377025> Online",
              "idle": "<:idle:934569895474114611> Idle",
              "dnd": "<:dnd:934569539776155718> Do Not Disturb",
              "streaming": "<:streaming:934569539054731324> Streaming",
              "offline": "<:invs:934569539197341717> Offline"
            };

            const DevicesMap = {
              "": "None",
              web: "🌐",
              desktop: "💻",
              mobile: "📱"
            };

            const StatusText = TargetMember.presence
              ? StatusesMap[TargetMember.presence.status]
              : "<:invs:934569539197341717> Offline";

            const UserDevice =
              TargetMember.presence &&
              !TargetUser.bot &&
              Object.keys(TargetMember.presence.clientStatus).length > 0
                ? DevicesMap[Object.keys(TargetMember.presence.clientStatus)[0]]
                : "";

            const UserJoinedServerTimestamp = Math.round(
              TargetMember.joinedTimestamp / 1000
            );

            const HighestRoleDisplay = TargetMember.roles.highest.id
              ? TargetMember.roles.highest.id === interaction.guild.id
                ? "@everyone"
                : `<@&${TargetMember.roles.highest.id}>`
              : "User Has No Roles";

            const UserRoles = trimArray(
              TargetMember.roles.cache
                .sort((a, b) => b.position - a.position)
                .map((role) => role.toString())
                .slice(0, -1)
            );

            const UserBadges =
              (await TargetMember.user.fetchFlags())
                .toArray()
                .map((flag) => BadgesMap[flag])
                .join(" ") || "None";

            const UserInfoEmbed = new EmbedBuilder()
              .setAuthor({
                name: `${TargetUser.username} ${UserDevice}`,
                iconURL: TargetUser.displayAvatarURL({})
              })
              .setColor(
                TargetMember.displayHexColor ??
                  (colors.DEFAULT as ColorResolvable)
              )
              .setThumbnail(
                TargetUser.displayAvatarURL({
                  extension: "png"
                })
              )
              .setFooter({
                text: `TIP: ${DisplayTipMessage}`,
                iconURL: `https://emoji.gg/assets/emoji/2487-badge-serverbooster9.png`
              })
              .addFields(
                {
                  name: "User Badges:",
                  value: `${UserBadges}`,
                  inline: false
                },
                {
                  name: "Joined Discord:",
                  value: `<t:${UserCreatedTimestamp}:F>, <t:${UserCreatedTimestamp}:R>`,
                  inline: true
                },
                {
                  name: "Joined Server:",
                  value: `<t:${UserJoinedServerTimestamp}:F>, <t:${UserJoinedServerTimestamp}:R>`,
                  inline: true
                },
                {
                  name: "Nickname:",
                  value: `${TargetMember.nickname || TargetUser.username}`,
                  inline: true
                },
                {
                  name: "Account Type:",
                  value: `${TargetUser.bot ? "Bot" : "Human"}`,
                  inline: true
                },
                {
                  name: "Color:",
                  value: `[${
                    TargetMember.displayHexColor
                  }](${`https://www.color-hex.com/color/${TargetMember.displayHexColor.slice(
                    1
                  )}`})`,
                  inline: true
                },
                {
                  name: "ID:",
                  value: `[${
                    TargetUser.id
                  }](${`https://discord.com/users/${TargetUser.id}`})`,
                  inline: true
                },
                {
                  name: "Highest Role:",
                  value: `${HighestRoleDisplay}`,
                  inline: true
                },
                {
                  name: "Status:",
                  value: `${StatusText}`,
                  inline: true
                }
              );

            if (UserRoles.length > 0)
              UserInfoEmbed.addFields({
                name: `Roles [${UserRoles.length}]:`,
                value: `${UserRoles}`,
                inline: false
              });

            const PublicAvatar = `[Public Avatar](${TargetUser.displayAvatarURL(
              { extension: "png" }
            )})`;
            const ServerAvatar = `[Server Avatar](${TargetUser.displayAvatarURL(
              { extension: "png" }
            )})`;

            const AvatarLinks =
              TargetMember.displayAvatarURL() !== TargetUser.displayAvatarURL()
                ? `${PublicAvatar} | ${ServerAvatar}`
                : PublicAvatar;

            UserInfoEmbed.setDescription(AvatarLinks);

            if (TargetMember.premiumSinceTimestamp !== null)
              UserInfoEmbed.addFields({
                name: `Boosting "${TargetMember.guild.name}" Since:`,
                value: `<t:${Math.round(
                  TargetMember.premiumSinceTimestamp / 1000
                )}:F>, <t:${Math.round(
                  TargetMember.premiumSinceTimestamp / 1000
                )}:R>`
              });

            if ((KeyPerms(TargetMember)[1] as number) > 0) {
              UserInfoEmbed.addFields({
                name: `Key Permissions [${KeyPerms(TargetMember)[1]}]:`,
                value: `${KeyPerms(TargetMember)[0]}`,
                inline: false
              });
            }

            const ActivitiesMessage = {
              1: "Playing",
              2: "Listening",
              3: "Watching",
              4: "Competing"
            };

            if (TargetMember.presence !== null && TargetUser.bot) {
              if (TargetMember.presence.activities.length > 0) {
                UserInfoEmbed.addFields({
                  name: `${
                    ActivitiesMessage[TargetMember.presence.activities[0].type]
                  }:`,
                  value: `${TargetMember.presence.activities[0].name}`,
                  inline: true
                });
              }
              if (TargetMember.presence.activities.length > 1) {
                UserInfoEmbed.addFields({
                  name: `${
                    ActivitiesMessage[TargetMember.presence.activities[1].type]
                  }:`,
                  value: `${TargetMember.presence.activities[1].name}`,
                  inline: true
                });
              }
            }

            if (TargetMember.presence !== null && !TargetUser.bot) {
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
                      if (
                        UserActivity.timestamps &&
                        UserActivity.timestamps?.start
                      ) {
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
              }
            }

            return interaction.reply({
              embeds: [UserInfoEmbed]
            });
          }
        },
        serverinfo: {
          description: "Show's information about this server",
          execute: async ({ client, interaction }) => {
            const TierMap = {
              [GuildPremiumTier.None]: "Tier 0",
              [GuildPremiumTier.Tier1]: "Tier 1",
              [GuildPremiumTier.Tier2]: "Tier 2",
              [GuildPremiumTier.Tier3]: "Tier 3"
            };

            const NSFWMap = {
              [GuildNSFWLevel.Default]: "Default",
              [GuildNSFWLevel.Safe]: "Safe",
              [GuildNSFWLevel.Explicit]: "Explicit",
              [GuildNSFWLevel.AgeRestricted]: "Age Restricted"
            };

            const VerificationMap = {
              [GuildVerificationLevel.None]: "Unrestricted",
              [GuildVerificationLevel.Low]:
                "Must have verified email on account",
              [GuildVerificationLevel.Medium]:
                "Must be registered on Discord for longer than 5 minutes",
              [GuildVerificationLevel.High]:
                "Must be a member of the server for longer than 10 minutes",
              [GuildVerificationLevel.VeryHigh]:
                "Must have a verified phone number"
            };

            const ServerInformationEmbed = new EmbedBuilder()
              .setTitle(`${interaction.guild.name}`)
              .setThumbnail(
                interaction.guild.iconURL() ?? "https://i.imgur.com/AWGDmiu.png"
              )
              .setDescription(
                `${interaction.guild.name} was created on ${`<t:${Math.round(
                  Math.round(interaction.guild.createdTimestamp) / 1000
                )}:F>`}`
              )
              .setColor(colors.DEFAULT as ColorResolvable)
              .addFields(
                {
                  name: "Total Members",
                  value: `${interaction.guild.memberCount.toLocaleString()}`,
                  inline: true
                },
                {
                  name: "Total Humans",
                  value: `${interaction.guild.members.cache
                    .filter((member) => !member.user.bot)
                    .size.toLocaleString()}`,
                  inline: true
                },
                {
                  name: "Total Bots",
                  value: `${interaction.guild.members.cache
                    .filter((member) => member.user.bot)
                    .size.toLocaleString()}`,
                  inline: true
                },
                {
                  name: "Categories",
                  value: `${
                    interaction.guild.channels.cache.filter(
                      (c) => c.type == ChannelType.GuildCategory
                    ).size
                  }`,
                  inline: true
                },
                {
                  name: "Text Channels",
                  value: `${
                    interaction.guild.channels.cache.filter(
                      (c) => c.type === ChannelType.GuildText
                    ).size
                  }`,
                  inline: true
                },
                {
                  name: "Voice Channels",
                  value: `${
                    interaction.guild.channels.cache.filter(
                      (c) => c.type === ChannelType.GuildVoice
                    ).size
                  }`,
                  inline: true
                },
                {
                  name: "Role Count",
                  value: `${interaction.guild.roles.cache.size.toLocaleString()}`,
                  inline: true
                },
                {
                  name: "Boosts",
                  value: `${interaction.guild.premiumSubscriptionCount}`,
                  inline: true
                },
                {
                  name: "Boost Tier",
                  value: `${TierMap[interaction.guild.premiumTier]}`,
                  inline: true
                },
                {
                  name: "Explicit Content Filter",
                  value: `${NSFWMap[interaction.guild.nsfwLevel]}`,
                  inline: true
                },
                {
                  name: "Verification Level",
                  value: `${
                    VerificationMap[interaction.guild.verificationLevel]
                  }`,
                  inline: true
                },
                {
                  name: "AFK Channel",
                  value: `${interaction.guild.afkChannel ?? "None"}`,
                  inline: true
                },
                {
                  name: "AFK Timeout",
                  value: interaction.guild.afkChannel
                    ? `${msToTime(interaction.guild.afkTimeout * 1000)}`
                    : "None",
                  inline: true
                },
                {
                  name: "Owner",
                  value: `<@${interaction.guild.ownerId}>`,
                  inline: true
                },
                {
                  name: "Region",
                  value: `${interaction.guild.preferredLocale}`,
                  inline: true
                }
              )
              .setFooter({
                text: `Server ID: ${interaction.guild.id}`,
                iconURL: interaction.guild.iconURL()
              });

            if (interaction.guild.description)
              ServerInformationEmbed.addFields({
                name: "Server Description",
                value: `${interaction.guild.description ?? "No description"}`,
                inline: true
              });

            if (interaction.guild.bannerURL())
              ServerInformationEmbed.addFields({
                name: "Server Banner",
                value: `[Banner URL](${interaction.guild.bannerURL()})`,
                inline: true
              });

            function formatFeatures(arr: string[]): string {
              return arr
                .map((str) => {
                  const lowercased = str.toLowerCase();
                  const replaced = lowercased.replace(/_/g, " ");
                  const words = replaced.split(" ");
                  const formattedWords = words.map((word) => {
                    return word.charAt(0).toUpperCase() + word.slice(1);
                  });
                  return formattedWords.join(" ");
                })
                .join(", ");
            }

            if (interaction.guild.features.length > 0) {
              const GuildFeatures = formatFeatures(interaction.guild.features);
              ServerInformationEmbed.addFields({
                name: "Features",
                value: `${GuildFeatures}`
              });
            }
            return interaction.reply({
              embeds: [ServerInformationEmbed]
            });
          }
        }
      }
    });
  }
}
