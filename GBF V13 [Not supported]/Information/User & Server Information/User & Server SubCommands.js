const SlashCommand = require("../../utils/slashCommands");

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Permissions
} = require("discord.js");

const title = require("../../gbfembedmessages.json");
const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

const fetch = require("node-fetch");
const axios = require("axios");

const ms = require("ms");
const moment = require("moment");
const duration = require("humanize-duration");

const {
  capitalizeFirstLetter,
  capitalize,
  KeyPerms,
  BMIImperial,
  BMIMetric,
  BMIScale
} = require("../../utils/engine");
module.exports = class UserStuff extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "info",
      description:
        "Get general information about user/bot/server related stuff",
      category: "Utility",
      botPermission: ["SEND_MESSAGES", "EMBED_LINKS"],
      cooldown: 2,
      development: false,
      subcommands: {
        avatar: {
          description: "Get the avatar of a user or your own avatar",
          args: [
            {
              name: "user",
              description: "The member that you want to get their avatar",
              type: "USER",
              required: false
            }
          ],
          execute: async ({ client, interaction }) => {
            const mentionedUser =
              interaction.options.getUser("user") || interaction.user;
            const avatarUserButton = new MessageButton()
              .setStyle("LINK")
              .setLabel(`Public Avatar link`)
              .setURL(
                `${mentionedUser.displayAvatarURL({
                  format: "png",
                  dynamic: true,
                  size: 1024
                })}`
              );

            const avatarEmbed = new MessageEmbed()
              .setTitle(`${mentionedUser.tag}'s avatar`)
              .setDescription(
                `[Avatar URL](${mentionedUser.displayAvatarURL({
                  dynamic: true,
                  size: 1024
                })})`
              )
              .setColor("#e91e63")
              .setFooter({
                text: `Requested By: ${interaction.user.tag}`,
                iconURL: `${interaction.user.displayAvatarURL()}`
              })
              .setImage(
                mentionedUser.displayAvatarURL({
                  format: "png",
                  dynamic: true,
                  size: 1024
                })
              );

            const fetchedMember = interaction.guild.members.cache.get(
              mentionedUser.id
            );

            const avatarMemberButton = new MessageButton();

            if (
              fetchedMember &&
              mentionedUser.displayAvatarURL() !==
                fetchedMember.displayAvatarURL()
            ) {
              avatarMemberButton.setStyle("LINK");
              avatarMemberButton.setLabel(`Server Avatar link`);
              avatarMemberButton.setURL(
                fetchedMember.displayAvatarURL({
                  dynamic: true
                })
              );
              avatarEmbed.setDescription(
                `[Avatar URL](${mentionedUser.displayAvatarURL({
                  dynamic: true,
                  size: 1024
                })})\n[Server Avatar URL](${fetchedMember.displayAvatarURL({
                  dynamic: true,
                  size: 1024
                })})`
              );
              avatarEmbed.setThumbnail(
                fetchedMember.displayAvatarURL({
                  dynamic: true
                })
              );
            } else {
              avatarMemberButton.setStyle("LINK");
              avatarMemberButton.setLabel("Server Avatar");
              avatarMemberButton.setDisabled(true);
              avatarMemberButton.setURL(
                `https://discordapp.com/assets/bc1qre8jdw2azrg6tf49wmp652w00xltddxmpk98xp.png`
              );
            }

            const buttonRows = new MessageActionRow().addComponents([
              avatarUserButton,
              avatarMemberButton
            ]);

            return interaction.reply({
              embeds: [avatarEmbed],
              components: [buttonRows]
            });
          }
        },
        userinfo: {
          description: "Get information about a server member",
          args: [
            {
              name: "user",
              description: "The member that you want to get their avatar",
              type: "USER",
              required: false
            }
          ],
          execute: async ({ client, interaction }) => {
            const user =
              interaction.options.getUser("user") || interaction.user;

            const TargetUser = interaction.guild.members.cache.get(user.id);

            const UserCreated = Math.round(user.createdTimestamp / 1000);

            if (TargetUser === undefined) {
              const NotInServer = new MessageEmbed()
                .setAuthor({
                  name: `${user.tag}`,
                  iconURL: user.displayAvatarURL({
                    dynamic: true
                  })
                })
                .setColor(colours.DEFAULT)
                .addFields(
                  {
                    name: "Joined Discord:",
                    value: `<t:${UserCreated}:F>, <t:${UserCreated}:R>`,
                    inline: true
                  },
                  {
                    name: "Username:",
                    value: `${user.username}`,
                    inline: true
                  },
                  {
                    name: "Tag:",
                    value: `#${user.discriminator}`,
                    inline: true
                  },
                  {
                    name: "Account Type:",
                    value: `${user.bot ? "Bot" : "Human"}`,
                    inline: true
                  },
                  {
                    name: "ID:",
                    value: `${user.id}`,
                    inline: true
                  },
                  {
                    name: "Profile URL:",
                    value: `[${
                      user.tag
                    }](${`https://discord.com/users/${user.id}`})`,
                    inline: true
                  }
                )
                .setThumbnail(
                  user.displayAvatarURL({
                    dynamic: true
                  })
                )
                .setFooter({
                  text: `TIP: This command shows more information about server members`,
                  iconURL: `https://emoji.gg/assets/emoji/2487-badge-serverbooster9.png`
                });
              return interaction.reply({
                embeds: [NotInServer]
              });
            }
            const titleCase = (str) => {
              return str
                .toLowerCase()
                .split(" ")
                .map(
                  (word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`
                )
                .join(" ");
            };

            let trimArray = (arr, maxLen = 10) => {
              if (arr.length > maxLen) {
                const len = arr.length - maxLen;
                arr = arr.slice(0, maxLen);
                arr.push(` and ${len} more role(s)...`);
              }
              return arr;
            };

            function keyPerms(role) {
              let KeyPermissions = [];
              if (role.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
                KeyPermissions.push("Administrator");
              else {
                if (role.permissions.has(Permissions.FLAGS.MANAGE_GUILD))
                  KeyPermissions.push(`Manage Server`);
                if (role.permissions.has(Permissions.FLAGS.MANAGE_ROLES))
                  KeyPermissions.push(`Manage Roles`);
                if (role.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS))
                  KeyPermissions.push(`Manage Channels`);
                if (role.permissions.has(Permissions.FLAGS.KICK_MEMBERS))
                  KeyPermissions.push(`Kick Members`);
                if (role.permissions.has(Permissions.FLAGS.BAN_MEMBERS))
                  KeyPermissions.push(`Ban Members`);
                if (role.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES))
                  KeyPermissions.push(`Manage Nicknames`);
                if (
                  role.permissions.has(
                    Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS
                  )
                )
                  KeyPermissions.push(`Manage Emojis & Stickers`);
                if (role.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES))
                  KeyPermissions.push(`Manage Messages`);
                if (role.permissions.has(Permissions.FLAGS.MENTION_EVERYONE))
                  KeyPermissions.push(`Mention Everyone`);
                if (role.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS))
                  KeyPermissions.push(`Moderate Members`);
              }
              return KeyPermissions;
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
              "DISCORD_CERTIFIED_MODERATOR":
                "<:certifiedMod:973146823814418492>"
            };

            const STATUSES = {
              "": "None",
              "online": "<:online:934570010901377025>",
              "idle": "<:idle:934569895474114611>",
              "dnd": "<:dnd:934569539776155718>",
              "streaming": "<:streaming:934569539054731324>",
              "offline": "<:invs:934569539197341717>"
            };

            const DEVICES = {
              "": "None",
              web: "🌐",
              desktop: "💻",
              mobile: "📱"
            };

            let status;
            let statusText;
            if (TargetUser.presence !== null) {
              if (TargetUser.presence.status === "dnd") {
                status = "<:dnd:934569539776155718>";
                statusText = "Do Not Disturb";
              } else {
                status = STATUSES[TargetUser.presence.status];
                statusText = titleCase(TargetUser.presence.status);
              }
            } else {
              statusText = "Offline";
              status = `<:invs:934569539197341717>`;
            }

            let userDevice;
            if (TargetUser.presence !== null) {
              if (TargetUser.presence.status === "offline" || user.bot) {
                userDevice = "";
              } else if (!user.bot) {
                userDevice =
                  DEVICES[Object.keys(TargetUser.presence.clientStatus)[0]];
              }
            } else userDevice = "";

            const UserJoinedServer = Math.round(
              TargetUser.joinedTimestamp / 1000
            );
            let HighestRoleDisplay;
            const HighestRole = TargetUser.roles.highest.id;

            if (!HighestRole) HighestRoleDisplay = "User Has No Roles";
            if (HighestRole === interaction.guild.id)
              HighestRoleDisplay = `@everyone`;
            else HighestRoleDisplay = `<@&${HighestRole}>`;

            const userRoles = TargetUser.roles.cache
              .sort((a, b) => b.position - a.position)
              .map((role) => role.toString())
              .slice(0, -1);
            const UserRolesTrimmed = trimArray(
              TargetUser.roles.cache
                .sort((a, b) => b.position - a.position)
                .map((role) => role.toString())
                .slice(0, -1)
            );

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
            const DisplayTipMessage =
              TipMessages[Math.floor(Math.random() * TipMessages.length)];

            let AccountType;
            if (user.bot === false) AccountType = "Human";
            else AccountType = "Bot";

            const userFlags = (await TargetUser.user.fetchFlags()).toArray();

            const UserInfoEmbed = new MessageEmbed()
              .setAuthor({
                name: `${user.tag} ${userDevice}`,
                iconURL: TargetUser.displayAvatarURL({
                  dynamic: true
                })
              })
              .setColor(TargetUser.displayHexColor ?? "#e91e63")
              .setThumbnail(
                TargetUser.displayAvatarURL({
                  dynamic: true
                })
              )
              .setFooter({
                text: `TIP: ${DisplayTipMessage}`,
                iconURL: `https://emoji.gg/assets/emoji/2487-badge-serverbooster9.png`
              })
              .addFields(
                {
                  name: "User Badges:",
                  value: `${
                    userFlags.map((flag) => BADGES[flag]).join(" ") || "None"
                  }`,
                  inline: false
                },
                {
                  name: "Joined Discord:",
                  value: `<t:${UserCreated}:F>, <t:${UserCreated}:R>`,
                  inline: true
                },
                {
                  name: "Joined Server:",
                  value: `<t:${UserJoinedServer}:F>, <t:${UserJoinedServer}:R>`,
                  inline: true
                },
                {
                  name: "Nickname:",
                  value: `${TargetUser.nickname || user.username}`,
                  inline: true
                },
                {
                  name: "Tag:",
                  value: `#${user.discriminator}`,
                  inline: true
                },
                {
                  name: "Account Type:",
                  value: `${AccountType}`,
                  inline: true
                },
                {
                  name: "Color:",
                  value: `[${
                    TargetUser.displayHexColor
                  }](${`https://www.color-hex.com/color/${TargetUser.displayHexColor.slice(
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
                  value: `${status} ${statusText}`,
                  inline: true
                }
              );

            const url = `https://discord.com/api/users/${TargetUser.id}`;

            await axios
              .get(url, {
                headers: {
                  Authorization: `Bot ${client.token}`
                }
              })
              .then(async (res) => {
                const { banner } = res.data;
                if (banner) {
                  const extension = banner.startsWith("a_") ? "gif" : "png";
                  const BannerURL = `https://cdn.discordapp.com/banners/${user.id}/${banner}.${extension}?size=4096`;
                  UserInfoEmbed.setImage(BannerURL);
                }
              });

            if (userRoles.length > 0) {
              UserInfoEmbed.addFields({
                name: `Roles [${userRoles.length}]:`,
                value: `${UserRolesTrimmed}`,
                inline: false
              });
            }
            let embedDescription;
            if (TargetUser.displayAvatarURL() !== user.displayAvatarURL())
              embedDescription = `[Public Avatar](${user.displayAvatarURL({
                dynamic: true
              })}) | [Server Avatar](${TargetUser.displayAvatarURL({
                dynamic: true
              })})`;
            else
              embedDescription = `[Public Avatar](${user.displayAvatarURL({
                dynamic: true
              })})`;
            UserInfoEmbed.setDescription(embedDescription);

            if (TargetUser.premiumSinceTimestamp !== null)
              UserInfoEmbed.addFields({
                name: `Boosting "${TargetUser.guild}" Since:`,
                value: `<t:${Math.round(
                  TargetUser.premiumSinceTimestamp / 1000
                )}:F>, <t:${Math.round(
                  TargetUser.premiumSinceTimestamp / 1000
                )}:R>`
              });

            if (keyPerms(TargetUser).length > 0) {
              UserInfoEmbed.addFields({
                name: `Key Permissions [${keyPerms(TargetUser).length}]:`,
                value: `${keyPerms(TargetUser).join(", ") || "None"}`,
                inline: false
              });
            }

            if (TargetUser.presence !== null && user.bot === true) {
              if (TargetUser.presence.activities.length > 0) {
                UserInfoEmbed.addFields({
                  name: `${capitalize(
                    TargetUser.presence.activities[0].type
                  )}:`,
                  value: `${TargetUser.presence.activities[0].name}`,
                  inline: true
                });
              }
              if (TargetUser.presence.activities.length > 1) {
                UserInfoEmbed.addFields({
                  name: `${capitalize(
                    TargetUser.presence.activities[1].type
                  )}:`,
                  value: `${TargetUser.presence.activities[1].name}`,
                  inline: true
                });
              }
            }
            try {
              if (TargetUser.presence !== null && user.bot === false) {
                for (
                  let i = 0;
                  i < TargetUser.presence.activities.length;
                  i++
                ) {
                  let FirstName; //Application name Ex: League, Spotfiy, etc
                  let StatusState; //Status itself like "Hello World" or "Playing Overwatch", "In Game", etc
                  let FirstEmoji; //Emoji next to the status
                  if (TargetUser.presence.activities[i].type === "CUSTOM") {
                    FirstName = TargetUser.presence.activities[i].name; //Custom Status
                    StatusState = TargetUser.presence.activities[i].state ?? ""; //The status
                    FirstEmoji = TargetUser.presence.activities[i].emoji ?? ""; //Emoji
                    UserInfoEmbed.addFields({
                      name: `${FirstName}:`,
                      value: `${FirstEmoji} ${StatusState}`,
                      inline: true
                    });
                  } else if (
                    TargetUser.presence.activities[i].type === "LISTENING"
                  ) {
                    let TrackName;
                    let AlbumName;
                    let Artist;
                    let AppEmoji;
                    let SongEndedTimeStamp;
                    FirstName = TargetUser.presence.activities[i].name; //Spotfiy etc
                    TrackName = TargetUser.presence.activities[i].details; //Song name
                    AlbumName =
                      TargetUser.presence.activities[i].assets.largeText; //Album Name
                    if (
                      TargetUser.presence.activities[i].timestamps !== null &&
                      TargetUser.presence.activities[i].timestamps.end !== null
                    ) {
                      const ends = new Date(
                        TargetUser.presence.activities[i].timestamps.end
                      ).getTime();
                      const now = new Date();
                      SongEndedTimeStamp = duration(ends - now, {
                        units: ["y", "mo", "w", "d", "h", "m", "s"],
                        round: true
                      });
                    } else SongEndedTimeStamp = `Just Ended`;
                    Artist = TargetUser.presence.activities[i].state; //Artist name
                    if (FirstName === "Spotify")
                      AppEmoji = `<:Spotify:962905037649096815>`;
                    else AppEmoji = `🎧`;
                    if (Artist.includes(";")) {
                      Artist = Artist.split(";").join(", ");
                    }

                    UserInfoEmbed.addFields({
                      name: `Listening to ${FirstName} ${AppEmoji}:`,
                      value: `**[${TrackName}](${`https://open.spotify.com/search/${TrackName.split(
                        " "
                      ).join(
                        "%20"
                      )}`})**\nby ${Artist}\non [${AlbumName}](${`https://open.spotify.com/search/${AlbumName.split(
                        " "
                      ).join("%20")}`})\nTrack ends in: ${SongEndedTimeStamp}`,
                      inline: true
                    });
                  } else if (
                    TargetUser.presence.activities[i].type === "PLAYING"
                  ) {
                    let GameName; //League of legends etc
                    let GameDetails; //Customs, etc
                    let GameState; //In queue, in game etc
                    let EndsIn; //1 minute ago etc
                    let StartedPlaying;
                    GameName = TargetUser.presence.activities[i].name;
                    GameDetails =
                      TargetUser.presence.activities[i].details ?? "";
                    GameState = TargetUser.presence.activities[i].state ?? "";

                    if (GameName === "YouTube") {
                      if (!TargetUser.presence.activities[i].state) {
                        if (
                          TargetUser.presence.activities[i].timestamps !==
                            null &&
                          TargetUser.presence.activities[i].timestamps.start !==
                            null
                        ) {
                          const StartedPlayingTimeStamp = new Date(
                            TargetUser.presence.activities[i].timestamps.start
                          ).getTime();
                          const now = new Date();
                          StartedPlaying = duration(
                            StartedPlayingTimeStamp - now,
                            {
                              units: ["y", "mo", "w", "d", "h", "m", "s"],
                              round: true
                            }
                          );
                        } else StartedPlaying = `Just Started`;
                        UserInfoEmbed.addFields({
                          name: `Watching YouTube <:YouTube:962905816833327124>:`,
                          value: `${GameDetails} for: ${StartedPlaying}`
                        });
                      } else {
                        let EndsInTxt;
                        if (
                          TargetUser.presence.activities[i].timestamps !==
                            null &&
                          TargetUser.presence.activities[i].timestamps.end !==
                            null
                        ) {
                          const ends = new Date(
                            TargetUser.presence.activities[i].timestamps.end
                          ).getTime();
                          const now = new Date();
                          EndsIn = duration(ends - now, {
                            units: ["y", "mo", "w", "d", "h", "m", "s"],
                            round: true
                          });
                          EndsInTxt = `Video Ends In:`;
                        } else {
                          if (
                            TargetUser.presence.activities[i].assets
                              .smallText === "Live"
                          ) {
                            EndsIn = "Live Stream [No Known End Time]";
                            EndsInTxt = `Ends In:`;
                          } else {
                            EndsIn = "Just Ended";
                            EndsInTxt = `Video `;
                          }
                        }
                        let videoState =
                          TargetUser.presence.activities[i].assets.smallText;
                        UserInfoEmbed.addFields({
                          name: `Watching YouTube <:YouTube:962905816833327124>:`,
                          value: `**Video:** ${GameDetails}\n**Channel:** ${GameState}\n**Video Status:** ${videoState}\n**${EndsInTxt}** ${EndsIn}`
                        });
                      }
                    } else {
                      let PlayTimeTxt;
                      if (
                        TargetUser.presence.activities[i].timestamps !== null &&
                        TargetUser.presence.activities[i].timestamps.start !==
                          null
                      ) {
                        const StartedPlayingTimeStamp = new Date(
                          TargetUser.presence.activities[i].timestamps.start
                        ).getTime();
                        const now = new Date();
                        StartedPlaying = duration(
                          StartedPlayingTimeStamp - now,
                          {
                            units: ["y", "mo", "w", "d", "h", "m", "s"],
                            round: true
                          }
                        );
                        PlayTimeTxt = `Current Session:`;
                      } else if (
                        (TargetUser.presence.activities[i].timestamps !==
                          null &&
                          TargetUser.presence.activities[i].timestamps
                            ?.start === null) ||
                        TargetUser.presence.activities[i].timestamps?.end !==
                          null
                      ) {
                        StartedPlaying = "";
                        PlayTimeTxt = `In-Game`;
                      } else {
                        StartedPlaying = "Just Started";
                        PlayTimeTxt = `Current Session:`;
                      }

                      if (GameDetails !== "" && GameState !== "") {
                        UserInfoEmbed.addFields({
                          name: `Playing ${GameName}:`,
                          value: `🕑 ${PlayTimeTxt} ${StartedPlaying}\n\n${GameDetails}\n${GameState}`,
                          inline: true
                        });
                      } else {
                        UserInfoEmbed.addFields({
                          name: `Playing ${GameName}:`,
                          value: `${PlayTimeTxt} ${StartedPlaying}`,
                          inline: true
                        });
                      }
                    }
                  } else {
                    UserInfoEmbed.addFields({
                      name: `${capitalize(
                        TargetUser.presence.activities[0].type
                      )}:`,
                      value: `${TargetUser.presence.activities[0].name}`
                    });
                  }
                }
              }
            } catch (err) {
              console.log(
                `I ran into an error in the userInfo command: ${err}`
              );
              return interaction.reply({
                content: `I ran into an error ${emojis.ERROR}\nI've already reported the error to my developers!`
              });
            }
            return interaction.reply({
              embeds: [UserInfoEmbed]
            });
          }
        },
        bmi: {
          description: "Calculates BMI",
          args: [
            {
              name: "units",
              type: "STRING",
              description: `The unit of your choice`,
              choices: [
                {
                  name: "Metric",
                  value: "Metric"
                },
                {
                  name: "Imperial",
                  value: "Imperial"
                }
              ],
              required: true
            },
            {
              name: "weight",
              type: "NUMBER",
              minValue: 0,
              description: `Please use KG or LB depending on the unit chosen`,
              required: true
            },
            {
              name: "height",
              type: "NUMBER",
              minValue: 0,
              description: `Please use Meter or Inch depending on the unit chosen`,
              required: true
            },
            {
              name: "private",
              type: "STRING",
              description: `If true then only you can see the message and no one will know you ever ran the command`,
              choices: [
                {
                  name: "True",
                  value: "True"
                },
                {
                  name: "False",
                  value: "False"
                }
              ],
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const unitSystem = interaction.options.getString("units");
            const userWeight = interaction.options.getNumber("weight");
            const userHeight = interaction.options.getNumber("height");
            const userPrivacyChoice = interaction.options.getString("private");

            let PrivacySetting;
            if (userPrivacyChoice === "True") PrivacySetting = true;
            else PrivacySetting = false;

            if (unitSystem === "Imperial") {
              const InvalidNumbers = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setColor(colours.ERRORRED)
                .setDescription(
                  `The values that you've entered are unrealistic`
                )
                .setFooter({
                  text: `This is not 100% accurate so it's recommended to vist a medical professional for more accurate results`
                });

              if (userHeight <= 0 || userWeight <= 0)
                return interaction.reply({
                  embeds: [InvalidNumbers],
                  ephemeral: true
                });

              const BMIAmerica = BMIImperial(userWeight, userHeight).toFixed(1);

              const ScaleResult = BMIScale(BMIAmerica);

              const UnrealisticBMI = new MessageEmbed()
                .setTitle(title.ERROR)
                .setColor(colours.ERRORRED)
                .setDescription(`Unrealistic BMI`)
                .setFooter({
                  text: `This is not 100% accurate so it's recommended to vist a medical professional for more accurate results`
                });

              if (BMIAmerica < 10 || BMIAmerica > 50) {
                return interaction.reply({
                  embeds: [UnrealisticBMI],
                  ephemeral: true
                });
              }
              const ImpEmbed = new MessageEmbed()
                .setTitle(`${emojis.VERIFY} Estimated BMI`)
                .setColor(colours.DEFAULT)
                .addFields(
                  {
                    name: "Weight:",
                    value: `${userWeight} Pounds (Lbs)`,
                    inline: true
                  },
                  {
                    name: "Height:",
                    value: `${userHeight} Inches`,
                    inline: true
                  },
                  {
                    name: "System used:",
                    value: unitSystem,
                    inline: true
                  },
                  {
                    name: "BMI:",
                    value: BMIAmerica,
                    inline: true
                  },
                  {
                    name: "\u200b",
                    value: `u200b`,
                    inline: true
                  },
                  {
                    name: "Weight Status:",
                    value: ScaleResult,
                    inline: true
                  }
                )
                .setFooter({
                  text: `Requested by: ${interaction.user.username}`,
                  iconURL: interaction.user.displayAvatarURL()
                });
              return interaction.reply({
                embeds: [ImpEmbed],
                ephemeral: PrivacySetting
              });
            } else {
              const InvalidNumbers = new MessageEmbed()
                .setTitle(`${emojis.ERROR} You can't do that`)
                .setColor(colours.ERRORRED)
                .setDescription(
                  `The values that you've entered are unrealistic`
                )
                .setFooter({
                  text: `This is not 100% accurate so it's recommended to vist a medical professional for more accurate results`
                });

              if (userHeight <= 0 || userWeight <= 0)
                return interaction.reply({
                  embeds: [InvalidNumbers],
                  ephemeral: true
                });

              const BMI = BMIMetric(userWeight, userHeight).toFixed(1);

              const ScaleResult = BMIScale(BMI);

              const UnrealisticBMI = new MessageEmbed()
                .setTitle(title.ERROR)
                .setColor(colours.ERRORRED)
                .setDescription(`Unrealistic BMI`)
                .setFooter({
                  text: `This is not 100% accurate so it's recommended to vist a medical professional for more accurate results`
                });

              if (BMI < 10 || BMI > 50) {
                return interaction.reply({
                  embeds: [UnrealisticBMI],
                  ephemeral: true
                });
              }
              const MetEmbed = new MessageEmbed()
                .setTitle(`${emojis.VERIFY} Estimated BMI`)
                .setColor(colours.DEFAULT)
                .addFields(
                  {
                    name: "Weight:",
                    value: `${userWeight} Kilograms (Kg)`,
                    inline: true
                  },
                  {
                    name: "Height:",
                    value: `${userHeight} Meters`,
                    inline: true
                  },
                  {
                    name: "System used:",
                    value: unitSystem,
                    inline: true
                  },
                  {
                    name: "BMI:",
                    value: BMI,
                    inline: true
                  },
                  {
                    name: "\u200b",
                    value: `\u200b`,
                    inline: true
                  },
                  {
                    name: "Weight Status:",
                    value: ScaleResult,
                    inline: true
                  }
                )
                .setFooter({
                  text: `Requested by: ${interaction.user.username}`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [MetEmbed],
                ephemeral: PrivacySetting
              });
            }
          }
        },
        serverinfo: {
          description: "Show's information about the current server",
          execute: async ({ client, interaction }) => {
            const boosttier = {
              "NONE": "0",
              "TIER_1": "1",
              "TIER_2": "2",
              "TIER_3": "3"
            };

            const titleCase = (str) => {
              return str
                .toLowerCase()
                .replace(/_/g, " ")
                .split(" ")
                .map(
                  (word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`
                )
                .join(" ");
            };

            const ServerInformationEmbed = new MessageEmbed()
              .setTitle(`${interaction.guild.name}`)
              .setThumbnail(
                interaction.guild.iconURL({
                  dynamic: true
                }) ?? "https://i.imgur.com/AWGDmiu.png"
              )
              .setDescription(
                `${interaction.guild.name} was created on ${`<t:${Math.round(
                  new Date(interaction.guild.createdTimestamp) / 1000
                )}:F>`}`
              )
              .setColor(colours.DEFAULT)
              .addFields(
                {
                  name: "Total Members",
                  value: `${interaction.guild.memberCount}`,
                  inline: true
                },
                {
                  name: "Total Humans",
                  value: `${
                    interaction.guild.members.cache.filter(
                      (member) => !member.user.bot
                    ).size
                  }`,
                  inline: true
                },
                {
                  name: "Total Bots",
                  value: `${
                    interaction.guild.members.cache.filter(
                      (member) => member.user.bot
                    ).size
                  }`,
                  inline: true
                },
                {
                  name: "Categories",
                  value: `${
                    interaction.guild.channels.cache.filter(
                      (c) => c.type == "GUILD_CATEGORY"
                    ).size
                  }`,
                  inline: true
                },
                {
                  name: "Text Channels",
                  value: `${
                    interaction.guild.channels.cache.filter(
                      (c) => c.type === "GUILD_TEXT"
                    ).size
                  }`,
                  inline: true
                },
                {
                  name: "Voice Channels",
                  value: `${
                    interaction.guild.channels.cache.filter(
                      (c) => c.type === "GUILD_VOICE"
                    ).size
                  }`,
                  inline: true
                },
                {
                  name: "Role Count",
                  value: `${interaction.guild.roles.cache.size}`,
                  inline: true
                },
                {
                  name: "Boosts",
                  value: `${interaction.guild.premiumSubscriptionCount}`,
                  inline: true
                },
                {
                  name: "Boost Tier",
                  value: `${boosttier[interaction.guild.premiumTier]}`,
                  inline: true
                },
                {
                  name: "Explicit Content Filter",
                  value: `${titleCase(
                    interaction.guild.explicitContentFilter
                  )}`,
                  inline: true
                },
                {
                  name: "Verification Level",
                  value: `${titleCase(interaction.guild.verificationLevel)}`,
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
                    ? `${moment
                        .duration(interaction.guild.afkTimeout * 1000)
                        .asMinutes()} minute(s)`
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

            if (interaction.guild.description) {
              ServerInformationEmbed.addFields({
                name: "Server Description",
                value: `${interaction.guild.description ?? "No description"}`,
                inline: true
              });
            }

            if (interaction.guild.bannerURL()) {
              ServerInformationEmbed.addFields({
                name: "Server Banner",
                value: `[Banner URL](${interaction.guild.bannerURL()})`,
                inline: true
              });
            }

            if (interaction.guild.features.length > 0) {
              let guildFeatures = ``;
              for (let i = 0; i < interaction.guild.features.length; i++) {
                guildFeatures =
                  guildFeatures + `${interaction.guild.features[i]}, `;
              }
              ServerInformationEmbed.addFields({
                name: "Server Features",
                value: `${capitalize(guildFeatures)}`,
                inline: false
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
};
