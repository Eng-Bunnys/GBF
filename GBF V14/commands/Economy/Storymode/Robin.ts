const SlashCommand = require("../../../utils/slashCommands").default;

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  ColorResolvable,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  Interaction
} from "discord.js";

import colors from "../../../GBF/GBFColor.json";
import emojis from "../../../GBF/GBFEmojis.json";
import CommandLinks from "../../../GBF/GBFCommands.json";

import UserProfileSchema from "../../../schemas/User Schemas/User Profile Schema";
import {
  generateSimpleArithmeticProblem,
  processPayment
} from "../../../utils/SueLuz Engine";
import { delay } from "../../../utils/Engine";

interface IExecute {
  client: Client;
  interaction: CommandInteraction;
}

export default class RobinStoryMissions extends SlashCommand {
  constructor(client: Client) {
    super(client, {
      name: "robin",
      description: "Robin story missions for SueLuz",
      cooldown: 2,
      development: true,
      introRequired: true,
      subcommands: {
        "mission-one": {
          description:
            "Meet Robin Milan, he'll show you around the city to get you started",
          execute: async ({ client, interaction }: IExecute) => {
            const userData = await UserProfileSchema.findOne({
              userID: interaction.user.id
            });

            const missionCompleted = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(`You've already completed Meet Robin`);

            if (userData.completedMissions.MeetRobin)
              return interaction.reply({
                embeds: [missionCompleted],
                ephemeral: true
              });

            const dialogueOne = new EmbedBuilder()
              .setDescription(
                `\`Robin:\` Sue sent you to me that must mean you're worth something hotshit, but you don't look like you sound, can't be walking around with just a pistol big boy, you gotta get an automatic, I'll show you where to buy one, you'll also need a place to stay, can't stay at Jazmine's forever but I doubt you got the cash for that right now.`
              )
              .setColor(colors.DEFAULT as ColorResolvable);

            await interaction.reply({
              embeds: [dialogueOne],
              ephemeral: true
            });

            const { paymentType, errorMessage, remainingBalance } =
              processPayment("wallet", userData.cash, userData.bank, 250);

            let extraDialouge: string | null = ``;

            if (errorMessage !== null) {
              extraDialouge = `Looks like you don't have enough money for it right now, I'll cover it for you this time... only this time though.`;
              await userData.updateOne({
                cash: userData.cash + 250
              });
            } else extraDialouge = null;

            const dialougeTwo = new EmbedBuilder()
              .setDescription(
                `${
                  extraDialouge !== null ? extraDialouge + `\n` : ""
                }Alright, go ahead and buy the Uzi, talk to my boy Bradley he'll give you a friend's discount, it will run you back ₲250`
              )
              .setColor(colors.DEFAULT as ColorResolvable);

            const buyUziButton: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setCustomId("buyUzi")
                  .setLabel("Uzi ₲250")
                  .setStyle(ButtonStyle.Secondary)
              ]);

            setTimeout(async () => {
              await interaction.followUp({
                embeds: [dialougeTwo],
                components: [buyUziButton],
                ephemeral: true
              });
            }, 2000);

            const filter = (i: Interaction) => {
              return i.user.id === interaction.user.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                idle: 300000,
                componentType: ComponentType.Button
              });

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              if (i.customId === "buyUzi") {
                await userData.updateOne({
                  cash:
                    paymentType === "wallet" ? remainingBalance : userData.cash,
                  bank:
                    paymentType === "bank" ? remainingBalance : userData.bank,
                  weapons: {
                    pistol: userData.weapons.pistol ? true : false,
                    uzi: true
                  }
                });

                const dialogueThree = new EmbedBuilder()
                  .setDescription(
                    `Alright you got your strap, meet me at ${CommandLinks.MojaveJob}, I got work for you, the pay isn't amazing but it's something to help you get started.`
                  )
                  .setColor(colors.DEFAULT as ColorResolvable);

                interaction.followUp({
                  embeds: [dialogueThree],
                  ephemeral: true
                });

                const tasksCompleted = {
                  "Meet Robin": true,
                  "No Loans": errorMessage !== null ? false : true,
                  "XO Tour Llif3": true
                };

                client.emit(
                  "missionComplete",
                  interaction,
                  interaction.user,
                  tasksCompleted,
                  "Meet Robin"
                );

                collector.stop("missionComplete");
              }
            });

            collector.on("end", async (collected, reason) => {
              if (reason === "idle") {
                const robinRage = new EmbedBuilder()
                  .setTitle(`${emojis.ERROR} Mission Failed`)
                  .setDescription(
                    `\`Robin:\` How hard is to buy the fucking gun, holy shit ${userData.characterProfile.characterName}`
                  );

                interaction.followUp({
                  embeds: [robinRage],
                  ephemeral: true
                });
              }
            });
          }
        },
        "mission-two": {
          description:
            "You and Robin take over a small shop and turn it into a small business",
          execute: async ({ client, interaction }: IExecute) => {
            const userData = await UserProfileSchema.findOne({
              userID: interaction.user.id
            });

            const meetRobinFirst = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(
                `You need to meet Robin first to run this mission: ${CommandLinks.MeetRobin}`
              );

            if (!userData.completedMissions.MeetRobin)
              return interaction.reply({
                embeds: [meetRobinFirst],
                ephemeral: true
              });

            const missionCompleted = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(`You've already completed Meet Robin`);

            if (userData.completedMissions.MojaveJob)
              return interaction.reply({
                embeds: [missionCompleted],
                ephemeral: true
              });

            const dialogueOne = new EmbedBuilder()
              .setDescription(
                `\`Robin:\` The job is simple, there's this small shop in the outskirts and they haven't paid anything in years so no one will come to them if they get attacked, you can guess what we're going to do.`
              )
              .setColor(colors.DEFAULT as ColorResolvable);

            await interaction.reply({
              embeds: [dialogueOne],
              ephemeral: true
            });

            const dialogueTwo = new EmbedBuilder()
              .setDescription(
                `The place is easy to get in but hard to get out, no back door or anything and we expect the owners to put up a fight, they live in the middle of the desert so expect them to be armed.`
              )
              .setColor(colors.DEFAULT as ColorResolvable);

            setTimeout(async () => {
              await interaction.followUp({
                embeds: [dialogueTwo],
                ephemeral: true
              });
            }, 2000);

            const dialogueThree = new EmbedBuilder()
              .setDescription(
                `Before we go in, we'll hack into their cameras and freeze them, we'll then park our van outside and you go in shoot the cameras first, the owners will fight back, when they do, shoot them.`
              )
              .setColor(colors.DEFAULT as ColorResolvable);

            setTimeout(async () => {
              await interaction.followUp({
                embeds: [dialogueThree],
                ephemeral: true
              });
            }, 4000);

            const { equation, solution } = generateSimpleArithmeticProblem();

            const solveEquation = new EmbedBuilder()
              .setTitle(`Solve this equation to get in`)
              .setDescription(
                `Equation: ${equation} [Give the approximate answer]`
              )
              .setColor(colors.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Warning: Do not use other buttons while this one is active`
              });

            const randomSolutions: number[] = [
              solution + Math.floor(Math.random() * 10) + 1,
              solution - Math.floor(Math.random() * 5) + 1,
              solution + Math.floor(Math.random() * 2) + 1,
              solution
            ];

            const uniqueSolutions = [...new Set(randomSolutions)];
            if (uniqueSolutions.length < 4) {
              const dupedItem = uniqueSolutions.find(
                (item) =>
                  uniqueSolutions.indexOf(item) !==
                  uniqueSolutions.lastIndexOf(item)
              );
              if (dupedItem === solution) {
                const nonOriginalSolutionIndex = randomSolutions.findIndex(
                  (item) => item !== solution
                );
                const uniqueItem = generateUniqueItem(randomSolutions);
                randomSolutions.splice(nonOriginalSolutionIndex, 1, uniqueItem);
              } else {
                const indexToRemove = randomSolutions.lastIndexOf(dupedItem);
                const uniqueItem = generateUniqueItem(randomSolutions);
                randomSolutions.splice(indexToRemove, 1, uniqueItem);
              }
            }

            console.log(randomSolutions);

            function generateUniqueItem(array: number[]): number {
              let uniqueNumber: number;
              do {
                uniqueNumber = solution + Math.floor(Math.random() * 10) + 1;
              } while (
                array.includes(uniqueNumber) ||
                uniqueNumber === solution
              );
              return uniqueNumber;
            }

            for (let i = randomSolutions.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [randomSolutions[i], randomSolutions[j]] = [
                randomSolutions[j],
                randomSolutions[i]
              ];
            }

            const solutionButtons = [];
            for (const number of randomSolutions) {
              const generatedButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel(String(number))
                .setCustomId(String(number));
              solutionButtons.push(generatedButton);
            }

            const solutionButtonsRow: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents(solutionButtons);

            setTimeout(async () => {
              await interaction.followUp({
                embeds: [solveEquation],
                components: [solutionButtonsRow],
                ephemeral: true
              });
            }, 6000);

            const filter = (i: Interaction) => {
              return i.user.id === interaction.user.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                idle: 300000,
                componentType: ComponentType.Button
              });

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              if (
                randomSolutions.some(
                  (number) =>
                    number === Number(i.customId) && number !== solution
                )
              ) {
                console.log("You clicked the wrong button!");
              }
              if (Number(i.customId) === solution) {
                console.log("Correct button")
              }
            });
          }
        }
      }
    });
  }
}
