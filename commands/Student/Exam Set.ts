import GBFClient from "../../handler/clienthandler";
import SlashCommand from "../../utils/slashCommands";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  CommandInteractionOptionResolver,
  ComponentType,
  EmbedBuilder,
  Interaction
} from "discord.js";

import { StudentModel } from "../../schemas/Student Schemas/Profile Schema";
import {
  CalculatePercentage,
  FormatName,
  GenerateID,
  StudentAverages,
  createGradeBarChart,
  generateExcel,
  passRate
} from "../../utils/StudentEngine";
import { MessageSplit, delay } from "../../utils/Engine";

export default class ExamCommands extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "exam",
      description: "Exam related commands",

      development: true,
      devOnly: true,
      dmEnabled: false,

      subcommands: {
        set: {
          description: "Set the scores for an exam",
          args: [
            {
              name: "student_name",
              description: "The name of the student",
              type: ApplicationCommandOptionType.String,
              required: true
            },

            {
              name: "exam_id",
              description: "The ID of the exam",
              type: ApplicationCommandOptionType.String,
              required: true
            },
            {
              name: "exam_type",
              description: "The type of the exam | Quiz or Mock",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Quiz",
                  value: "Quiz"
                },
                {
                  name: "Mock",
                  value: "Mock"
                }
              ],
              required: true
            },
            {
              name: "exam_name",
              description: "The name of the exam | Paper Number",
              type: ApplicationCommandOptionType.String,
              required: true
            },
            {
              name: "grade",
              description: "The grade that the student achieved",
              type: ApplicationCommandOptionType.Number,
              required: true
            },
            {
              name: "max_grade",
              description: "The max grade achievable",
              type: ApplicationCommandOptionType.Number,
              required: true
            },
            {
              name: "exam_date",
              description: "The day the student took the exam | DD/MM/YYYY",
              type: ApplicationCommandOptionType.String,
              required: true
            },
            {
              name: "student_id",
              description: "The ID of the student",
              type: ApplicationCommandOptionType.String
            }
          ],
          execute: async ({ client, interaction }) => {
            const StudentName = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("student_name");
            const StudentID = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("student_id");
            const ExamID = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("exam_id");
            const ExamType = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("exam_type");
            const ExamName = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("exam_name");
            const ExamGrade = (
              interaction.options as CommandInteractionOptionResolver
            ).getNumber("grade");
            const MaxExamMark = (
              interaction.options as CommandInteractionOptionResolver
            ).getNumber("max_grade");
            const ExamDate = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("exam_date");

            let StudentData = await StudentModel.findOne({
              $or: [{ StudentID }, { StudentName: StudentName.toLowerCase() }]
            });

            if (!StudentData) {
              StudentData = new StudentModel({
                StudentName: StudentName.toLowerCase(),
                StudentID: GenerateID()
              });

              await StudentData.save();
            }

            const AlreadyExists = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(
                `${StudentName} [${StudentID}] already has an exam entry for exam with ID: ${ExamID}`
              );

            if (StudentData.Exams.some((obj) => obj.ExamID == ExamID))
              return interaction.reply({
                embeds: [AlreadyExists],
                ephemeral: true
              });

            const DateRegex =
              /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;

            const InvalidDate = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} Invalid Input`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(
                `The date entered must be in the DD/MM/YYYY format i.e. (04/06/2021)`
              );

            if (!DateRegex.test(ExamDate))
              return interaction.reply({
                embeds: [InvalidDate],
                ephemeral: true
              });

            const [Day, Month, Year] = ExamDate.split("/").map(Number);

            const GivenDate = new Date(Year, Month - 1, Day);
            const DateTimestamp = Math.floor(GivenDate.getTime() / 1000);

            const StudentsGrade = Math.round(
              CalculatePercentage(ExamGrade, MaxExamMark)
            );

            const ExamDataEmbed = new EmbedBuilder()
              .setTitle(`${emojis.VERIFY} Success`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(`${FormatName(StudentName)}'s ${ExamName} Report`)
              .addFields(
                {
                  name: "Exam Type",
                  value: `${ExamType}`,
                  inline: true
                },
                {
                  name: "Exam Name",
                  value: `${ExamName}`,
                  inline: true
                },
                {
                  name: "Exam Date",
                  value: `<t:${DateTimestamp}:F>`,
                  inline: true
                },
                {
                  name: "Exam Grade",
                  value: `${StudentsGrade}%`
                },
                {
                  name: "Exam ID",
                  value: ExamID
                }
              )
              .setFooter({
                text: `Student ID: ${StudentData.StudentID} | Engineerd by Youssef Hamdy | Powered by GBF Engine`
              });

            StudentData.Exams.push({
              ExamName: ExamName,
              ExamGrade: StudentsGrade,
              ExamMark: `${ExamGrade}/${MaxExamMark}`,
              ExamType: ExamType,
              ExamDate: GivenDate,
              ExamID: ExamID
            });

            await StudentData.save();

            return interaction.reply({
              embeds: [ExamDataEmbed]
            });
          }
        },
        details: {
          description: "Get details about a certain exam",
          args: [
            {
              name: "id",
              description: "The exam's ID",
              type: ApplicationCommandOptionType.String,
              required: true
            },
            {
              name: "create-excel",
              description: "Choose whether to create an excel spreadsheet",
              type: ApplicationCommandOptionType.Boolean
            }
          ],
          execute: async ({ client, interaction }) => {
            const SpecifiedExamID = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("id");
            const ExcelBool = (
              interaction.options as CommandInteractionOptionResolver
            ).getBoolean("create-excel");

            const ExamDetails = await StudentModel.find({
              Exams: { $elemMatch: { ExamID: SpecifiedExamID } }
            });

            const NoExam = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} 404`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(`No data was found on ${SpecifiedExamID}`);

            if (!ExamDetails.length)
              return interaction.reply({
                embeds: [NoExam],
                ephemeral: true
              });

            try {
              const StudentsGrades: number[] = [];

              const GradeCurve = [
                { grade: "A*", minPercentage: 97 },
                { grade: "A", minPercentage: 89 },
                { grade: "B", minPercentage: 76 },
                { grade: "C", minPercentage: 67 },
                { grade: "D", minPercentage: 60 },
                { grade: "F", minPercentage: 59 }
              ];

              let ExamInfo = ``;

              ExamDetails.forEach((student) => {
                const specifiedExam = student.Exams.find(
                  (exam) => exam.ExamID === SpecifiedExamID
                );
                if (SpecifiedExamID) {
                  StudentsGrades.push(specifiedExam.ExamGrade);
                }
              });

              const BarChart = await createGradeBarChart(
                StudentsGrades,
                GradeCurve
              );

              await interaction.channel.send({
                files: [BarChart]
              });

              const PassRate = passRate(
                StudentsGrades,
                GradeCurve.find((item) => item.grade === "F").minPercentage
              );
              const AverageScore = StudentAverages(StudentsGrades);

              const ExcelData = [];

              let ExamDataArray: any[] = [];
              ExamDetails.forEach((student) => {
                const studentName = FormatName(student.StudentName);
                const studentID = student.StudentID;

                const specifiedExam = student.Exams.find(
                  (exam) => exam.ExamID === SpecifiedExamID
                );

                if (specifiedExam) {
                  const examGrade = specifiedExam.ExamGrade;
                  const studentMark = specifiedExam.ExamMark;
                  if (!ExamInfo.length) {
                    const ExamDateData = Math.floor(
                      specifiedExam.ExamDate.getTime() / 1000
                    );
                    ExamInfo = `${specifiedExam.ExamName} | ${specifiedExam.ExamType} | <t:${ExamDateData}:F>`;
                  }
                  ExcelData.push({
                    name: studentName,
                    rawGrade: examGrade,
                    examType: specifiedExam.ExamName,
                    Grade: studentMark
                  });
                  ExamDataArray.push({
                    studentName,
                    studentID,
                    examGrade,
                    Grade: studentMark
                  });
                }
              });

              ExamDataArray.sort((a, b) => b.examGrade - a.examGrade);

              for (let i = 0; i < ExamDataArray.length; i++) {
                let emoji = "";
                if (i === 0) emoji = "🥇";
                else if (i === 1) emoji = "🥈";
                else if (i === 2) emoji = "🥉";

                if (i < 3) {
                  ExamDataArray[
                    i
                  ].studentName = `${emoji} ${ExamDataArray[i].studentName}`;
                } else {
                  ExamDataArray[i].studentName = `${i + 1}) ${
                    ExamDataArray[i].studentName
                  }`;
                }
              }

              ExamDataArray = ExamDataArray.map(
                ({ studentName, examGrade, Grade }) => {
                  return `**${studentName}** - **${examGrade}% [${Grade}]**`;
                }
              );

              if (ExcelBool)
                generateExcel(ExcelData, `exam_${SpecifiedExamID}`);

              ExamDataArray = MessageSplit(ExamDataArray, 450);

              const Embeds = [];
              const Pages = {};

              for (let a = 0; a < ExamDataArray.length; a++) {
                let pageNumber = a + 1;
                Embeds.push(
                  new EmbedBuilder()
                    .setTitle(
                      `Exam Details [ID: ${SpecifiedExamID}] || ${ExamInfo}`
                    )
                    .setImage(BarChart.attachment.toString())
                    .addFields(
                      {
                        name: "Exam Average",
                        value: `${CalculatePercentage(AverageScore)}%`,
                        inline: true
                      },
                      {
                        name: "Pass Rate",
                        value: `${PassRate}%`,
                        inline: true
                      }
                    )
                    .setDescription(`${ExamDataArray[pageNumber - 1]}`)
                    .setColor(colors.DEFAULT as ColorResolvable)
                    .setFooter({
                      text: `Engineerd by Youssef Hamdy | Powered by GBF Engine || Page ${
                        a + 1
                      } / ${ExamDataArray.length}`
                    })
                );
              }

              const getRow = (id) => {
                const MainButtonsRow: ActionRowBuilder<any> =
                  new ActionRowBuilder();
                MainButtonsRow.addComponents(
                  new ButtonBuilder()
                    .setCustomId("firstPage")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("⏮")
                    .setDisabled(Pages[id] === 0)
                );
                MainButtonsRow.addComponents(
                  new ButtonBuilder()
                    .setCustomId("prevEmbed")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("◀")
                    .setDisabled(Pages[id] === 0)
                );
                MainButtonsRow.addComponents(
                  new ButtonBuilder()
                    .setCustomId("nextEmbed")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("▶")
                    .setDisabled(Pages[id] === Embeds.length - 1)
                );
                MainButtonsRow.addComponents(
                  new ButtonBuilder()
                    .setCustomId("finalPage")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("⏭")
                    .setDisabled(Pages[id] === Embeds.length - 1)
                );
                MainButtonsRow.addComponents(
                  new ButtonBuilder()
                    .setCustomId("end")
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("Close")
                    .setEmoji(emojis.ERROR)
                    .setDisabled(false)
                );
                return MainButtonsRow;
              };

              let id = interaction.user.id;

              Pages[id] = Pages[id] || 0;

              const embed = Embeds[Pages[id]];

              await interaction.reply({
                embeds: [embed],
                components: [getRow(id)]
              });

              const filter = (i: Interaction) => {
                return i.user.id === interaction.user.id;
              };

              const collector =
                interaction.channel.createMessageComponentCollector({
                  filter,
                  componentType: ComponentType.Button,
                  idle: 60000
                });

              collector.on("collect", async (i) => {
                await i.deferUpdate();
                await delay(750);

                if (i.customId === "prevEmbed") {
                  Pages[id]--;
                  if (Pages[id] < 0) Pages[id] = 0;
                  await interaction.editReply({
                    embeds: [Embeds[Pages[id]]],
                    components: [getRow(id)]
                  });
                } else if (i.customId === "nextEmbed") {
                  Pages[id]++;
                  if (Pages[id] > Embeds.length - 1)
                    Pages[id] = Embeds.length - 1;
                  await interaction.editReply({
                    embeds: [Embeds[Pages[id]]],
                    components: [getRow(id)]
                  });
                } else if (i.customId === "end") {
                  collector.stop();
                } else if (i.customId === "firstPage") {
                  Pages[id] = 0;
                  await interaction.editReply({
                    embeds: [Embeds[Pages[id]]],
                    components: [getRow(id)]
                  });
                } else if (i.customId === "finalPage") {
                  Pages[id] = Embeds.length - 1;
                  await interaction.editReply({
                    embeds: [Embeds[Pages[id]]],
                    components: [getRow(id)]
                  });
                }
              });

              collector.on("end", async (i) => {
                const MainButtonsRowDisabled: ActionRowBuilder<any> =
                  new ActionRowBuilder();
                MainButtonsRowDisabled.addComponents(
                  new ButtonBuilder()
                    .setCustomId("prev_embedD")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("⏮")
                    .setDisabled(true)
                );
                MainButtonsRowDisabled.addComponents(
                  new ButtonBuilder()
                    .setCustomId("next_embedD")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("⏭")
                    .setDisabled(true)
                );

                await interaction.editReply({
                  components: [MainButtonsRowDisabled]
                });
              });
            } catch (err) {
              console.log(err);
            }
          }
        }
      }
    });
  }
}
