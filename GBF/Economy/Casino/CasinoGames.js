const SlashCommand = require("../../../utils/slashCommands");

const colours = require("../../../GBFColor.json");
const emojis = require("../../../GBFEmojis.json");
const title = require("../../../gbfembedmessages.json");

const userSchema = require("../../../schemas/Economy Schemas/User Profile Schema");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

const { delay } = require("../../../utils/engine");

const {
  accountRequired,
  incompleteTutorial,
  checkRank,
  guessReward,
  slotMachine,
  abbreviateNumber,
  horseRacing
} = require("../../../utils/DunkelLuzEngine");

module.exports = class CasinoGames extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "casino",
      description: "DunkelLuz Casino games",
      category: "Economy",
      userPermission: [],
      botPermission: [],
      cooldown: 2,
      development: true,
      subcommands: {
        highlow: {
          description: "Higher or lower guessing game",
          args: [
            {
              name: "bet",
              description:
                "The amount of money that you want to bet on this game",
              type: "INTEGER",
              minValue: 50,
              maxValue: 500000,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const userBet = interaction.options.getInteger("bet");

            const userData = await userSchema.findOne({
              userId: interaction.user.id
            });

            if (!userData)
              return interaction.reply({
                embeds: [accountRequired],
                ephemeral: true
              });

            if (!userData.introComplete)
              return interaction.reply({
                embeds: [incompleteTutorial],
                ephemeral: true
              });

            const insufficientFunds = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `You don't have sufficient funds to play this, you need **₲${userBet.toLocaleString()}**`
              )
              .setTimestamp();

            if (userData.wallet < userBet && userData.bank < userBet)
              return interaction.reply({
                embeds: [insufficientFunds],
                ephemeral: true
              });

            let paymentMethod;

            if (userData.wallet > userBet) paymentMethod = "Wallet";
            else paymentMethod = "Bank";

            const actualNumber = Math.floor(Math.random() * 100);
            const guessedNumber = Math.floor(Math.random() * 100);

            let gameAnswer;
            //This is an over-engineered way of solving this issue, I'm fully aware of that and I won't change it
            if (actualNumber - guessedNumber > 0) gameAnswer = "Lower";
            else if (actualNumber - guessedNumber < 0) gameAnswer = "Higher";
            else gameAnswer = "Same";

            const guessMessage = new MessageEmbed()
              .setTitle(
                `${emojis.ParrotDance} HIGHER OR LOWER ${emojis.ParrotDance}`
              )
              .setColor(colours.DEFAULT)
              .setDescription(
                `I guessed a number, is it higher, lower or equal to ${actualNumber} 🤔\n\nYou have 5 minutes to choose an answer, the cash will not be deducted if the timer runs out.`
              )
              .setFooter({
                text: `Current location: Nova Casino and resort || Remember the house always wins`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const guessButtons = new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId("lowerGuess")
                .setLabel("Lower")
                .setStyle("SECONDARY"),
              new MessageButton()
                .setCustomId("sameGuess")
                .setLabel("Same")
                .setStyle("SECONDARY"),
              new MessageButton()
                .setCustomId("higherGuess")
                .setLabel("Higher")
                .setStyle("SECONDARY")
            ]);

            const guessButtonsD = new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId("lowerGuessD")
                .setLabel("Lower")
                .setDisabled(true)
                .setStyle("SECONDARY"),
              new MessageButton()
                .setCustomId("sameGuessD")
                .setLabel("Same")
                .setDisabled(true)
                .setStyle("SECONDARY"),
              new MessageButton()
                .setCustomId("higherGuessD")
                .setLabel("Higher")
                .setDisabled(true)
                .setStyle("SECONDARY")
            ]);

            await interaction.reply({
              embeds: [guessMessage],
              components: [guessButtons]
            });

            const filter = (i) => {
              return i.user.id === interaction.user.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                time: 300000
              });

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              const gameReward = guessReward(userBet);
              const cashReward = gameReward[0];
              const RPReward = gameReward[1];

              const victoryScreen = new MessageEmbed()
                .setTitle(`🎉 We have a winner!`)
                .setColor(colours.DEFAULT)
                .setDescription(
                  `Guessed Number: ${guessedNumber}\nActual Number: ${actualNumber}\n\nBet: ₲ ${userBet.toLocaleString()}\nCash Won: ₲ ${cashReward.toLocaleString()}\nRP Won: ${RPReward.toLocaleString()}`
                )
                .setFooter({
                  text: `Make sure to come back! || Nova Casino and resort`,
                  iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

              const lossScreen = new MessageEmbed()
                .setTitle(`😕 Better luck next time`)
                .setColor(colours.DEFAULT)
                .setDescription(
                  `Guessed Number: ${guessedNumber}\nActual Number: ${actualNumber}\n\nBet: ₲ ${userBet.toLocaleString()}\nCould've won:\n\nCash: ₲ ${cashReward.toLocaleString()}\nRP: ${RPReward.toLocaleString()}`
                )
                .setFooter({
                  text: `Make sure to come back! || Nova Casino and resort`,
                  iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

              let netWinning = cashReward - userBet;

              if (i.customId === "lowerGuess" && gameAnswer === "Lower") {
                await collector.stop({
                  reason: "ended"
                });

                await userData.updateOne({
                  bank:
                    paymentMethod === "Bank"
                      ? userData.bank + netWinning
                      : userData.bank,
                  wallet:
                    paymentMethod === "Wallet"
                      ? userData.wallet + netWinning
                      : userData.wallet,
                  netWorth: userData.netWorth + netWinning,
                  totalEarned: userData.totalEarned + netWinning,
                  casinoWins: userData.casinoWins + 1,
                  casinoBet: userData.casinoBet + userBet,
                  casinoCashWin: userData.casinoCashWin + netWinning,
                  RP: userData.RP + RPReward,
                  totalRPEarned: userData.totalRPEarned + RPReward
                });

                if (
                  checkRank(
                    userData.rank,
                    userData.RP,
                    userData.RP + RPReward
                  )[0]
                )
                  await client.emit(
                    "playerLevelUp",
                    interaction,
                    interaction.user,
                    checkRank(
                      userData.rank,
                      userData.RP,
                      userData.RP + RPReward
                    )[1],
                    checkRank(
                      userData.rank,
                      userData.RP,
                      userData.RP + RPReward
                    )[2]
                  );

                return interaction.editReply({
                  embeds: [victoryScreen],
                  components: []
                });
              } else if (i.customId === "sameGuess" && gameAnswer === "Same") {
                await collector.stop({
                  reason: "ended"
                });

                await userData.updateOne({
                  bank:
                    paymentMethod === "Bank"
                      ? userData.bank + netWinning
                      : userData.bank,
                  wallet:
                    paymentMethod === "Wallet"
                      ? userData.wallet + netWinning
                      : userData.wallet,
                  netWorth: userData.netWorth + netWinning,
                  totalEarned: userData.totalEarned + netWinning,
                  casinoWins: userData.casinoWins + 1,
                  casinoBet: userData.casinoBet + userBet,
                  casinoCashWin: userData.casinoCashWin + netWinning,
                  RP: userData.RP + RPReward,
                  totalRPEarned: userData.totalRPEarned + RPReward
                });

                if (
                  checkRank(
                    userData.rank,
                    userData.RP,
                    userData.RP + RPReward
                  )[0]
                )
                  await client.emit(
                    "playerLevelUp",
                    interaction,
                    interaction.user,
                    checkRank(
                      userData.rank,
                      userData.RP,
                      userData.RP + RPReward
                    )[1],
                    checkRank(
                      userData.rank,
                      userData.RP,
                      userData.RP + RPReward
                    )[2]
                  );

                return interaction.editReply({
                  embeds: [victoryScreen],
                  components: []
                });
              } else if (
                i.customId === "higherGuess" &&
                gameAnswer === "Higher"
              ) {
                await collector.stop({
                  reason: "ended"
                });

                await userData.updateOne({
                  bank:
                    paymentMethod === "Bank"
                      ? userData.bank + netWinning
                      : userData.bank,
                  wallet:
                    paymentMethod === "Wallet"
                      ? userData.wallet + netWinning
                      : userData.wallet,
                  netWorth: userData.netWorth + netWinning,
                  totalEarned: userData.totalEarned + netWinning,
                  casinoWins: userData.casinoWins + 1,
                  casinoBet: userData.casinoBet + userBet,
                  casinoCashWin: userData.casinoCashWin + netWinning,
                  RP: userData.RP + RPReward,
                  totalRPEarned: userData.totalRPEarned + RPReward
                });

                if (
                  checkRank(
                    userData.rank,
                    userData.RP,
                    userData.RP + RPReward
                  )[0]
                )
                  await client.emit(
                    "playerLevelUp",
                    interaction,
                    interaction.user,
                    checkRank(
                      userData.rank,
                      userData.RP,
                      userData.RP + RPReward
                    )[1],
                    checkRank(
                      userData.rank,
                      userData.RP,
                      userData.RP + RPReward
                    )[2]
                  );

                return interaction.editReply({
                  embeds: [victoryScreen],
                  components: []
                });
              } else {
                await collector.stop({
                  reason: "ended"
                });

                await userData.updateOne({
                  bank:
                    paymentMethod === "Bank"
                      ? userData.bank - userBet
                      : userData.bank,
                  wallet:
                    paymentMethod === "Wallet"
                      ? userData.wallet - userBet
                      : userData.wallet,
                  netWorth: userData.netWorth - userBet,
                  casinoLosses: userData.casinoLosses + 1,
                  casinoBet: userData.casinoBet + userBet
                });

                return interaction.editReply({
                  embeds: [lossScreen],
                  components: []
                });
              }
            });
            const timedOut = new MessageEmbed()
              .setTitle(`🕒 Timed out`)
              .setDescription(
                `The 5 minute timer ran out, you can always re-run the command and no money has been deducted from your account.`
              )
              .setColor(colours.ERRORRED);

            collector.on("end", async (collected, reason) => {
              if (reason.reason === "ended")
                return interaction.editReply({
                  components: [guessButtonsD]
                });
              else
                return interaction.editReply({
                  embeds: [timedOut],
                  components: [guessButtonsD]
                });
            });
          }
        },
        slots: {
          description: "Basic slots game with 5 different options",
          args: [
            {
              name: "bet",
              description:
                "The amount of money that you want to bet on this game",
              type: "INTEGER",
              minValue: 100,
              maxValue: 50000,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const userBet = interaction.options.getInteger("bet");

            const userData = await userSchema.findOne({
              userId: interaction.user.id
            });

            if (!userData)
              return interaction.reply({
                embeds: [accountRequired],
                ephemeral: true
              });

            if (!userData.introComplete)
              return interaction.reply({
                embeds: [incompleteTutorial],
                ephemeral: true
              });

            const insufficientFunds = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `You don't have sufficient funds to play this, you need **₲${userBet.toLocaleString()}**`
              )
              .setTimestamp();

            if (userData.wallet < userBet && userData.bank < userBet)
              return interaction.reply({
                embeds: [insufficientFunds],
                ephemeral: true
              });

            let paymentMethod;

            if (userData.wallet > userBet) paymentMethod = "Wallet";
            else paymentMethod = "Bank";

            const rollingEmbed = new MessageEmbed()
              .setTitle(`🎰 Rolling`)
              .setColor(colours.DEFAULT)
              .setDescription(
                `${emojis.ultraRoll} | ${emojis.donutSpin} | ${emojis.ultraRoll}`
              )
              .setTimestamp()
              .setFooter({
                text: "Location: Nova Casino and Resort"
              });

            let firstSpin = Math.floor(Math.random() * 5);
            let secondSpin = Math.floor(Math.random() * 5);
            let thirdSpin = Math.floor(Math.random() * 5);

            if (firstSpin === 0) firstSpin = 1;
            if (secondSpin === 0) secondSpin = 1;
            if (thirdSpin === 0) thirdSpin = 1;

            const slotResult = slotMachine(
              userBet,
              firstSpin,
              secondSpin,
              thirdSpin
            );

            await userData.updateOne({
              bank:
                paymentMethod === "Bank"
                  ? userData.bank - userBet
                  : userData.bank,
              wallet:
                paymentMethod === "Wallet"
                  ? userData.wallet - userBet
                  : userData.wallet,
              netWorth: userData.netWorth - userBet,
              casinoBet: userData.casinoBet + userBet
            });

            const spins = {
              1: emojis.blackSpin,
              2: emojis.pinkSpin,
              3: emojis.redSpin,
              4: emojis.whiteSpin,
              5: emojis.donutSpin
            };

            await interaction.reply({
              embeds: [rollingEmbed]
            });

            firstSpin = spins[firstSpin];
            secondSpin = spins[secondSpin];
            thirdSpin = spins[thirdSpin];

            rollingEmbed.setDescription(
              `${firstSpin} | ${secondSpin} | ${thirdSpin} \`${slotResult[1]}x\``
            );

            if (slotResult[1] === 0) {
              await userData.updateOne({
                casinoLosses: userData.casinoLosses + 1
              });
              rollingEmbed.addFields({
                name: "Winnings:",
                value: `Nothing 💤`
              });
            } else {
              await userData.updateOne({
                casinoWins: userData.casinoWins + 1,
                casinoCashWin: userData.casinoCashWin + slotResult[0],
                totalEarned: userData.totalEarned + slotResult[0],
                bank:
                  paymentMethod === "Bank"
                    ? userData.bank + slotResult[0]
                    : userData.bank,
                wallet:
                  paymentMethod === "Wallet"
                    ? userData.wallet + slotResult[0]
                    : userData.wallet,
                netWorth: userData.netWorth + slotResult[0],
                totalRPEarned: userData.totalRPEarned + 1000,
                RP: userData.RP + 1000
              });

              if (checkRank(userData.rank, userData.RP, userData.RP + 1000)[0])
                await client.emit(
                  "playerLevelUp",
                  interaction,
                  interaction.user,
                  checkRank(userData.rank, userData.RP, userData.RP + 1000)[1],
                  checkRank(userData.rank, userData.RP, userData.RP + 1000)[2]
                );

              rollingEmbed.addFields({
                name: "Winnings:",
                value: `• ₲${abbreviateNumber(
                  slotResult[0],
                  2,
                  false,
                  false
                )}\n• 1,000 RP`
              });
            }
            setTimeout(() => {
              return interaction.editReply({
                embeds: [rollingEmbed]
              });
            }, 1500);
          }
        },
        ["horse-racing"]: {
          description: "Bet on a participating horse in the DunkelLuz track",
          args: [
            {
              name: "horse",
              description: "The horse that you want to bet on",
              type: "STRING",
              choices: [
                {
                  name: "blue",
                  value: "0"
                },
                {
                  name: "red",
                  value: "1"
                },
                {
                  name: "green",
                  value: "2"
                },
                {
                  name: "white",
                  value: "3"
                }
              ],
              required: true
            },
            {
              name: "bet",
              description: "The amount of money you want to bet",
              type: "INTEGER",
              minValue: 10000,
              maxValue: 250000,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const userBet = interaction.options.getInteger("bet");
            const chosenHorse = interaction.options.getString("horse");

            const userData = await userSchema.findOne({
              userId: interaction.user.id
            });

            if (!userData)
              return interaction.reply({
                embeds: [accountRequired],
                ephemeral: true
              });

            if (!userData.introComplete)
              return interaction.reply({
                embeds: [incompleteTutorial],
                ephemeral: true
              });

            const insufficientFunds = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `You don't have sufficient funds to play this, you need **₲${userBet.toLocaleString()}**`
              )
              .setTimestamp();

            if (userData.wallet < userBet && userData.bank < userBet)
              return interaction.reply({
                embeds: [insufficientFunds],
                ephemeral: true
              });

            let paymentMethod;

            if (userData.wallet > userBet) paymentMethod = "Wallet";
            else paymentMethod = "Bank";

            const racingEmbed = new MessageEmbed()
              .setTitle(`🐎 DunkelLuz Horse Racing`)
              .setColor(colours.DEFAULT)
              .setDescription(`🏇 |🏇 | 🐎 | 🏇`)
              .setFooter({
                text: `The biggest risks give the biggest rewards || Nova Casino and Resort`
              })
              .setTimestamp();

            await interaction.reply({
              embeds: [racingEmbed]
            });

            const netWinning = horseRacing(userBet, chosenHorse)[1] - userBet;
            const RPReward = horseRacing(userBet, chosenHorse)[2];

            if (horseRacing(userBet, chosenHorse)[0] === true) {
              await userData.updateOne({
                bank:
                  paymentMethod === "Bank"
                    ? userData.bank + netWinning
                    : userData.bank,
                wallet:
                  paymentMethod === "Wallet"
                    ? userData.wallet + netWinning
                    : userData.wallet,
                netWorth: userData.netWorth + netWinning,
                totalEarned: userData.totalEarned + netWinning,
                casinoWins: userData.casinoWins + 1,
                casinoBet: userData.casinoBet + userBet,
                casinoCashWin: userData.casinoCashWin + netWinning,
                RP: userData.RP + RPReward,
                totalRPEarned: userData.totalRPEarned + RPReward
              });

              const raceWon = new MessageEmbed()
                .setTitle(`🐎 DunkelLuz Horse Racing`)
                .setColor(colours.DEFAULT)
                .setDescription(
                  `🎉 We have a winner 🎉\nHorse ${chosenHorse} finished first!\n\nRewards:\n\n• ₲${abbreviateNumber(
                    netWinning,
                    2,
                    false,
                    false
                  )}\n ${abbreviateNumber(
                    RPReward,
                    2,
                    false,
                    false
                  )} RP\n\nBets:\n• ₲${abbreviateNumber(
                    horseRacing(userBet, chosenHorse)[4],
                    2,
                    false,
                    false
                  )}\n• ₲${abbreviateNumber(
                    horseRacing(userBet, chosenHorse)[5],
                    2,
                    false,
                    false
                  )}\n• ₲${abbreviateNumber(
                    horseRacing(userBet, chosenHorse)[6],
                    2,
                    false,
                    false
                  )}`
                )
                .setFooter({
                  text: `The biggest risks give the biggest rewards || Nova Casino and Resort`
                })
                .setTimestamp();

              setTimeout(async () => {
                if (
                  checkRank(
                    userData.rank,
                    userData.RP,
                    userData.RP + RPReward
                  )[0]
                )
                  await client.emit(
                    "playerLevelUp",
                    interaction,
                    interaction.user,
                    checkRank(
                      userData.rank,
                      userData.RP,
                      userData.RP + RPReward
                    )[1],
                    checkRank(
                      userData.rank,
                      userData.RP,
                      userData.RP + RPReward
                    )[2]
                  );

                return interaction.editReply({
                  embeds: [raceWon]
                });
              }, 1500);
            }
          }
        }
      }
    });
  }
};
