import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  CommandInteractionOptionResolver,
  EmbedBuilder,
} from "discord.js";
import {
  SlashCommand,
  GBF,
  GetRandomFromArray,
  msToTime,
  ColorCodes,
} from "gbfcommands";
import { TimerModel } from "../../Models/User Schemas/Timer Schema";
import CommandIDs from "../../GBF/Command IDs.json";
import {
  IUserProfile,
  UserProfileModel,
} from "../../Models/User Schemas/User Profile Schema";
import { Document } from "mongoose";
import { GBFColorCodes, GBFEmojis } from "../../Utils/UI";
import { TimerStats } from "../../Command Classes/Timer Stats Class";

export class TimerUI extends SlashCommand {
  constructor(client: GBF) {
    super(client, {
      name: "timer",
      description: "Timer related commands",
      category: "Timer",
      subcommands: {
        stats: {
          description: "Get the active season's stats",
          SubCommandOptions: [
            {
              name: "user",
              description: "Get this user's active season's stats",
              type: ApplicationCommandOptionType.User,
            },
          ],
          async execute({ client, interaction }) {
            const TargetUser =
              interaction.options.getUser("user") ?? interaction.user;

            const GetStats = new TimerStats(TargetUser.id);

            const WelcomeMessages = [
              `How's your day, ${interaction.user.username}?`,
              `Hey there, ${interaction.user.username}!`,
              `Good to see you, ${interaction.user.username}!`,
              `Welcome back, ${interaction.user.username}!`,
              `Hello, ${interaction.user.username}!`,
              `Hi, ${interaction.user.username}!`,
              `Hey ${interaction.user.username}!`,
              `Good day, ${interaction.user.username}!`,
            ];

            const RandomTitle = GetRandomFromArray(WelcomeMessages);

            const StatsEmbed = new EmbedBuilder().setTitle(
              `${WelcomeMessages} | `
            );
          },
        },
        start: {
          description: "Create a new session",
          SubCommandOptions: [
            {
              name: "topic",
              description: "The session's main topic",
              type: ApplicationCommandOptionType.String,
              minLength: 2,
              required: true,
            },
          ],
          async execute({ client, interaction }) {
            const TimerData = await TimerModel.findOne({
              userID: interaction.user.id,
            });

            const ErrorEmbed = new EmbedBuilder().setColor(
              GBFColorCodes.ErrorRed
            );

            if (!TimerData || (TimerData && !TimerData.SeasonName)) {
              ErrorEmbed.setTitle(
                `${GBFEmojis.Error} You can't do that`
              ).setDescription(
                `You have no existing timer data / active season.\n\nYou can create one using ${CommandIDs["Timer Register"]}`
              );

              return interaction.reply({
                embeds: [ErrorEmbed],
                ephemeral: true,
              });
            }

            const SessionTopic = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("topic", true);

            const WelcomeMessages = [
              `How's your day, ${interaction.user.username}?`,
              `Hey there, ${interaction.user.username}!`,
              `Good to see you, ${interaction.user.username}!`,
              `Welcome back, ${interaction.user.username}!`,
              `Hello, ${interaction.user.username}!`,
              `Hi, ${interaction.user.username}!`,
              `Hey ${interaction.user.username}!`,
              `Good day, ${interaction.user.username}!`,
            ];

            const RandomTitle = GetRandomFromArray(WelcomeMessages);

            let AdviceFooter: string;

            (async () => {
              try {
                const response = await fetch(
                  `https://luminabot.xyz/api/json/advice`
                );
                const data = await response.json();
                AdviceFooter = data.advice;
              } catch (error) {
                AdviceFooter = "JETSKIIIIIIIIIIIII";
              }
            })();

            const TotalSemesterTime = `• Total Season Time: ${
              TimerData.TimeSpent > 0
                ? msToTime(TimerData.TimeSpent * 1000)
                : `In-Sufficient Data.`
            }`;

            const AverageSessionTime = `• Average Session Time: ${
              TimerData.TimeSpent > 0 && TimerData.NumberOfSessions > 0
                ? msToTime(
                    (TimerData.TimeSpent / TimerData.NumberOfSessions) * 1000
                  )
                : `In-Sufficient Data.`
            }`;

            const TotalSessions = `• Total Sessions: ${
              TimerData.NumberOfSessions > 0
                ? TimerData.NumberOfSessions.toLocaleString("en-US")
                : 0
            }`;

            const TotalBreakTime = `• Total Break Time: ${
              TimerData.TimePaused > 0
                ? msToTime(TimerData.TimePaused * 1000)
                : `In-Sufficient Data.`
            }`;

            const AverageBreakTime = `• Average Break Time: ${
              TimerData.TimePaused > 0 && TimerData.TotalBreaks > 0
                ? msToTime(
                    (TimerData.TimePaused / TimerData.TotalBreaks) * 1000
                  )
                : `In-Sufficient Data.`
            }`;

            const TotalBreaks = `• Total Breaks: ${
              TimerData.TotalBreaks > 0
                ? TimerData.TotalBreaks.toLocaleString("en-US")
                : 0
            }`;

            const PreviousSessionDuration = `• Session Duration: ${
              TimerData.LastSessionTime && TimerData.LastSessionTime > 0
                ? msToTime(TimerData.LastSessionTime * 1000)
                : `No Previous Session Recorded.`
            }`;

            const PreviousSessionDate = `• Session Date: ${
              TimerData.LastSessionDate
                ? `<t:${Math.round(
                    TimerData.LastSessionDate.getTime() / 1000
                  )}:F>, <t:${Math.round(
                    TimerData.LastSessionDate.getTime() / 1000
                  )}:R>`
                : ""
            }`;

            const EmbedDescription = `${TotalSemesterTime}\n${AverageSessionTime}\n${TotalSessions}\n\n${TotalBreakTime}\n${AverageBreakTime}\n${TotalBreaks}\n\n**Last Session:**\n${PreviousSessionDate}\n${PreviousSessionDuration}`;

            const StartEmbed = new EmbedBuilder()
              .setTitle(`${RandomTitle} | ${SessionTopic}`)
              .setColor(GBFColorCodes.Default)
              .setDescription(`${EmbedDescription}`)
              .setFooter({
                text: `${AdviceFooter}`,
              });

            const TimerButtons: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setCustomId("TimerStart")
                  .setEmoji(`▶️`)
                  .setLabel("Start Timer")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("PauseTimer")
                  .setEmoji("⏸️")
                  .setDisabled(true)
                  .setLabel("Pause Timer")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("TimerInfo")
                  .setEmoji("ℹ️")
                  .setDisabled(true)
                  .setLabel("Session Details")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("StopTimer")
                  .setEmoji("⏹️")
                  .setDisabled(true)
                  .setLabel("Stop Timer")
                  .setStyle(ButtonStyle.Secondary),
              ]);

            const StartMessage = await interaction.reply({
              embeds: [StartEmbed],
              components: [TimerButtons],
            });

            return TimerData.updateOne({
              messageID: StartMessage.id,
              SessionTopic: SessionTopic,
            });
          },
        },
        register: {
          description: "Start a new GBF Timers season or create your account!",
          SubCommandOptions: [
            {
              name: "season-name",
              description: "The name of the season that you want to create",
              type: ApplicationCommandOptionType.String,
              minLength: 6,
              maxLength: 30,
              required: true,
            },
          ],
          async execute({ client, interaction }) {
            const TimerData = await TimerModel.findOne({
              userID: interaction.user.id,
            });

            let UserData: IUserProfile & Document<any, any, IUserProfile> =
              await UserProfileModel.findOne({
                userID: interaction.user.id,
              });

            if (!UserData) {
              UserData = new UserProfileModel({
                userID: interaction.user.id,
              });

              await UserData.save();
            }

            const ExistingData = new EmbedBuilder()
              .setTitle(`${GBFEmojis.Error} You can't do that`)
              .setColor(GBFColorCodes.ErrorRed)
              .setDescription(
                `An active season already exists, you can reset it using ${CommandIDs["Timer Reset"]}`
              );

            if (TimerData && TimerData.SeasonName)
              return interaction.reply({
                embeds: [ExistingData],
                ephemeral: true,
              });

            const SeasonName = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("season-name", true);

            const NewSeason = new EmbedBuilder()
              .setTitle(`${GBFEmojis.Verify} Welcome to GBF Timers`)
              .setColor(GBFColorCodes.Default)
              .setDescription(
                `Welcome to GBF Timers! The GBF Team wishes you the best!\n\nTime Registered: <t:${Math.round(
                  Date.now() / 1000
                )}:F>`
              );

            const HelpEmbed = new EmbedBuilder()
              .setTitle(
                `${GBFEmojis.GBFLogo} GBF Timers Help ${GBFEmojis.GBFLogo}`
              )
              .setColor(GBFColorCodes.Default)
              .setDescription(
                `GBF Timers offers a cutting-edge tool for hassle-free data tracking right within Discord, and it won't cost you a dime. With this dynamic utility, you can easily keep tabs on study time, relaxation breaks, work sessions, and more. Getting started is a breeze – just sign up using the ${CommandIDs["Timer Register"]} command. Once registered, kick off your sessions effortlessly with ${CommandIDs["Timer Reset"]}. Convenient buttons will pop up for starting, pausing, or stopping the timer. When you're done, dive into detailed stats with ${CommandIDs["Timer Stats"]}. Ready to start fresh? Hit up ${CommandIDs["Timer Reset"]} to wipe the slate clean and sign up again for free. Need a reminder? Just call up ${CommandIDs["Timer Help"]}. It's that simple!`
              );

            await interaction.reply({
              embeds: [NewSeason],
            });

            await interaction.followUp({
              embeds: [HelpEmbed],
              ephemeral: true,
            });

            if (TimerData && !TimerData.SeasonName) {
              return TimerData.updateOne({
                NumberOfSessions: 0,
                TimeSpent: 0,
                SeasonLevel: 1,
                SeasonXP: 0,
                LongestSession: null,
                SessionLengths: [],
                LastSessionTime: null,
                LastSessionDate: null,
                TotalBreaks: 0,
                TimePaused: 0,
                SeasonName: SeasonName,
              });
            } else if (!TimerData) {
              const NewUserProfile = new TimerModel({
                userID: interaction.user.id,
                SeasonName: SeasonName,
              });

              await NewUserProfile.save();
            }
          },
        },
        topic: {
          description: "Change the active session's topic",
          SubCommandOptions: [
            {
              name: "topic",
              description: "The new topic for the active session",
              type: ApplicationCommandOptionType.String,
              minLength: 2,
              required: true,
            },
          ],
          async execute({ client, interaction }) {
            const TimerData = await TimerModel.findOne({
              userID: interaction.user.id,
            });

            const NoData = new EmbedBuilder()
              .setTitle(`${GBFEmojis.Error} You can't do that`)
              .setColor(GBFColorCodes.ErrorRed)
              .setDescription(
                `You have no existing timer data / active season.\n\nYou can create one using ${CommandIDs["Timer Register"]}`
              );

            if (!TimerData || (TimerData && !TimerData.SeasonName))
              return interaction.reply({
                embeds: [NoData],
                ephemeral: true,
              });

            const InactiveSession = new EmbedBuilder()
              .setTitle(`${GBFEmojis.Error} You can't do that`)
              .setColor(ColorCodes.ErrorRed)
              .setDescription(
                `No active session found, you can start one using ${CommandIDs["Timer Start"]}`
              );

            if (!TimerData.InitiationTime)
              return interaction.reply({
                embeds: [InactiveSession],
                ephemeral: true,
              });

            const NewTopic = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("topic", true);

            const TopicUpdated = new EmbedBuilder()
              .setTitle(`${GBFEmojis.Verify}  Session Topic Updated!`)
              .setDescription(`New Session Topic: ${NewTopic}`)
              .setColor(GBFColorCodes.Default);

            await TimerData.updateOne({
              SessionTopic: NewTopic,
            });

            return interaction.reply({
              embeds: [TopicUpdated],
            });
          },
        },
      },
    });
  }
}
