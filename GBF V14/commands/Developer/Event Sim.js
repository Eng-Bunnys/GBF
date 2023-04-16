const SlashCommand = require("../../utils/slashCommands");

const emojis = require("../../GBF/GBFEmojis.json");

const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  Events
} = require("discord.js");

module.exports = class SimEvents extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "simulate",
      description: "Simulate events || Dev only",
      category: "Dev",
      userPermission: [],
      botPermission: [PermissionFlagsBits.SendMessages],
      cooldown: 0,
      development: true,
      devOnly: true,
      subcommands: {
        join: {
          description: "Simulate guildMemberAdd event",
          execute: async ({ client, interaction }) => {
            client.emit(Events.GuildMemberAdd, interaction.member);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated User Join`
            });
          }
        },
        leave: {
          description: "Simulate guildMemberRemove event",
          execute: async ({ client, interaction }) => {
            client.emit(Events.GuildMemberRemove, interaction.member);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated User Leave`
            });
          }
        },
        channelcreate: {
          description: "Simulate channelCreate event",

          execute: async ({ client, interaction }) => {
            client.emit(Events.ChannelCreate, interaction.channel);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Channel Create`
            });
          }
        },
        channeldelete: {
          description: "Simulate channelDelete event",

          execute: async ({ client, interaction }) => {
            client.emit(Events.ChannelDelete, interaction.channel);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Channel Delete`
            });
          }
        },
        channelupdate: {
          description: "Simulate channelUpdate event",

          execute: async ({ client, interaction }) => {
            client.emit(Events.ChannelUpdate, interaction.channel);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Channel Update`
            });
          }
        },
        freebie: {
          description: "Simulate freebieSend event",
          args: [
            {
              name: "launcher",
              type: ApplicationCommandOptionType.String,
              description: "The launcher of the freebie",
              choices: [
                {
                  name: "Epic Games",
                  value: "EPIC"
                },
                {
                  name: "Steam",
                  value: "STEAM"
                },
                {
                  name: "GOG",
                  value: "GOG"
                },
                {
                  name: "Origin",
                  value: "EA"
                },
                {
                  name: "Ubisoft",
                  value: "UBI"
                },
                {
                  name: "Prime Gaming",
                  value: "PRIME"
                }
              ],
              required: true
            },
            {
              name: "number",
              type: ApplicationCommandOptionType.Integer,
              description: "The number of games in the freebie",
              maxValue: 3,
              minValue: 1,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            client.emit(
              "freebieSend",
              interaction.options.getString("launcher"),
              interaction.options.getInteger("number"),
              interaction.user
            );
            return interaction.reply({
              content: `${
                emojis.VERIFY
              } Simulated Freebie Send [${interaction.options.getString(
                "launcher"
              )} - ${interaction.options.getInteger("number")}]`
            });
          }
        },
        guilddelete: {
          description: "Simulate guildDelete event",
          execute: async ({ client, interaction }) => {
            client.emit(Events.GuildDelete, interaction.guild);
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Guild Delete`
            });
          }
        },
        levelup: {
          description: "Simulate playerLevelUp event",
          execute: async ({ client, interaction }) => {
            client.emit(
              "playerLevelUp",
              interaction,
              [
                {
                  "_id": {
                    "$oid": "63d2c8d10bc9ada7e8e7f2b5"
                  },
                  "seasonLevel": 9,
                  "seasonXP": 4160,
                  "accountXP": 2160,
                  "accountLevel": 7,
                  "startTime": [
                    20, 19, 17, 17, 13, 14, 15, 18, 19, 16, 21, 13, 18, 19
                  ],
                  "intiationTime": null,
                  "numberOfStarts": 13,
                  "timeSpent": 54276.073,
                  "longestSessionTime": 9503.515,
                  "sessionLengths": [
                    54.54, 5236.97, 1097.44, 2829.07, 3992.63, 2358.03, 650.1,
                    6662.89, 1422.93, 7324.62, 4304.24, 6281.59
                  ],
                  "breakTime": 10464.412,
                  "totalBreaks": 15,
                  "sessionBreaks": 0,
                  "sessionBreakTime": 0,
                  "userID": "314687442542395392",
                  "seasonName": "Semester 2",
                  "__v": 26,
                  "messageID": null,
                  "breakTimerStart": null,
                  "lastSessionDate": {
                    "$date": "2023-03-06T17:25:41.074Z"
                  },
                  "lastSessionTime": 6281.589,
                  "sessionTopic": null
                },
                {
                  "_id": {
                    "$oid": "63dbfcc40636fd30b436886d"
                  },
                  "seasonLevel": 34,
                  "seasonXP": 7700,
                  "accountXP": 5700,
                  "accountLevel": 24,
                  "startTime": [
                    20, 23, 13, 16, 19, 14, 16, 17, 17, 16, 17, 17, 16, 17, 14,
                    18, 17, 13, 12, 17, 17, 17, 18, 16, 15, 17, 18, 13, 13, 17,
                    17, 18, 18, 17, 17, 16, 18, 19, 17, 14, 12, 13, 16, 13, 19,
                    16
                  ],
                  "intiationTime": null,
                  "numberOfStarts": 44,
                  "timeSpent": 924668.633,
                  "longestSessionTime": 40181,
                  "sessionLengths": [
                    12860, 5051, 40181, 32469, 20403, 27854, 13468, 5092, 24772,
                    28488.2, 27415.1, 18.49, 18314.13, 8981.09, 19211.05,
                    29777.87, 30818.92, 17356.04, 14406.63, 19672.62, 19615.47,
                    9113.03, 22760.64, 15270.54, 14775.16, 10677.16, 31336.8,
                    21412.51, 18095.49, 4289.33, 23268.59, 18859.77, 20933.57,
                    13235.25, 18735.04, 40070.64, 34003.8, 36879.81, 31434.31,
                    23857.43, 32599.99, 15106.99, 20834.1
                  ],
                  "breakTime": 94869.382,
                  "totalBreaks": 88,
                  "sessionBreaks": 0,
                  "sessionBreakTime": 0,
                  "userID": "333644367539470337",
                  "seasonName": "Semester 2 Freshman",
                  "__v": 80,
                  "messageID": null,
                  "breakTimerStart": null,
                  "lastSessionDate": {
                    "$date": "2023-04-02T14:36:23.426Z"
                  },
                  "lastSessionTime": 20834.102,
                  "sessionTopic": null
                },
                {
                  "_id": {
                    "$oid": "63dfd7e7fb592b024cf0992e"
                  },
                  "seasonLevel": 1,
                  "seasonXP": 0,
                  "accountXP": 0,
                  "accountLevel": 1,
                  "startTime": [],
                  "intiationTime": null,
                  "numberOfStarts": 0,
                  "timeSpent": 0,
                  "longestSessionTime": null,
                  "sessionLengths": [],
                  "breakTime": 0,
                  "totalBreaks": 0,
                  "sessionBreaks": 0,
                  "sessionBreakTime": 0,
                  "userID": "371199521168031746",
                  "seasonName": null,
                  "__v": 0,
                  "messageID": null,
                  "sessionTopic": "maths",
                  "breakTimerStart": null,
                  "lastSessionDate": null,
                  "lastSessionTime": null
                }
              ],
              "seasonLevel",
              1,
              500
            );
            return interaction.reply({
              content: `${emojis.VERIFY} Simulated Level Up`
            });
          }
        }
      }
    });
  }
};
