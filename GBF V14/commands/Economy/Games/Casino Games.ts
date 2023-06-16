import SlashCommand from "../../../utils/slashCommands";

import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  CommandInteraction,
  CommandInteractionOptionResolver,
  ComponentType,
  EmbedBuilder,
  Interaction
} from "discord.js";

import colors from "../../../GBF/GBFColor.json";
import emojis from "../../../GBF/GBFEmojis.json";
import CommandLinks from "../../../GBF/GBFCommands.json";

import { processPayment } from "../../../utils/SueLuz Engine";
import { capitalize, delay } from "../../../utils/Engine";
import { checkRankAccount } from "../../../utils/TimerLogic";
import GBFClient from "../../../handler/clienthandler";
import { GBFUserProfileModel } from "../../../schemas/User Schemas/User Profile Schema";
import { GBFCasinoModel } from "../../../schemas/User Schemas/Casino Schema";

interface IExecute {
  client: GBFClient;
  interaction: CommandInteraction;
}

export default class CasinoGames extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "casino",
      description: "Play games in the casino",
      cooldown: 20,
      category: "Economy",
      devBypass: true,
      subcommands: {
        guess: {
          description: "Higher or lower guessing game",
          args: [
            {
              name: "bet",
              description: "The amount that you want to bet",
              type: ApplicationCommandOptionType.Integer,
              minValue: 500,
              maxValue: 500000,
              required: true
            },
            {
              name: "payment-method",
              description: "The method that you want to use to pay",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Bank",
                  value: "bank"
                },
                {
                  name: "Wallet",
                  value: "wallet"
                }
              ]
            }
          ],
          execute: async ({ client, interaction }: IExecute) => {
            const userBet = (
              interaction.options as CommandInteractionOptionResolver
            ).getInteger("bet", true);

            const preferredPaymentMethod =
              (
                interaction.options as CommandInteractionOptionResolver
              ).getString("payment-method") || "wallet";

            const userData = await GBFUserProfileModel.findOne({
              userID: interaction.user.id
            });

            const UnableToRun = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable);

            if (!userData) {
              UnableToRun.setDescription(
                `You don't have a SueLuz account, create one using: ${CommandLinks.SueLuzRegister}`
              );
              return interaction.reply({
                embeds: [UnableToRun],
                ephemeral: true
              });
            }
            if (!userData.completedMissions.intro) {
              UnableToRun.setDescription(
                `You need to complete the SueLuz introduction mission to use SueLuz features, ${CommandLinks.SueLuzIntro}`
              );
              return interaction.reply({
                embeds: [UnableToRun],
                ephemeral: true
              });
            }

            const { paymentType, remainingBalance, errorMessage } =
              processPayment(
                preferredPaymentMethod,
                userData.cash,
                userData.bank,
                userBet
              );

            const insufficientFunds = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(`${errorMessage}`);

            if (errorMessage !== null)
              return interaction.reply({
                embeds: [insufficientFunds],
                ephemeral: true
              });

            const GuessedNumber: number = Math.floor(Math.random() * 100);
            const SystemGenerated: number = Math.floor(Math.random() * 100);

            const GuessEmbed = new EmbedBuilder()
              .setTitle(
                `${emojis.ParrotDance} HIGHER OR LOWER ${emojis.ParrotDance}`
              )
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `I am going to guess a number and the system is going to generate a number, you'll have to guess if my number is **HIGHER OR LOWER** than the system's number! 🤔\n\n- You have 5 minutes to answer [Refunds are unavailable], Payment Method: ${capitalize(
                  paymentType
                )}`
              )
              .setFooter({
                text: `Current location: Nova Casino and resort || Remember the house always wins`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const choicesButtons: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setCustomId("lower")
                  .setLabel("Lower!")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("same")
                  .setLabel("Same!")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("higher")
                  .setLabel("Higher!")
                  .setStyle(ButtonStyle.Secondary)
              ]);

            const disabledButtons: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setCustomId("lower")
                  .setLabel("Lower!")
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(true),
                new ButtonBuilder()
                  .setCustomId("same")
                  .setLabel("Same!")
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(true),
                new ButtonBuilder()
                  .setCustomId("higher")
                  .setLabel("Higher!")
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(true)
              ]);

            await interaction.reply({
              embeds: [GuessEmbed],
              components: [choicesButtons]
            });

            const CashEarned: number = Math.ceil(userBet * 1.5);
            const RPEarned: number = Math.floor(userBet * 0.25);

            const accountLevelUp = checkRankAccount(
              userData.Rank,
              userData.RP,
              RPEarned
            );

            const VictoryEmbed = new EmbedBuilder()
              .setTitle(`${emojis.ParrotDance} We have a WINNER!`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `The number I guess: ${GuessedNumber}, the number generated by the system: ${SystemGenerated}\n\nCash Earned: \`₲${CashEarned.toLocaleString()}\`\nRP Earned: \`${RPEarned.toLocaleString()}\``
              );

            const LossEmbed = new EmbedBuilder()
              .setTitle(`😔 Better luck next time`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `The number I guess: ${GuessedNumber}, the number generated by the system: ${SystemGenerated}\n\nRP Earned: \`${RPEarned.toLocaleString()}\`\n\nCash that you would've won: \`₲${CashEarned.toLocaleString()}\``
              );

            const casinoData = await GBFCasinoModel.findOne({
              userID: interaction.user.id
            });

            if (casinoData) {
              await casinoData.updateOne({
                CashSpent: casinoData.CashSpent + userBet
              });
            }

            await userData.updateOne({
              cash: paymentType === "wallet" ? remainingBalance : userData.cash,
              bank: paymentType === "bank" ? remainingBalance : userData.bank
            });

            function checkGuess(
              userInput: string,
              botGuess: number,
              systemGen: number
            ): boolean {
              if (userInput === "higher") return botGuess > systemGen;
              if (userInput === "lower") return botGuess < systemGen;
            }

            const filter = (i: Interaction) => {
              return i.user.id === interaction.user.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                idle: 300000,
                time: 300000,
                maxComponents: 1,
                componentType: ComponentType.Button
              });

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              if (i.customId === "lower") {
                if (!checkGuess("lower", GuessedNumber, SystemGenerated)) {
                  if (!casinoData) {
                    const newCasinoData = new GBFCasinoModel({
                      userID: interaction.user.id,
                      CashSpent: userBet,
                      Losses: 1
                    });

                    await newCasinoData.save();
                  } else {
                    await casinoData.updateOne({
                      Losses: casinoData.Losses + 1
                    });
                  }
                  if (!accountLevelUp[0])
                    await userData.updateOne({
                      RP: userData.RP + RPEarned
                    });

                  interaction.editReply({
                    embeds: [LossEmbed]
                  });

                  collector.stop("gameEnded");
                } else if (
                  checkGuess("lower", GuessedNumber, SystemGenerated)
                ) {
                  if (!casinoData) {
                    const newCasinoData = new GBFCasinoModel({
                      userID: interaction.user.id,
                      CashSpent: userBet,
                      Wins: 1,
                      CashEarned: CashEarned
                    });

                    await newCasinoData.save();
                  } else {
                    await casinoData.updateOne({
                      Wins: casinoData.Losses + 1,
                      CashEarned: casinoData.CashEarned + CashEarned
                    });
                  }

                  await userData.updateOne({
                    cash: userData.cash + CashEarned,
                    totalEarned: userData.totalEarned + CashEarned
                  });

                  if (!accountLevelUp[0])
                    await userData.updateOne({
                      RP: userData.RP + RPEarned
                    });

                  interaction.editReply({
                    embeds: [VictoryEmbed]
                  });

                  collector.stop("gameEnded");
                }
              } else if (i.customId === "same") {
                if (GuessedNumber !== SystemGenerated) {
                  if (!casinoData) {
                    const newCasinoData = new GBFCasinoModel({
                      userID: interaction.user.id,
                      CashSpent: userBet,
                      Losses: 1
                    });

                    await newCasinoData.save();
                  } else {
                    await casinoData.updateOne({
                      Losses: casinoData.Losses + 1
                    });
                  }

                  if (!accountLevelUp[0])
                    await userData.updateOne({
                      RP: userData.RP + RPEarned
                    });

                  interaction.editReply({
                    embeds: [LossEmbed]
                  });

                  collector.stop("gameEnded");
                } else {
                  if (!casinoData) {
                    const newCasinoData = new GBFCasinoModel({
                      userID: interaction.user.id,
                      CashSpent: userBet,
                      Wins: 1,
                      CashEarned: CashEarned
                    });

                    await newCasinoData.save();
                  } else {
                    await casinoData.updateOne({
                      Wins: casinoData.Losses + 1,
                      CashEarned: casinoData.CashEarned + CashEarned
                    });
                  }
                  await userData.updateOne({
                    cash: userData.cash + CashEarned,
                    totalEarned: userData.totalEarned + CashEarned
                  });

                  if (!accountLevelUp[0])
                    await userData.updateOne({
                      RP: userData.RP + RPEarned
                    });

                  interaction.editReply({
                    embeds: [VictoryEmbed]
                  });

                  collector.stop("gameEnded");
                }
              } else if (i.customId === "higher") {
                if (!checkGuess("higher", GuessedNumber, SystemGenerated)) {
                  if (!casinoData) {
                    const newCasinoData = new GBFCasinoModel({
                      userID: interaction.user.id,
                      CashSpent: userBet,
                      Losses: 1
                    });

                    await newCasinoData.save();
                  } else {
                    await casinoData.updateOne({
                      Losses: casinoData.Losses + 1
                    });
                  }
                  if (!accountLevelUp[0])
                    await userData.updateOne({
                      RP: userData.RP + RPEarned
                    });

                  interaction.editReply({
                    embeds: [LossEmbed]
                  });

                  collector.stop("gameEnded");
                } else if (
                  checkGuess("higher", GuessedNumber, SystemGenerated)
                ) {
                  if (!casinoData) {
                    const newCasinoData = new GBFCasinoModel({
                      userID: interaction.user.id,
                      CashSpent: userBet,
                      Wins: 1,
                      CashEarned: CashEarned
                    });

                    await newCasinoData.save();
                  } else {
                    await casinoData.updateOne({
                      Wins: casinoData.Losses + 1,
                      CashEarned: casinoData.CashEarned + CashEarned
                    });
                  }

                  await userData.updateOne({
                    cash: userData.cash + CashEarned,
                    totalEarned: userData.totalEarned + CashEarned
                  });

                  if (!accountLevelUp[0])
                    await userData.updateOne({
                      RP: userData.RP + RPEarned
                    });

                  interaction.editReply({
                    embeds: [VictoryEmbed]
                  });

                  collector.stop("gameEnded");
                }
              }
            });

            collector.on("end", async (collected, reason) => {
              if (reason === "gameEnded" || reason === "componentLimit") {
                if (accountLevelUp[0])
                  client.emit(
                    "playerLevelUp",
                    interaction,
                    interaction.user,
                    "accountLevel",
                    accountLevelUp[1],
                    accountLevelUp[2]
                  );
              }
              await interaction.editReply({
                components: [disabledButtons]
              });
            });
          }
        },
        slots: {
          description: "Play slots | costs 2,500 to play",
          execute: async ({ client, interaction }: IExecute) => {
            const userData = await GBFUserProfileModel.findOne({
              userID: interaction.user.id
            });

            const UnableToRun = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable);

            if (!userData) {
              UnableToRun.setDescription(
                `You don't have a SueLuz account, create one using: ${CommandLinks.SueLuzRegister}`
              );
              return interaction.reply({
                embeds: [UnableToRun],
                ephemeral: true
              });
            }
            if (!userData.completedMissions.intro) {
              UnableToRun.setDescription(
                `You need to complete the SueLuz introduction mission to use SueLuz features, ${CommandLinks.SueLuzIntro}`
              );
              return interaction.reply({
                embeds: [UnableToRun],
                ephemeral: true
              });
            }

            const { paymentType, remainingBalance, errorMessage } =
              processPayment("wallet", userData.cash, userData.bank, 2500);

            const insufficientFunds = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(`${errorMessage}`);

            if (errorMessage !== null)
              return interaction.reply({
                embeds: [insufficientFunds],
                ephemeral: true
              });

            await userData.updateOne({
              cash: paymentType === "wallet" ? remainingBalance : userData.cash,
              bank: paymentType === "bank" ? remainingBalance : userData.bank
            });

            const casinoData = await GBFCasinoModel.findOne({
              userID: interaction.user.id
            });

            if (casinoData)
              await casinoData.updateOne({
                CashSpent: casinoData.CashSpent + 2500
              });

            interface Symbol {
              name: string;
              image: string;
              value: number;
            }

            function playSlotMachine(): {
              results: Symbol[];
              winnings: number;
            } {
              const symbols: Symbol[] = [
                { name: "cherry", image: "🍒", value: 10 },
                { name: "lemon", image: "🍋", value: 20 },
                { name: "orange", image: "🍊", value: 50 },
                { name: "plum", image: "🍇", value: 1000 },
                { name: "bell", image: "🔔", value: 2000 },
                { name: "bar", image: "🍫", value: 6000 },
                { name: "seven", image: "7️⃣", value: 70000 }
              ];

              const rows = 3;
              const maxLines = 5;
              const maxWin = 250000;

              const results = [];
              for (let j = 0; j < rows; j++) {
                const symbolIndex = Math.floor(Math.random() * symbols.length);
                const symbol = symbols[symbolIndex];
                results.push(symbol);
              }

              function GetWinnings(results: Symbol[], maxWin: number) {
                let totalWin = 0;
                for (let i = 0; i < maxLines; i++) {
                  const payline = [];
                  for (let j = 0; j < rows; j++) {
                    payline.push(results[j]);
                  }
                  const matchedSymbols = payline.filter(
                    (s) => s.name === payline[0].name
                  ).length;
                  if (matchedSymbols >= 2) {
                    const award = matchedSymbols * payline[0].value;
                    totalWin += award;
                  }
                }
                return Math.min(totalWin, maxWin);
              }

              const winnings = GetWinnings(results, maxWin);
              return { results, winnings };
            }

            const { results, winnings } = playSlotMachine();

            const SlotsEmbed = new EmbedBuilder()
              .setTitle(`Sparkling 7️⃣ 7️⃣ 7️⃣ Diamond`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `----------| ${results.map(
                  (s) => `${s.image} |`
                )}-----------\nWon: \`₲${winnings.toLocaleString()}\``
              );

            await userData.updateOne({
              cash: userData.cash + winnings
            });

            const newCasinoData = new GBFCasinoModel({
              userID: interaction.user.id,
              CashSpent: 2500
            });

            if (winnings > 0) {
              if (casinoData)
                await casinoData.updateOne({
                  CashEarned: casinoData.CashEarned + winnings,
                  Wins: casinoData.Wins + 1
                });
              else {
                newCasinoData.Wins = 1;
                newCasinoData.CashEarned = winnings;
                await newCasinoData.save();
              }
            } else {
              if (casinoData) {
                await casinoData.updateOne({
                  Losses: casinoData.Losses + 1
                });
              } else {
                newCasinoData.Losses = 1;
                await newCasinoData.save();
              }
            }

            return interaction.reply({
              embeds: [SlotsEmbed]
            });
          }
        }
      }
    });
  }
}
