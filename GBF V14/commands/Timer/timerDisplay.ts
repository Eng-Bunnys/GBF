const SlashCommand = require("../../utils/slashCommands").default;

import {
  CommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  ColorResolvable,
  Interaction,
  ComponentType,
  CommandInteractionOptionResolver
} from "discord.js";

import colours from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import timerSchema from "../../schemas/User Schemas/Timer Schema";
import userSchema from "../../schemas/User Schemas/User Profile Schema";

import { msToTime, chunkAverage, twentyFourToTwelve } from "../../utils/Engine";

import {
  xpRequired,
  xpRequiredAccount,
  hoursRequired
} from "../../utils/TimerLogic";

import fetch from "node-fetch";

interface IExecute {
  client: Client;
  interaction: CommandInteraction;
}

export default class BasicTimerUI extends SlashCommand {
  constructor(client: Client) {
    super(client, {
      name: "timer",
      description: "Track your daily activites using GBF timers",
      category: "Timer",
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: false,
      subcommands: {
        stats: {
          description: "Get the stats of the current tracking semester",
          execute: async ({ client, interaction }: IExecute) => {
            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            const userData = await userSchema.findOne({
              userID: interaction.user.id
            });

            const noAccount = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED as ColorResolvable)
              .setDescription(
                `I couldn't find any data matching your user ID.\n\nCreate a new semester account using </timer registry:1068210539689414777>`
              );

            if (!timerData || (timerData && !timerData.seasonName) || !userData)
              return interaction.reply({
                embeds: [noAccount],
                ephemeral: true
              });

            // First quadrant | Basic data
            const HRTotalTime: string =
              timerData.timeSpent > 0
                ? msToTime(timerData.timeSpent * 1000)
                : `0 seconds`;
            const hrTotalTime: number = Math.round(timerData.timeSpent / 3600);
            // Getting the average time by dividing the total time by number of starts
            let avgTotalTime: number | string =
              timerData.timeSpent / timerData.numberOfStarts;
            let rawTotalTime: number =
              timerData.timeSpent / timerData.numberOfStarts;

            // There is a chance that the average time can be infinity/undefined, so we need to check for this to avoid errors
            // The way this works is the msToTime returns undefined if the value entered is infinity or NaN, so we check for that
            if (!msToTime(avgTotalTime * 1000)) {
              avgTotalTime = `In-sufficient data`;
              rawTotalTime = 0;
            }
            // This variable will be pasted in the display so we can change it here
            else avgTotalTime = msToTime(avgTotalTime * 1000);

            // Second quadrant | Break data
            const HRBreakTime: string =
              timerData.breakTime > 0
                ? msToTime(timerData.breakTime * 1000)
                : `In-sufficient data`;

            const hrBreakTime: number = Math.round(timerData.breakTime / 3600);

            let avgBreakTime: number | string =
              timerData.breakTime / timerData.totalBreaks;
            let rawBreakTime: number =
              timerData.breakTime / timerData.totalBreaks;

            if (!msToTime(avgBreakTime * 1000)) {
              avgBreakTime = `In-sufficient data`;
              rawBreakTime = 0;
            } else avgBreakTime = msToTime(avgBreakTime * 1000);

            // Finding the average time between breaks

            let avgBreaks: number | string;

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

            let HRSessionTime: string;
            let UNIXSessionDate: string;
            let deltaTime: number | string;

            if (timerData.lastSessionTime && timerData.lastSessionDate) {
              HRSessionTime = msToTime(timerData.lastSessionTime * 1000);
              // Switching basic JS date to dynamic UNIX
              UNIXSessionDate = `<t:${Math.round(
                timerData.lastSessionDate.getTime() / 1000
              )}:F>, <t:${Math.round(
                timerData.lastSessionDate.getTime() / 1000
              )}:R>`;
              // By switching this to true, we can tell the system that a previous session exists so it can display it
              deltaTime = timerData.lastSessionTime - rawTotalTime;
            } else {
              HRSessionTime = `In-sufficient data`;
              UNIXSessionDate = `In-sufficient data`;
              deltaTime = `In-sufficient data`;
            }

            // Fifth quadrant | Weekly averages
            // This quadrant uses an external function that can be found in GBF's engine

            const weeklyAverages: number[] = chunkAverage(
              timerData.sessionLengths,
              7
            );
            const attendedWeeks: number[] = chunkAverage(
              timerData.sessionLengths,
              5
            );

            // It is very likely that there isn't enough data to be able to provide a week's average, so we need to check for that

            // This will be the variable that will hold the average time spent per week
            let displayWeeklyTimeAverage: string;

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
              ).toFixed(2)} Hours]\n• Number of 7 day weeks: ${
                weeklyAverages.length
              }\n• Number of 5 day weeks: ${attendedWeeks.length}`;
            }

            // Getting the average start time (Old code)

            let averageStartTime: number;

            const sumOfTimes = timerData.startTime.reduce(
              (partialSum, a) => partialSum + a,
              0
            );

            averageStartTime = Number(
              (sumOfTimes / timerData.startTime.length).toFixed(2)
            );

            let displayAverageStartTime: number | string;

            if (!averageStartTime)
              displayAverageStartTime = `In-sufficient data`;
            else displayAverageStartTime = twentyFourToTwelve(averageStartTime);

            // Random welcome message to the user

            const randomMessages: string[] = [
              `How's your day ${interaction.user.username}`,
              `Enjoying this day ${interaction.user.username}?`,
              `Best of luck to you ${interaction.user.username}`,
              `Enjoy your day ${interaction.user.username}`
            ];

            // Getting a randomized message

            const randomTitleText: string =
              randomMessages[Math.floor(Math.random() * randomMessages.length)];

            // Sixth quadrant || Account levels

            // Getting the required XP to rank up, XP till that & progress bar

            const seasonRank: number =
              timerData.seasonLevel > 0 ? timerData.seasonLevel : 1;

            const accountRank: number = userData.Rank > 0 ? userData.Rank : 1;

            const accountXPrequired: number = xpRequiredAccount(
              accountRank + 1
            );
            const seasonXPrequired: number = xpRequired(seasonRank + 1);

            const hoursNeededAccount: number = Math.abs(
              hoursRequired(accountXPrequired - userData.Rank)
            );
            const hoursNeededSeason: number = Math.abs(
              hoursRequired(seasonXPrequired - timerData.seasonXP)
            );

            let seasonProgressBar: string;

            const percentageSeasonComplete: number =
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

            let accountProgressBar: string;

            const percentageAccountComplete: number =
              (userData.RP / accountXPrequired) * 100;

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

            const messageDescription: string = `• Total Semester Time: ${HRTotalTime} [${hrTotalTime} ${
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
            }\n• Longest Semester: ${msToTime(
              timerData.biggestSemester * 1000
            )} [${
              timerData.biggestSemesterName
            }]\n\n**Previous Session Details:**\n• Session Duration: ${HRSessionTime}\n• Session Date: ${UNIXSessionDate}\n• Difference from average: ${
              msToTime((deltaTime as number) * 1000)
                ? msToTime((deltaTime as number) * 1000)
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
              userData.Rank
            }\n• XP to reach level ${
              userData.RP + 1
            }: ${userData.RP.toLocaleString()} / ${accountXPrequired.toLocaleString()}\n${accountProgressBar} [${percentageAccountComplete.toFixed(
              2
            )}%]\n• Estimated time till next account level up: ${Number(
              hoursNeededAccount.toFixed(2)
            ).toLocaleString()} Hours [${Number(
              (hoursNeededAccount * 60).toFixed(2)
            ).toLocaleString()} Minutes]`;

            const displayEmbed = new EmbedBuilder()
              .setTitle(
                `${randomTitleText} | ${
                  timerData.seasonName
                    ? timerData.seasonName
                    : "No Semester Name Set"
                }`
              )
              .setDescription(`${messageDescription}`)
              .setColor(colours.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Encountered a bug or want to request a feature? Contact support, /bot invite and choose support server.`
              });

            return interaction.reply({
              embeds: [displayEmbed]
            });
          }
        },
        initiate: {
          description: "Create a new session for the current semester",
          args: [
            {
              name: "topic",
              description: "The subject/topic of the session",
              type: 3,
              minLength: 2,
              required: true
            }
          ],
          execute: async ({ client, interaction }: IExecute) => {
            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            const noAccount = new EmbedBuilder()
              .setTitle(`⚠️ You cannot do that ⚠️`)
              .setColor(colours.ERRORRED as ColorResolvable)
              .setDescription(
                `I couldn't find any data matching your user ID.\n\nCreate a new semester account using </timer registry:1068210539689414777>`
              );

            if (!timerData || (timerData && !timerData.seasonName))
              return interaction.reply({
                embeds: [noAccount],
                ephemeral: true
              });

            const sessionTopic: string = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("topic");

            const HRTotalTime: number | string =
              timerData.timeSpent > 0
                ? msToTime(timerData.timeSpent * 1000)
                : `In-sufficient data`;
            const hrTotalTime: number = Math.round(timerData.timeSpent / 3600);

            let avgTotalTime: number | string =
              timerData.timeSpent / timerData.numberOfStarts;
            let rawTotalTime = Number(
              (timerData.timeSpent / timerData.numberOfStarts).toFixed(3)
            );

            if (!msToTime(avgTotalTime * 1000)) {
              avgTotalTime = `In-sufficient data`;
              rawTotalTime = 0;
            } else avgTotalTime = msToTime(avgTotalTime * 1000);

            // Second quadrant | Break data
            const HRBreakTime: number | string =
              timerData.breakTime > 0
                ? msToTime(timerData.breakTime * 1000)
                : `In-sufficient data`;
            const hrBreakTime = Math.round(timerData.breakTime / 3600);

            let avgBreakTime: number | string =
              timerData.breakTime / timerData.totalBreaks;
            let rawBreakTime = Number(
              (timerData.breakTime / timerData.totalBreaks).toFixed(3)
            );

            if (!msToTime(avgBreakTime * 1000)) {
              avgBreakTime = `In-sufficient data`;
              rawBreakTime = 0;
            } else avgBreakTime = msToTime(avgBreakTime * 1000);

            let HRSessionTime: string;
            let UNIXSessionDate: string;
            let deltaTime: number | string;

            if (timerData.lastSessionTime && timerData.lastSessionDate) {
              HRSessionTime = msToTime(timerData.lastSessionTime * 1000);
              // Switching basic JS date to dynamic UNIX
              UNIXSessionDate = `<t:${Math.round(
                timerData.lastSessionDate.getTime() / 1000
              )}:F>, <t:${Math.round(
                timerData.lastSessionDate.getTime() / 1000
              )}:R>`;
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
              msToTime((deltaTime as number) * 1000)
                ? msToTime((deltaTime as number) * 1000)
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
            let randomAdvice: string;
            // It is very possible to not get any results back so we need to check for that
            try {
              await fetch(`https://luminabot.xyz/api/json/advice`)
                .then((response) => response.json())
                .then((data) => {
                  randomAdvice = `${data.advice}`;
                });
            } catch (err: Error | unknown) {
              console.log(`Error fetching: ${err}`);
              randomAdvice = `Advice could not be loaded.`;
            }

            const mainEmbed = new EmbedBuilder()
              .setTitle(`${randomTitleText} | ${sessionTopic}`)
              .setColor(colours.DEFAULT as ColorResolvable)
              .setDescription(`${messageDescription}`)
              .setFooter({
                text: `${randomAdvice}`
              });

            // Creating the buttons that the user will use to start / stop / pause

            const mainButtonsRow: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setCustomId("startTimer")
                  .setEmoji("🕜")
                  .setLabel("Start Timer")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("pauseTimer")
                  .setEmoji("⏰")
                  .setDisabled(true)
                  .setLabel("Pause Timer")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("timerInfo")
                  .setEmoji("ℹ️")
                  .setDisabled(true)
                  .setLabel("Session Stats")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("stopTimer")
                  .setEmoji("🕛")
                  .setDisabled(true)
                  .setLabel("Stop Timer")
                  .setStyle(ButtonStyle.Secondary)
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
              type: 3,
              minLength: 6,
              maxLength: 20,
              required: true
            }
          ],
          execute: async ({ client, interaction }: IExecute) => {
            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            const existingAccount = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED as ColorResolvable)
              .setDescription(
                `You already have existing semester data, you can reset and create a new profile using </timer registry:1068210539689414777>`
              );

            // Checking if there's an existing season

            if (timerData && timerData.seasonName)
              return interaction.reply({
                embeds: [existingAccount],
                ephemeral: true
              });

            const seasonName = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("semester-name");

            const newSemesterSeason = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Registered`)
              .setColor(colours.DEFAULT as ColorResolvable)
              .setDescription(
                `Registry Time:\n<t:${Math.floor(
                  Date.now() / 1000
                )}:F>\n\nSuccessfully registered ${seasonName} as a new semester, best of luck.\n\nYou can reset using </timer reset:1068210539689414777>\nThis will delete all of the previously saved data ⚠️`
              );

            const helpEmbed = new EmbedBuilder()
              .setTitle(`${emojis.LOGOTRANS} GBF Timers`)
              .setColor(colours.DEFAULT as ColorResolvable)
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
          execute: async ({ client, interaction }: IExecute) => {
            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            // Checking if the user does not have an account

            const noAccount = new EmbedBuilder()
              .setTitle(`⚠️ You cannot do that ⚠️`)
              .setColor(colours.ERRORRED as ColorResolvable)
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

            const confirmationButtons: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setCustomId("confirmTimerDelete")
                  .setStyle(ButtonStyle.Danger)
                  .setLabel("Delete My Data"),
                new ButtonBuilder()
                  .setCustomId("denyTimerDelete")
                  .setStyle(ButtonStyle.Secondary)
                  .setLabel("Don't Delete My Data")
              ]);

            // Creating the same buttons as above but disabled

            const confirmationButtonsD: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setCustomId("confirmTimerDeleteD")
                  .setDisabled(true)
                  .setStyle(ButtonStyle.Danger)
                  .setLabel("Delete My Data"),
                new ButtonBuilder()
                  .setCustomId("denyTimerDeleteD")
                  .setDisabled(true)
                  .setStyle(ButtonStyle.Secondary)
                  .setLabel("Don't Delete My Data")
              ]);

            // Creating an embed to display to the user

            const warningMessage = new EmbedBuilder()
              .setTitle(`⚠️ Confirmation required`)
              .setColor(colours.DEFAULT as ColorResolvable)
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
            const filter = (i: Interaction) => {
              return i.user.id === interaction.user.id;
            };
            // Creating the collector in the current channel
            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                time: 300000,
                componentType: ComponentType.Button
              });
            // Looking for the collector collect event
            collector.on("collect", async (i) => {
              // Returning if the user decided to abort the process
              if (i.customId === "denyTimerDelete") {
                const processAborted = new EmbedBuilder()
                  .setTitle(`${emojis.VERIFY} Success`)
                  .setColor(colours.DEFAULT as ColorResolvable)
                  .setDescription(
                    `Process aborted by the user, no action was taken.`
                  );
                // Editing the original message to the process aborted message
                await interaction.editReply({
                  embeds: [processAborted],
                  components: [confirmationButtonsD]
                });

                // Returning and closing the collector

                return collector.stop("308");
              } else if (i.customId === "confirmTimerDelete") {
                // Telling the user the data is being deleted

                const processBegin = new EmbedBuilder()
                  .setTitle(`${emojis.VERIFY} Success`)
                  .setColor(colours.DEFAULT as ColorResolvable)
                  .setDescription(
                    `Your data has been deleted, to create a new semester use </timer registry:1068210539689414777>`
                  );

                const semesterRecap: string = `• Total Time: ${msToTime(
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

                const semesterStats = new EmbedBuilder()
                  .setTitle(`${timerData.seasonName} Recap`)
                  .setColor(colours.DEFAULT as ColorResolvable)
                  .setDescription(`${semesterRecap}`)
                  .setFooter({
                    text: `Good luck on your next journey! - GBF Team`
                  });

                // Deleting the data

                if (timerData.biggestSemester < timerData.timeSpent) {
                  await timerData.updateOne({
                    biggestSemester: timerData.timeSpent,
                    biggestSemesterName: timerData.seasonName
                  });

                  const newLongestSemester = new EmbedBuilder()
                    .setTitle(`🎉 New Record`)
                    .setDescription(
                      `${
                        timerData.seasonName
                      } was your biggest semester with ${msToTime(
                        timerData.timeSpent * 1000
                      )}!`
                    )
                    .setColor(colours.DEFAULT as ColorResolvable);

                  interaction.channel.send({
                    content: `<@${interaction.user.id}>`,
                    embeds: [newLongestSemester]
                  });
                }

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
                  initiationTime: null,
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
                return collector.stop("308");
              }
            });

            // It is very likely that the user did not click any of the buttons, in that event we will return after the 5 minute timer is done

            collector.on("end", (collected, reason) => {
              // Ending the command and disabling the buttons
              if (reason !== "308") return;
              interaction.editReply({
                content: `Timed out.`,
                components: [confirmationButtonsD]
              });
            });
          }
        },
        info: {
          description: "Get details on the current active session",
          execute: async ({ client, interaction }: IExecute) => {
            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            const noAccount = new EmbedBuilder()
              .setTitle(`⚠️ You cannot do that ⚠️`)
              .setColor(colours.ERRORRED as ColorResolvable)
              .setDescription(
                `I couldn't find any data matching your user ID.\n\nCreate a new semester account using </timer registry:1068210539689414777>`
              );

            if (!timerData || (timerData && !timerData.seasonName))
              return interaction.reply({
                embeds: [noAccount],
                ephemeral: true
              });

            // Checking if there's an active session

            const noActiveSession = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED as ColorResolvable)
              .setDescription(`There are no active sessions.`);

            if (!timerData.initiationTime)
              return interaction.reply({
                embeds: [noActiveSession],
                ephemeral: true
              });

            // Calculating the time elapsed

            // Checking if the user took a break, if they did not we auto set the time to 0
            let onBreak: boolean = timerData.breakTimerStart ? true : false;

            let currentBreakTime: string | null = null;

            let activeBreakTime: number;

            if (onBreak) {
              activeBreakTime = Math.abs(
                Number(
                  (
                    (Date.now() - timerData.breakTimerStart.getTime()) /
                    1000
                  ).toFixed(3)
                ) * 1000
              );
              currentBreakTime = `• Current Break Length:  ${msToTime(
                activeBreakTime
              )}`;
            } else {
              currentBreakTime = null;
              activeBreakTime = 0;
            }

            let breakTime: number =
              timerData.sessionBreakTime > 0 ? timerData.sessionBreakTime : 0;

            // This variable stores the human readable break time, we first check if the time is valid
            let displayBreakTime = !msToTime(breakTime * 1000)
              ? `0 seconds`
              : `${msToTime(breakTime * 1000)}`;

            // Subtracting the break time from the time elapsed to get the true time elapsed
            const timeElapsed: string = (
              (Date.now() - timerData.initiationTime.getTime()) / 1000 -
              breakTime
            ).toFixed(3);

            const sessionStats = new EmbedBuilder()
              .setTitle(
                `Session Stats | ${
                  timerData.sessionTopic ? timerData.sessionTopic : ""
                }`
              )
              .setColor(colours.DEFAULT as ColorResolvable)
              .setDescription(
                `• Time Elapsed: ${msToTime(
                  Math.abs(Number(timeElapsed) * 1000)
                )}\n• Total Break Time: ${displayBreakTime}\n• Total Breaks: ${
                  timerData.sessionBreaks
                }\n${
                  currentBreakTime !== null ? currentBreakTime + "\n" : "\n"
                }• Start Time: <t:${Math.round(
                  timerData.lastSessionDate.getTime() / 1000
                )}:F>`
              )
              .setFooter({
                text: `The active break time is not counted in the time elapsed, the real time elapsed will show once the break has ended, same applies to the total break time.`
              });

            return interaction.reply({
              embeds: [sessionStats]
            });
          }
        },
        help: {
          description: "Find out how to use GBF Timers",
          execute: async ({ client, interaction }: IExecute) => {
            const helpEmbed = new EmbedBuilder()
              .setTitle(`${emojis.LOGOTRANS} GBF Timers`)
              .setColor(colours.DEFAULT as ColorResolvable)
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
        topic: {
          args: [
            {
              name: "topic",
              description: "The subject/topic of the session",
              type: 3,
              minLength: 2,
              required: true
            }
          ],
          description: "Update the current session's topic",
          execute: async ({ client, interaction }: IExecute) => {
            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            const noAccount = new EmbedBuilder()
              .setTitle(`⚠️ You cannot do that ⚠️`)
              .setColor(colours.ERRORRED as ColorResolvable)
              .setDescription(
                `I couldn't find any data matching your user ID.\n\nCreate a new semester account using </timer registry:1068210539689414777>`
              );

            if (!timerData || (timerData && !timerData.seasonName))
              return interaction.reply({
                embeds: [noAccount],
                ephemeral: true
              });

            // Checking if there's an active session

            const noActiveSession = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED as ColorResolvable)
              .setDescription(`There are no active sessions.`);

            if (!timerData.initiationTime)
              return interaction.reply({
                embeds: [noActiveSession],
                ephemeral: true
              });

            await timerData.updateOne({
              sessionTopic: (
                interaction.options as CommandInteractionOptionResolver
              ).getString("topic")
            });

            const topicUpdated = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Success`)
              .setColor(colours.DEFAULT as ColorResolvable)
              .setDescription(
                `New session topic: ${(
                  interaction.options as CommandInteractionOptionResolver
                ).getString("topic")}`
              );

            return interaction.reply({
              embeds: [topicUpdated]
            });
          }
        }
      }
    });
  }
}
