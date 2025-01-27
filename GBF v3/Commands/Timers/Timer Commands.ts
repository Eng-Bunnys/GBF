import {
  ApplicationCommandOptionType,
  CommandInteractionOptionResolver,
  EmbedBuilder,
} from "discord.js";
import { SlashCommand, GBF, ColorCodes } from "../../Handler";
import { Timers } from "../../GBF/Timers/Timers";
import { Grade, Subject } from "../../GBF/Timers/GradeEngine";
import { UserModel } from "../../Models/User/UserModel";
import { TimerModel } from "../../Models/Timer/TimerModel";

export class GBFTimers extends SlashCommand {
  constructor(client: GBF) {
    super(client, {
      name: "timer",
      description: "Track your study time and progress",
      category: "Timers",
      subcommands: {
        stats: {
          description: "View your study stats",
          SubCommandOptions: [
            {
              name: "ephemeral",
              description: "Whether the message should be ephemeral",
              type: ApplicationCommandOptionType.Boolean,
            },
          ],
          async execute({ client, interaction }) {
            const ephemeral =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getBoolean("ephemeral") ?? false;

            const statsEmbed = new EmbedBuilder();

            try {
              const timers = await Timers.create(interaction.user.id);

              const stats = timers.statDisplay();

              statsEmbed
                .setColor(ColorCodes.Default)
                .setTitle(timers.getSemesterName())
                .setDescription(stats)
                .setFooter({
                  text: `Stats for ${interaction.user.username}`,
                })
                .setTimestamp();

              return interaction.reply({
                embeds: [statsEmbed],
                ephemeral: ephemeral,
              });
            } catch (error) {
              statsEmbed
                .setColor(ColorCodes.ErrorRed)
                .setDescription(
                  `I ran into an error while trying to fetch your stats. Please try again later.\n\n\`\`\`js\n` +
                    error +
                    `\`\`\``
                )
                .setFooter({
                  text: `Error fetching stats`,
                });

              return interaction.reply({
                embeds: [statsEmbed],
                ephemeral: true,
              });
            }
          },
        },
        ["add-subject"]: {
          description: "Add a subject your account / current semester",
          SubCommandOptions: [
            {
              name: "type",
              description: "The account type to add the subject too",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Account",
                  value: "A",
                },
                {
                  name: "Semester",
                  value: "S",
                },
              ],
              required: true,
            },
            {
              name: "subject-name",
              description: "The name of the subject",
              type: ApplicationCommandOptionType.String,
              maxLength: 50,
              required: true,
            },
            {
              name: "subject-code",
              description: "The subject's code",
              type: ApplicationCommandOptionType.String,
              maxLength: 50,
              required: true,
            },
            {
              name: "credits",
              description: "The number of credits for the subject",
              type: ApplicationCommandOptionType.Integer,
              required: true,
              minValue: 1,
              maxValue: 4,
            },
            {
              name: "grade",
              description:
                "The grade achieved in the subject, only choose if type is account",
              type: ApplicationCommandOptionType.String,
              choices: [
                { name: "A+", value: Grade.A_PLUS },
                { name: "A", value: Grade.A },
                { name: "A-", value: Grade.A_MINUS },
                { name: "B+", value: Grade.B_PLUS },
                { name: "B", value: Grade.B },
                { name: "B-", value: Grade.B_MINUS },
                { name: "C+", value: Grade.C_PLUS },
                { name: "C", value: Grade.C },
                { name: "C-", value: Grade.C_MINUS },
                { name: "D+", value: Grade.D_PLUS },
                { name: "D", value: Grade.D },
                { name: "F", value: Grade.F },
                { name: "W", value: Grade.W },
                { name: "P", value: Grade.P },
              ],
            },
          ],
          async execute({ client, interaction }) {
            const subjectName = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("subject-name", true);

            const subjectCode = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("subject-code", true);

            const credits = (
              interaction.options as CommandInteractionOptionResolver
            ).getInteger("credits", true);

            const accountType = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("type", true);

            const grade =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getString("grade") ?? null;

            if (accountType === "A" && !grade)
              return interaction.reply({
                content:
                  "If you want to add a subject to your account, you must specify the grade achieved.",
                ephemeral: true,
              });

            try {
              const timers = await Timers.create(interaction.user.id);

              const newSubject: Subject = {
                subjectName: subjectName,
                subjectCode: subjectCode,
                creditHours: credits,
                timesStudied: 0,
                grade: accountType === "A" ? (grade as Grade) : undefined,
                marksLost: 0,
              };

              if (accountType === "S")
                await timers.addSubjectSemester(newSubject);

              if (accountType === "A")
                await timers.addSubjectAccount(newSubject);

              return interaction.reply({
                content: `Subject '${subjectName}' has been added to ${
                  accountType === "S"
                    ? " the current Semester "
                    : " your account"
                }, with ${credits} credits.\nBest of luck.`,
                ephemeral: true,
              });
            } catch (error) {
              return interaction.reply({
                content: error.message,
                ephemeral: true,
              });
            }
          },
        },
        ["remove-subject"]: {
          description: "Remove a subject from the current semester",
          SubCommandOptions: [
            {
              name: "type",
              description: "The account type to add the subject too",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Account",
                  value: "A",
                },
                {
                  name: "Semester",
                  value: "S",
                },
              ],
              required: true,
            },
            {
              name: "subject-code",
              description: "The code of the subject",
              type: ApplicationCommandOptionType.String,
              autocomplete: true,
              required: true,
            },
          ],
          async autocomplete(interaction, option) {
            const userData = await UserModel.findOne({
              userID: interaction.user.id,
            });

            const timerData = await TimerModel.findOne({
              "account.userID": interaction.user.id,
            });

            if (!userData) return ["NA"];

            let subjectCodes = userData.Subjects.map(
              (subject) => subject.subjectCode
            );

            if (timerData?.currentSemester?.semesterSubjects?.length) {
              subjectCodes = [
                ...subjectCodes,
                ...timerData.currentSemester.semesterSubjects.map(
                  (subject) => subject.subjectCode
                ),
              ];
            }

            return subjectCodes;
          },
          async execute({ client, interaction }) {
            const chosenSubject = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("subject-code");

            try {
              const timers = await Timers.create(interaction.user.id);
            } catch (error) {}
          },
        },
        register: {
          description: "Register a new semester",
          SubCommandOptions: [
            {
              name: "semester-name",
              description: "The name of the semester",
              type: ApplicationCommandOptionType.String,
              maxLength: 50,
              required: true,
            },
          ],
          async execute({ client, interaction }) {
            const semesterName = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("semester-name", true);

            const registerEmbed = new EmbedBuilder();

            try {
              const timer = await Timers.create(interaction.user.id);

              const register = await timer.register(semesterName);

              if (register) {
                registerEmbed
                  .setColor(ColorCodes.Default)
                  .setDescription(
                    `Welcome to GBF Timers!\n\nNew Semester: ${semesterName}`
                  )
                  .setFooter({
                    text: "Best of luck!",
                  })
                  .setTimestamp();

                return interaction.reply({
                  embeds: [registerEmbed],
                });
              } else {
                throw new Error("Couldn't register, please try again later.");
              }
            } catch (error) {
              registerEmbed
                .setColor(ColorCodes.ErrorRed)
                .setDescription(
                  `I ran into an error while trying to register you. Please try again later.\n\n\`\`\`js\n` +
                    error +
                    `\`\`\``
                )
                .setTimestamp()
                .setFooter({
                  text: "Error registering user",
                });

              return interaction.reply({
                embeds: [registerEmbed],
                ephemeral: true,
              });
            }
          },
        },
        gpa: {
          description:
            "Returns a list of all of the subjects taken with their grade",
          SubCommandOptions: [
            {
              name: "ephemeral",
              description: "Choose whether to hide this message or not",
              type: ApplicationCommandOptionType.Boolean,
              required: true,
            },
          ],
          async execute({ client, interaction }) {
            const ephemeral = (
              interaction.options as CommandInteractionOptionResolver
            ).getBoolean("ephemeral");

            const subjectsEmbed = new EmbedBuilder();

            try {
              const timers = await Timers.create(interaction.user.id);

              const subjects = timers.GPAMenu();

              subjectsEmbed
                .setTitle(`${interaction.user.username}'s GPA`)
                .setColor(ColorCodes.Default)
                .setDescription(subjects)
                .setTimestamp();

              return interaction.reply({
                embeds: [subjectsEmbed],
                ephemeral: ephemeral,
              });
            } catch (error) {
              subjectsEmbed
                .setColor(ColorCodes.ErrorRed)
                .setDescription(
                  `I ran into an error while trying to fetch your stats. Please try again later.\n\n\`\`\`js\n` +
                    error +
                    `\`\`\``
                )
                .setTimestamp()
                .setFooter({
                  text: "Error registering user",
                });

              return interaction.reply({
                embeds: [subjectsEmbed],
                ephemeral: true,
              });
            }
          },
        },
      },
    });
  }
}
