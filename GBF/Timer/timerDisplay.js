const SlashCommand = require("../../utils/slashCommands");

const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Constants
} = require("discord.js");

const title = require("../../gbfembedmessages.json");
const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

const timerSchema = require("../../schemas/User Schemas/Timer Schema");

const {
  msToTime,
  chunkAverage,
  twentyFourToTwelve
} = require("../../utils/engine");

const {
  xpRequired,
  xpRequiredAccount,
  hoursRequired,
  loginReward,
  checkRank,
  checkRankAccount
} = require("../../utils/TimerLogic");

const fetch = require("node-fetch");

const next24Hours = Math.round((Date.now() + 24 * 60 * 60 * 1000) / 1000);

module.exports = class BasicTimerUI extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "timer",
      description: "Track your daily activites using GBF timers",
      category: "Timer",
      userPermission: [],
      botPermission: [""],
      cooldown: 0,
      development: false,
      subcommands: {
        stats: {
          description: "Get the stats of the current tracking semester",
          execute: async ({ client, interaction }) => {
            //Abbreviation dictionary
            /**
             - dhms : Day, Hours, Minutes, Seconds | Means that this variable stores a human readable dynamic date
             - HR : Human readable variable 
             - hr : Hours 
             - s : Seconds | Means that this variable's units is seconds only
             - ms : MiliSeconds | Means that this variable's units is miliseconds only
             - avg : Average of data
             */

            // timerData object stores time in seconds, so we have to convert it to miliseconds to be able to use the msToTime function

            //Checking if the user data on the current semester

            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            const noAccount = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `I couldn't find any data matching your user ID.\n\nCreate a new semester account using </timer registry:1068210539689414777>`
              );

            if (!timerData || (timerData && !timerData.seasonName))
              return interaction.reply({
                embeds: [noAccount],
                ephemeral: true
              });

            // First quadrant | Basic data
            const HRTotalTime =
              timerData.timeSpent > 0
                ? msToTime(timerData.timeSpent * 1000)
                : `0 seconds`;
            const hrTotalTime = Math.round(timerData.timeSpent / 3600);
            // Getting the average time by dividing the total time by number of starts
            let avgTotalTime = timerData.timeSpent / timerData.numberOfStarts;
            let rawTotalTime = timerData.timeSpent / timerData.numberOfStarts;

            // There is a chance that the average time can be infinity/undefined, so we need to check for this to avoid errors
            // The way this works is the msToTime returns undefined if the value entered is infinity or NaN, so we check for that
            if (!msToTime(avgTotalTime * 1000)) {
              avgTotalTime = `In-sufficient data`;
              rawTotalTime = 0;
            }
            // This variable will be pasted in the display so we can change it here
            else avgTotalTime = msToTime(avgTotalTime * 1000);

            // Second quadrant | Break data
            const HRBreakTime =
              timerData.breakTime > 0
                ? msToTime(timerData.breakTime * 1000)
                : `In-sufficient data`;
            const hrBreakTime = Math.round(timerData.breakTime / 3600);

            let avgBreakTime = timerData.breakTime / timerData.totalBreaks;
            let rawBreakTime = timerData.breakTime / timerData.totalBreaks;

            if (!msToTime(avgBreakTime * 1000)) {
              avgBreakTime = `In-sufficient data`;
              rawBreakTime = 0;
            } else avgBreakTime = msToTime(avgBreakTime * 1000);

            // Finding the average time between breaks

            let avgBreaks;

            if (
              hrTotalTime > 0 &&
              //hrBreakTime > 0 &&
              timerData.totalBreaks > 0
            ) {
              avgBreaks = msToTime(
                Math.abs(hrTotalTime / timerData.totalBreaks) * 1000 * 3600
              );
            } else avgBreaks = `In-sufficient data`;

            // Fourth quadrant | Previous session details

            // Checking if there was a last session

            let HRSessionTime;
            let UNIXSessionDate;
            let deltaTime;

            if (timerData.lastSessionTime && timerData.lastSessionDate) {
              HRSessionTime = msToTime(timerData.lastSessionTime * 1000);
              // Switching basic JS date to dynamic UNIX
              UNIXSessionDate = `<t:${Math.round(
                timerData.lastSessionDate / 1000
              )}:F>, <t:${Math.round(timerData.lastSessionDate / 1000)}:R>`;
              // By switching this to true, we can tell the system that a previous session exists so it can display it
              deltaTime = timerData.lastSessionTime - rawTotalTime;
            } else {
              HRSessionTime = `In-sufficient data`;
              UNIXSessionDate = `In-sufficient data`;
              deltaTime = `In-sufficient data`;
            }

            // Fifth quadrant | Weekly averages
            // This quadrant uses an external function that can be found in GBF's engine

            const weeklyAverages = chunkAverage(timerData.sessionLengths, 7);

            // It is very likely that there isn't enough data to be able to provide a week's average, so we need to check for that

            // This will be the variable that will hold the average time spent per week
            let displayWeeklyTimeAverage;

            // Getting the average of the weekly data
            // function averageTotal(data) {
            //   let sum = 0;
            //   for (let k = 0; k < data.length; k++) {
            //     sum += data[k];
            //   }
            //   return sum / data.length;
            // }

            if (!weeklyAverages.length || weeklyAverages.length < 1)
              displayWeeklyTimeAverage = `In-sufficient data`;
            else {
              displayWeeklyTimeAverage = `${msToTime(
                weeklyAverages[
                  weeklyAverages.length - 1 >= 0 ? weeklyAverages.length - 1 : 0
                ] * 1000
              )}\n  [${(
                weeklyAverages[
                  weeklyAverages.length - 1 >= 0 ? weeklyAverages.length - 1 : 0
                ] / 3600
              ).toFixed(2)} Hours]\n• Number of weeks: ${
                weeklyAverages.length
              }`;
            }

            // Getting the average start time (Old code)

            let averageStartTime;

            const sumOfTimes = timerData.startTime.reduce(
              (partialSum, a) => partialSum + a,
              0
            );

            averageStartTime = Number(
              (sumOfTimes / timerData.startTime.length).toFixed(2)
            );

            let displayAverageStartTime;

            if (!averageStartTime)
              displayAverageStartTime = `In-sufficient data`;
            else displayAverageStartTime = twentyFourToTwelve(averageStartTime);

            // Random welcome message to the user

            const randomMessages = [
              `How's your day ${interaction.user.username}`,
              `Enjoying this day ${interaction.user.username}?`,
              `Best of luck to you ${interaction.user.username}`,
              `Enjoy your day ${interaction.user.username}`
            ];

            // Getting a randomized message

            const randomTitleText =
              randomMessages[Math.floor(Math.random() * randomMessages.length)];

            // Sixth quadrant || Account levels

            // Getting the required XP to rank up, XP till that & progress bar

            const seasonRank =
              timerData.seasonLevel > 0 ? timerData.seasonLevel : 1;

            const accountRank =
              timerData.accountLevel > 0 ? timerData.accountLevel : 1;

            const accountXPrequired = xpRequiredAccount(accountRank + 1);
            const seasonXPrequired = xpRequired(seasonRank + 1);

            const hoursNeededAccount = Math.abs(
              hoursRequired(accountXPrequired - timerData.accountXP)
            );
            const hoursNeededSeason = Math.abs(
              hoursRequired(seasonXPrequired - timerData.seasonXP)
            );

            // Code from timerEngine

            let seasonProgressBar;

            const percentageSeasonComplete =
              (timerData.seasonXP / seasonXPrequired) * 100;

            if (percentageSeasonComplete >= 50 && percentageSeasonComplete < 90)
              seasonProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.middleEmpty}${emojis.rightEmpty}`;
            else if (
              percentageSeasonComplete >= 25 &&
              percentageSeasonComplete < 50
            )
              seasonProgressBar = `${emojis.leftFull}${emojis.middleEmpty}${emojis.middleEmpty}${emojis.rightEmpty}`;
            else if (
              percentageSeasonComplete >= 90 &&
              percentageSeasonComplete < 95
            )
              seasonProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.middleFull}${emojis.rightEmpty}`;
            else if (percentageSeasonComplete < 25)
              seasonProgressBar = `${emojis.leftEmpty}${emojis.middleEmpty}${emojis.rightEmpty}`;
            else if (percentageSeasonComplete >= 95)
              seasonProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.middleFull}${emojis.rightFull}`;

            let accountProgressBar;

            const percentageAccountComplete =
              (timerData.accountXP / accountXPrequired) * 100;

            if (
              percentageAccountComplete >= 50 &&
              percentageAccountComplete < 90
            )
              accountProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.middleEmpty}${emojis.rightEmpty}`;
            else if (
              percentageAccountComplete >= 25 &&
              percentageAccountComplete < 50
            )
              accountProgressBar = `${emojis.leftFull}${emojis.middleEmpty}${emojis.middleEmpty}${emojis.rightEmpty}`;
            else if (
              percentageAccountComplete >= 90 &&
              percentageAccountComplete < 95
            )
              accountProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.middleFull}${emojis.rightEmpty}`;
            else if (percentageAccountComplete < 25)
              accountProgressBar = `${emojis.leftEmpty}${emojis.middleEmpty}${emojis.rightEmpty}`;
            else if (percentageAccountComplete >= 95)
              accountProgressBar = `${emojis.leftFull}${emojis.middleFull}${emojis.middleFull}${emojis.rightFull}`;

            // The main message that stores all of the information and the third quadrant | Longest session

            const messageDescription = `• Total Semester Time: ${HRTotalTime} [${hrTotalTime} ${
              hrTotalTime == 1 ? "Hour" : "Hours"
            }]\n• Average Session Time: ${avgTotalTime} [${Math.round(
              rawTotalTime
            ).toLocaleString()} ${
              Math.floor(rawTotalTime) == 1 ? "Second" : "Seconds"
            }]\n• Total Number of Sessions: ${
              timerData.numberOfStarts
            }\n\n• Total Break Time: ${HRBreakTime} [${hrBreakTime} ${
              hrBreakTime == 1 ? "Hour" : "Hours"
            }]\n• Average Break Time: ${avgBreakTime} [${Math.round(
              rawBreakTime
            ).toLocaleString()} ${
              Math.floor(rawBreakTime) == 1 ? "Second" : "Seconds"
            }]\n• Total Number of Breaks: ${
              timerData.totalBreaks
            }\n• Average Time Between Breaks: ${avgBreaks}\n\n• Longest Session Time: ${
              timerData.longestSessionTime
                ? msToTime(timerData.longestSessionTime * 1000)
                : `In-sufficient data`
            }\n\n**Previous Session Details:**\n• Session Duration: ${HRSessionTime}\n• Session Date: ${UNIXSessionDate}\n• Difference from average: ${
              msToTime(deltaTime * 1000)
                ? msToTime(deltaTime * 1000)
                : `In-sufficient data`
            }\n\n• Average Start Time: ${displayAverageStartTime} [GMT +2]\n• Average Session Time per Week: ${displayWeeklyTimeAverage}\n\n• Semester Level: ${
              timerData.seasonLevel
            }\n• XP to reach level ${
              timerData.seasonLevel + 1
            }: ${timerData.seasonXP.toLocaleString()} / ${seasonXPrequired.toLocaleString()}\n${seasonProgressBar} [${percentageSeasonComplete.toFixed(
              2
            )}%]\n• Estimated time till next semester level up: ${Number(
              hoursNeededSeason.toFixed(2)
            ).toLocaleString()} Hours [${Number(
              (hoursNeededSeason * 60).toFixed(2)
            ).toLocaleString()} Minutes]\n\n• Account Level: ${
              timerData.accountLevel
            }\n• XP to reach level ${
              timerData.accountLevel + 1
            }: ${timerData.accountXP.toLocaleString()} / ${accountXPrequired.toLocaleString()}\n${accountProgressBar} [${percentageAccountComplete.toFixed(
              2
            )}%]\n• Estimated time till next account level up: ${Number(
              hoursNeededAccount.toFixed(2)
            ).toLocaleString()} Hours [${Number(
              (hoursNeededAccount * 60).toFixed(2)
            ).toLocaleString()} Minutes]`;

            const displayMessageEmbed = new MessageEmbed()
              .setTitle(
                `${randomTitleText} | ${
                  timerData.seasonName
                    ? timerData.seasonName
                    : "No Semester Name Set"
                }`
              )
              .setDescription(`${messageDescription}`)
              .setColor(colours.DEFAULT)
              .setFooter({
                text: `Encountered a bug or want to request a feature? Contact support, /bot invite and choose support server.`
              });

            return interaction.reply({
              embeds: [displayMessageEmbed]
            });
          }
        },
        initiate: {
          description: "Create a new session for the current semester",
          args: [
            {
              name: "topic",
              description: "The subject/topic of the session",
              type: Constants.ApplicationCommandOptionTypes.STRING,
              minLength: 2,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            const noAccount = new MessageEmbed()
              .setTitle(`⚠️ You cannot do that ⚠️`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `I couldn't find any data matching your user ID.\n\nCreate a new semester account using </timer registry:1068210539689414777>`
              );

            if (!timerData || (timerData && !timerData.seasonName))
              return interaction.reply({
                embeds: [noAccount],
                ephemeral: true
              });

            const sessionTopic = interaction.options.getString("topic");

            const HRTotalTime =
              timerData.timeSpent > 0
                ? msToTime(timerData.timeSpent * 1000)
                : `In-sufficient data`;
            const hrTotalTime = Math.round(timerData.timeSpent / 3600);

            let avgTotalTime = timerData.timeSpent / timerData.numberOfStarts;
            let rawTotalTime = Number(
              (timerData.timeSpent / timerData.numberOfStarts).toFixed(3)
            );

            if (!msToTime(avgTotalTime * 1000)) {
              avgTotalTime = `In-sufficient data`;
              rawTotalTime = 0;
            } else avgTotalTime = msToTime(avgTotalTime * 1000);

            // Second quadrant | Break data
            const HRBreakTime =
              timerData.breakTime > 0
                ? msToTime(timerData.breakTime * 1000)
                : `In-sufficient data`;
            const hrBreakTime = Math.round(timerData.breakTime / 3600);

            let avgBreakTime = timerData.breakTime / timerData.totalBreaks;
            let rawBreakTime = Number(
              (timerData.breakTime / timerData.totalBreaks).toFixed(3)
            );

            if (!msToTime(avgBreakTime * 1000)) {
              avgBreakTime = `In-sufficient data`;
              rawBreakTime = 0;
            } else avgBreakTime = msToTime(avgBreakTime * 1000);

            let HRSessionTime;
            let UNIXSessionDate;
            let deltaTime;

            if (timerData.lastSessionTime && timerData.lastSessionDate) {
              HRSessionTime = msToTime(timerData.lastSessionTime * 1000);
              // Switching basic JS date to dynamic UNIX
              UNIXSessionDate = `<t:${Math.round(
                timerData.lastSessionDate / 1000
              )}:F>, <t:${Math.round(timerData.lastSessionDate / 1000)}:R>`;
              // By switching this to true, we can tell the system that a previous session exists so it can display it
              deltaTime = Number(
                (timerData.lastSessionTime - rawTotalTime).toFixed(3)
              );
            } else {
              HRSessionTime = `In-sufficient data`;
              UNIXSessionDate = `In-sufficient data`;
              deltaTime = `In-sufficient data`;
            }

            const messageDescription = `• Total Semester Time: ${HRTotalTime} [${hrTotalTime.toLocaleString()} Hours]\n• Average Session Time: ${avgTotalTime} [${rawTotalTime.toLocaleString()} Seconds]\n• Total Number of Sessions: ${
              timerData.numberOfStarts
            }\n\n• Total Break Time: ${HRBreakTime} [${hrBreakTime.toLocaleString()} Hours]\n• Average Break Time: ${avgBreakTime} [${rawBreakTime.toLocaleString()} Seconds]\n• Total Number of Breaks: ${
              timerData.totalBreaks
            }\n\n**Previous Session Details:**\n• Session Duration: ${HRSessionTime}\n• Session Date: ${UNIXSessionDate}\n• Difference from average: ${
              msToTime(deltaTime * 1000)
                ? msToTime(deltaTime * 1000)
                : deltaTime.toLocaleString() + ` Seconds`
            }`;

            const randomMessages = [
              `How's your day ${interaction.user.username}`,
              `Enjoying this day ${interaction.user.username}?`,
              `Best of luck to you ${interaction.user.username}`,
              `Enjoy your day ${interaction.user.username}`
            ];

            const randomTitleText =
              randomMessages[Math.floor(Math.random() * randomMessages.length)];

            // Using an API to generate random advice to put in the footer
            let randomAdvice;
            // It is very possible to not get any results back so we need to check for that
            try {
              await fetch(`https://luminabot.xyz/api/json/advice`)
                .then((response) => response.json())
                .then((data) => {
                  randomAdvice = `${data.advice}`;
                });
            } catch (err) {
              randomAdvice = `Advice could not be loaded.`;
            }

            const mainEmbed = new MessageEmbed()
              .setTitle(`${randomTitleText} | ${sessionTopic}`)
              .setColor(colours.DEFAULT)
              .setDescription(`${messageDescription}`)
              .setFooter({
                text: `${randomAdvice}`
              });

            // Creating the buttons that the user will use to start / stop / pause

            const mainButtonsRow = new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId("startTimer")
                .setEmoji("🕜")
                .setLabel("Start Timer")
                .setStyle("SECONDARY"),
              new MessageButton()
                .setCustomId("pauseTimer")
                .setEmoji("⏰")
                .setLabel("Pause Timer")
                .setStyle("SECONDARY"),
              new MessageButton()
                .setCustomId("stopTimer")
                .setEmoji("🕛")
                .setLabel("Stop Timer")
                .setStyle("SECONDARY")
            ]);

            const initiateMessage = await interaction.reply({
              embeds: [mainEmbed],
              components: [mainButtonsRow],
              fetchReply: true
            });

            return timerData.updateOne({
              messageID: initiateMessage.id,
              sessionTopic: sessionTopic
            });
          }
        },
        registry: {
          description: "Register your account to use GBF Timers",
          args: [
            {
              name: "semester-name",
              description:
                "The semester's name [CANNOT BE CHANGED], this will be used until you reset",
              type: Constants.ApplicationCommandOptionTypes.STRING,
              minLength: 6,
              maxLength: 20,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            const existingAccount = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `You already have existing semester data, you can reset and create a new profile using </timer registry:1068210539689414777>`
              );

            // Checking if there's an existing season

            if (timerData && timerData.seasonName)
              return interaction.reply({
                embeds: [existingAccount],
                ephemeral: true
              });

            const seasonName = interaction.options.getString("semester-name");

            const newSemesterSeason = new MessageEmbed()
              .setTitle(`${emojis.VERIFY} Registered`)
              .setColor(colours.DEFAULT)
              .setDescription(
                `Registry Time:\n<t:${Math.floor(
                  Date.now() / 1000
                )}:F>\n\nSuccessfully registered ${seasonName} as a new semester, best of luck.\n\nYou can reset using </timer reset:1068210539689414777>\nThis will delete all of the previously saved data ⚠️`
              );

            const helpEmbed = new MessageEmbed()
              .setTitle(`${emojis.LOGOTRANS} GBF Timers`)
              .setColor(colours.DEFAULT)
              .setDescription(`1. Start by registering, this can be done for **free** using  </timer registry:1068210539689414777>
            2. Once registered, you can start a new session using </timer initiate:1068210539689414777>, buttons will be displayed that you can use to start, stop or pause the timer!
            3. Once you finished your session, you can view your stats using </timer stats:1068210539689414777>
            
            Semester ended and want to reset? Use </timer reset:1068210539689414777>, this will delete your previous data and you can register a new account for free again\n\nWant to display this message? Use </timer help:1068210539689414777>`);

            // Checking if there's an account but no existing season

            if (timerData && !timerData.seasonName) {
              await interaction.reply({
                embeds: [newSemesterSeason]
              });

              await interaction.followUp({
                embeds: [helpEmbed],
                ephemeral: true
              });

              // Reseting the data and updating to the new season name

              return timerData.updateOne({
                numberOfStarts: 0,
                timeSpent: 0,
                seasonLevel: 1,
                seasonXP: 1,
                longestSessionTime: null,
                sessionLengths: [],
                startTime: [],
                lastSessionTime: null,
                lastSessionDate: null,
                breakTime: 0,
                totalBreaks: 0,
                seasonName: seasonName
              });
            } else if (!timerData) {
              // Creating a new user profile

              const newUserProfile = new timerSchema({
                userID: interaction.user.id,
                seasonName: seasonName
              });

              await newUserProfile.save();

              await interaction.reply({
                embeds: [helpEmbed],
                ephemeral: true
              });

              return interaction.followUp({
                embeds: [newSemesterSeason]
              });
            }
          }
        },
        reset: {
          description: "Reset the current semester stats",
          execute: async ({ client, interaction }) => {
            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            // Checking if the user does not have an account

            const noAccount = new MessageEmbed()
              .setTitle(`⚠️ You cannot do that ⚠️`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `I couldn't find any data matching your user ID.\n\nCreate a new semester account using </timer registry:1068210539689414777>`
              );

            if (!timerData || (timerData && !timerData.seasonName))
              return interaction.reply({
                embeds: [noAccount],
                ephemeral: true
              });

            // This is a very dangerous command, so just in-case we need to ask the user to confirm this action

            // Creating confirm or deny buttons

            const confirmationButtons = new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId("confirmTimerDelete")
                .setStyle("DANGER")
                .setLabel("Delete My Data"),
              new MessageButton()
                .setCustomId("denyTimerDelete")
                .setStyle("SUCCESS")
                .setLabel("Don't Delete My Data")
            ]);

            // Creating the same buttons as above but disabled

            const confirmationButtonsD = new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId("confirmTimerDeleteD")
                .setDisabled(true)
                .setStyle("DANGER")
                .setLabel("Delete My Data"),
              new MessageButton()
                .setCustomId("denyTimerDeleteD")
                .setDisabled(true)
                .setStyle("SUCCESS")
                .setLabel("Don't Delete My Data")
            ]);

            // Creating an embed to display to the user

            const warningMessage = new MessageEmbed()
              .setTitle(`⚠️ Confirmation required`)
              .setColor(colours.DEFAULT)
              .setDescription(
                `Please use the buttons below to confirm or deny this action. [Semester reset, this includes semester XP]\n\nWe recommend using </timer stats:1068210539689414777> before restting.`
              );

            await interaction.reply({
              embeds: [warningMessage],
              components: [confirmationButtons],
              fetchReply: true
            });

            // Creating an interaction collector with a 5 minutes time, if the time runs out nothing happens

            // Creating the filter that checks if the user who clicked the button is the interaction author
            const filter = (i) => {
              return i.user.id === interaction.user.id;
            };
            // Creating the collector in the current channel
            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                time: 300000
              });
            // Looking for the collector collect event
            collector.on("collect", async (i) => {
              // Returning if the user decided to abort the process
              if (i.customId === "denyTimerDelete") {
                const processAborted = new MessageEmbed()
                  .setTitle(`${emojis.VERIFY} Success`)
                  .setColor(colours.DEFAULT)
                  .setDescription(
                    `Process aborted by the user, no action was taken.`
                  );
                // Editing the original message to the process aborted message
                await interaction.editReply({
                  embeds: [processAborted],
                  components: [confirmationButtonsD]
                });

                // Returning and closing the collector

                return collector.stop({ reason: "308" });
              } else if (i.customId === "confirmTimerDelete") {
                // Telling the user the data is being deleted

                const processBegin = new MessageEmbed()
                  .setTitle(`${emojis.VERIFY} Success`)
                  .setColor(colours.DEFAULT)
                  .setDescription(
                    `Your data has been deleted, to create a new semester use </timer registry:1068210539689414777>`
                  );

                const semesterRecap = `• Total Time: ${msToTime(
                  timerData.timeSpent * 1000
                )}\n• Number of Sessions: ${
                  timerData.numberOfStarts
                }\n• Total Break Time: ${msToTime(
                  timerData.breakTime * 1000
                )}\n• Number of Breaks: ${
                  timerData.totalBreaks
                }\n\n• Semester Level: ${
                  timerData.seasonLevel
                }\n• Semester XP: ${timerData.seasonXP}`;

                const semesterStats = new MessageEmbed()
                  .setTitle(`${timerData.seasonName} Recap`)
                  .setColor(colours.DEFAULT)
                  .setDescription(`${semesterRecap}`)
                  .setFooter({
                    text: `Good luck on your next journey! - GBF Team`
                  });

                // Deleting the data

                await timerData.updateOne({
                  messageID: null,
                  seasonName: null,
                  numberOfStarts: 0,
                  timeSpent: 0,
                  seasonLevel: 1,
                  seasonXP: 0,
                  longestSessionTime: null,
                  sessionLengths: [],
                  lastSessionTime: null,
                  lastSessionDate: null,
                  breakTime: 0,
                  totalBreaks: 0,
                  startTime: [],
                  intiationTime: null,
                  sessionBreakTime: 0,
                  sessionBreaks: 0,
                  breakTimerStart: null,
                  sessionTopic: null
                });

                await interaction.followUp({
                  embeds: [semesterStats]
                });

                await interaction.editReply({
                  embeds: [processBegin],
                  components: [confirmationButtonsD]
                });
                // Closing the collector
                return collector.stop({
                  reason: "308"
                });
              }
            });

            // It is very likely that the user did not click any of the buttons, in that event we will return after the 5 minute timer is done

            collector.on("end", (collected, reason) => {
              // Ending the command and disabling the buttons
              if (reason !== "308") return;
              return interaction.editReply({
                content: `Timed out.`,
                components: [confirmationButtonsD]
              });
            });
          }
        },
        info: {
          description: "Get details on the current active session",
          execute: async ({ client, interaction }) => {
            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            const noAccount = new MessageEmbed()
              .setTitle(`⚠️ You cannot do that ⚠️`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `I couldn't find any data matching your user ID.\n\nCreate a new semester account using </timer registry:1068210539689414777>`
              );

            if (!timerData || (timerData && !timerData.seasonName))
              return interaction.reply({
                embeds: [noAccount],
                ephemeral: true
              });

            // Checking if there's an active session

            const noActiveSession = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED)
              .setDescription(`There are no active sessions.`);

            if (!timerData.intiationTime)
              return interaction.reply({
                embeds: [noActiveSession],
                ephemeral: true
              });

            // Calculating the time elapsed

            // Checking if the user took a break, if they did not we auto set the time to 0

            let breakTime =
              timerData.sessionBreakTime > 0 ? timerData.sessionBreakTime : 0;

            // This variable stores the human readable break time, we first check if the time is valid

            let displayBreakTime = !msToTime(breakTime * 1000)
              ? `0 seconds`
              : `${msToTime(breakTime * 1000)}`;

            // Subtracting the break time from the time elapsed to get the true time elapsed

            const timeElapsed =
              ((Date.now() - timerData.intiationTime.getTime()) / 1000).toFixed(
                3
              ) - breakTime;

            const sessionStats = new MessageEmbed()
              .setTitle(
                `Session Stats | ${
                  timerData.sessionTopic ? timerData.sessionTopic : ""
                }`
              )
              .setColor(colours.DEFAULT)
              .setDescription(
                `• Time Elapsed: ${msToTime(
                  Math.abs(timeElapsed * 1000)
                )}\n• Total Break Time: ${displayBreakTime}\n• Total Breaks: ${
                  timerData.sessionBreaks
                }\n\n• Start Time: <t:${Math.round(
                  timerData.lastSessionDate / 1000
                )}:F>`
              );

            return interaction.reply({
              embeds: [sessionStats]
            });
          }
        },
        help: {
          description: "Find out how to use GBF Timers",
          execute: async ({ client, interaction }) => {
            const helpEmbed = new MessageEmbed()
              .setTitle(`${emojis.LOGOTRANS} GBF Timers`)
              .setColor(colours.DEFAULT)
              .setDescription(`1. Start by registering, this can be done for **free** using  </timer registry:1068210539689414777>
            2. Once registered, you can start a new session using </timer initiate:1068210539689414777>, buttons will be displayed that you can use to start, stop or pause the timer!
            3. Once you finished your session, you can view your stats using </timer stats:1068210539689414777>
            
            Semester ended and want to reset? Use </timer reset:1068210539689414777>, this will delete your previous data and you can register a new account for free again\n\nWant to display this message again? Use </timer help:1068210539689414777>`);

            return interaction.reply({
              embeds: [helpEmbed],
              ephemeral: true
            });
          }
        },
        topic_update: {
          args: [
            {
              name: "topic",
              description: "The subject/topic of the session",
              type: Constants.ApplicationCommandOptionTypes.STRING,
              minLength: 2,
              required: true
            }
          ],
          description: "Update the current session's topic",
          execute: async ({ client, interaction }) => {
            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            const noAccount = new MessageEmbed()
              .setTitle(`⚠️ You cannot do that ⚠️`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `I couldn't find any data matching your user ID.\n\nCreate a new semester account using </timer registry:1068210539689414777>`
              );

            if (!timerData || (timerData && !timerData.seasonName))
              return interaction.reply({
                embeds: [noAccount],
                ephemeral: true
              });

            // Checking if there's an active session

            const noActiveSession = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED)
              .setDescription(`There are no active sessions.`);

            if (!timerData.intiationTime)
              return interaction.reply({
                embeds: [noActiveSession],
                ephemeral: true
              });

            await timerData.updateOne({
              sessionTopic: interaction.options.getString("topic")
            });

            const topicUpdated = new MessageEmbed()
              .setTitle(`${emojis.VERIFY} Success`)
              .setColor(colours.DEFAULT)
              .setDescription(
                `New session topic: ${interaction.options.getString("topic")}`
              );

            return interaction.reply({
              embeds: [topicUpdated]
            });
          }
        }
      }
    });
  }
};
