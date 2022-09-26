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
  DailyMoney,
  DailyRP,
  checkRank,
  guessReward
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
        guess: {
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
            console.log(guessedNumber);
            let gameAnswer;

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

                if (checkRank(userData.rank, userData.RP + RPReward))
                  await client.emit(
                    "playerLevelUp",
                    interaction,
                    interaction.user
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

                if (checkRank(userData.rank, userData.RP + RPReward))
                  await client.emit(
                    "playerLevelUp",
                    interaction,
                    interaction.user
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

                if (checkRank(userData.rank, userData.RP + RPReward))
                  await client.emit(
                    "playerLevelUp",
                    interaction,
                    interaction.user
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
        }
      }
    });
  }
};
