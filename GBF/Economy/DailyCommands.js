const SlashCommand = require("../../utils/slashCommands");

const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");
const title = require("../../gbfembedmessages.json");

const userSchema = require("../../schemas/Economy Schemas/User Profile Schema");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

const { delay } = require("../../utils/engine");

const {
  accountRequired,
  incompleteTutorial,
  DailyMoney,
  DailyRP,
  checkRank
} = require("../../utils/DunkelLuzEngine");

const next24Hours = Math.round((Date.now() + 24 * 60 * 60 * 1000) / 1000);

module.exports = class DailyCommands extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "daily",
      description: "DunkelLuz daily collectable commands",
      category: "Economy",
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: true,
      subcommands: {
        collect: {
          description: "Collect your DunkelLuz login daily reward",
          execute: async ({ client, interaction }) => {
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

            const CurrentStreak = userData.dailyStreak;

            const onCooldown = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You cannot use that yet`)
              .setDescription(
                `You have already collected your daily reward!\n\nYou can collect it again **<t:${Math.floor(
                  userData.dailyCooldown / 1000 + 86400
                )}:R>**\n\nCurrent streak: **${CurrentStreak.toLocaleString()} day(s) 🔥**`
              )
              .setColor(colours.ERRORRED)
              .setTimestamp();

            if (Date.parse(userData.dailyCooldown) + 86400000 > Date.now())
              return interaction.reply({
                embeds: [onCooldown],
                ephemeral: true
              });

            const lastCollected = Math.round(userData.dailyCooldown / 1000);

            const lostStreak = new MessageEmbed()
              .setTitle("Collected 💰")
              .setColor(colours.DEFAULT)
              .setDescription(
                `Looks like you failed to keep up the streak up 🙊\nLast time collected: <t:${lastCollected}:F>\nYour last streak was: ${CurrentStreak} day(s) 🔥\n\n• ₲300\n• 100 RP\n\nYou can collect your next daily: <t:${next24Hours}:F>`
              )
              .setFooter({
                text: `If you think there is a mistake please contact support (/bot invite) || The streak dies after 48 hours of not claiming your reward`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (Date.parse(userData.dailyCooldown) + 172800000 < Date.now()) {
              await userData.updateOne({
                dailyStreak: 1,
                bank: userData.bank + 300,
                netWorth: userData.netWorth + 300,
                totalEarned: userData.totalEarned + 300,
                RP: userData.RP + 100,
                totalRPEarned: userData.totalRPEarned + 100,
                dailyCooldown: new Date(Date.now())
              });

              if (checkRank(userData.rank, userData.RP + 100))
                await client.emit(
                  "playerLevelUp",
                  interaction,
                  interaction.user
                );

              return interaction.reply({
                embeds: [lostStreak]
              });
            }

            if (
              CurrentStreak + 1 === 100 &&
              !userData.achievements.includes("100Streak")
            ) {
              const achievementType = {
                type: "100Streak",
                hasBadge: true
              };
              await client.emit(
                "achievementComplete",
                interaction,
                interaction.user,
                achievementType
              );
            }

            const EarnedMoney = DailyMoney(CurrentStreak + 1);
            const EarnedRP = DailyRP(CurrentStreak + 1);

            const dailyCollected = new MessageEmbed()
              .setTitle("Collected 💰")
              .setColor(colours.DEFAULT)
              .setDescription(
                `**Collected your daily reward!**\n\n• ₲${EarnedMoney.toLocaleString()}\n• ${EarnedRP.toLocaleString()} RP\n• Daily Streak: ${(
                  CurrentStreak + 1
                ).toLocaleString()} day(s) 🔥\n\nYou can collect your next daily: <t:${next24Hours}:F>`
              )
              .setFooter({
                text: `Keep the streak up for better rewards! || The streak dies after 48 hours of not claiming your reward`,
                iconURL: interaction.user.displayAvatarURL()
              });

            await userData.updateOne({
              dailyStreak: userData.dailyStreak + 1,
              bank: userData.bank + EarnedMoney,
              netWorth: userData.netWorth + EarnedMoney,
              totalEarned: userData.totalEarned + EarnedMoney,
              RP: userData.RP + EarnedRP,
              totalRPEarned: userData.totalRPEarned + EarnedRP,
              dailyCooldown: new Date(Date.now())
            });

            if (checkRank(userData.rank, userData.RP + EarnedRP))
              await client.emit("playerLevelUp", interaction, interaction.user);

            return interaction.reply({
              embeds: [dailyCollected]
            });
          }
        },
        spin: {
          description: "Spin the lucky wheel for a chance to win up to 8M cash",
          execute: async ({ client, interaction }) => {
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

            //10
            const luckyWheelRPPrizes = `• 200 RP\n• 400 RP\n• 800 RP\n• 1,000 RP\n• 1,500 RP\n• 3,000 RP\n• 4,000 RP\n• 10,000 RP\n•  15,000 RP\n• 20,000 RP`;
            //14
            const luckyWheelCashPrizes = `• ₲20\n• ₲40\n• ₲60\n• ₲80\n• ₲100\n• ₲200\n• ₲500\n• ₲1,000\n• ₲1,200\n• ₲2,000\n• ₲5,000\n• ₲50,000\n• ₲750,000\n• ₲100,000`;
            //3
            const luckyWheelJackpots = `• ${emojis.dunkelCoin}100 DunkelCoins\n• ₲500,000\n• ₲8,000,000`;

            let prizeType;
            let prize;

            let wheelSpin = Math.floor(Math.random() * 27);
            if (wheelSpin === 0) wheelSpin = 1;

            switch (wheelSpin) {
              case 1:
                prizeType = "RP";
                prize = 200;
                break;
              case 2:
                prizeType = "RP";
                prize = 400;
                break;
              case 3:
                prizeType = "RP";
                prize = 800;
                break;
              case 4:
                prizeType = "RP";
                prize = 1000;
                break;
              case 5:
                prizeType = "RP";
                prize = 1500;
                break;
              case 6:
                prizeType = "RP";
                prize = 3000;
                break;
              case 7:
                prizeType = "RP";
                prize = 4000;
                break;
              case 8:
                prizeType = "RP";
                prize = 10000;
                break;
              case 9:
                prizeType = "RP";
                prize = 15000;
                break;
              case 10:
                prizeType = "RP";
                prize = 20000;
                break;
              case 11:
                prizeType = "Cash";
                prize = 20;
                break;
              case 12:
                prizeType = "Cash";
                prize = 40;
                break;
              case 13:
                prizeType = "Cash";
                prize = 60;
                break;
              case 14:
                prizeType = "Cash";
                prize = 80;
                break;
              case 15:
                prizeType = "Cash";
                prize = 100;
                break;
              case 16:
                prizeType = "Cash";
                prize = 200;
                break;
              case 17:
                prizeType = "Cash";
                prize = 500;
                break;
              case 18:
                prizeType = "Cash";
                prize = 1000;
                break;
              case 19:
                prizeType = "Cash";
                prize = 1200;
                break;
              case 20:
                prizeType = "Cash";
                prize = 2000;
                break;
              case 21:
                prizeType = "Cash";
                prize = 5000;
                break;
              case 22:
                prizeType = "Cash";
                prize = 50000;
                break;
              case 23:
                prizeType = "Cash";
                prize = 75000;
                break;
              case 24:
                prizeType = "Cash";
                prize = 100000;
                break;
              case 25:
                prizeType = "DunkelCoins/Jackpot";
                prize = 100;
                break;
              case 26:
                prizeType = "Cash/Jackpot";
                prize = 500000;
                break;
              case 27:
                prizeType = "Cash/Jackpot";
                prize = 8000000;
                break;
              default:
                prizeType = "RP";
                prize = 200;
                break;
            }

            const luckyWheelStart = new MessageEmbed()
              .setTitle(`Lucky Wheel`)
              .setColor(colours.DEFAULT)
              .addFields(
                {
                  name: "Cash Rewards:",
                  value: `${luckyWheelCashPrizes}`,
                  inline: true
                },
                {
                  name: "RP Rewards:",
                  value: `${luckyWheelRPPrizes}`,
                  inline: true
                },
                {
                  name: "\u200b",
                  value: `\u200b`,
                  inline: true
                },
                {
                  name: "JackPot Rewards:",
                  value: `${luckyWheelJackpots}`,
                  inline: true
                }
              )
              .setFooter({
                text: `The spin button will only be active for 30 seconds`
              })
              .setTimestamp();

            const onCooldown = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You cannot use that yet`)
              .setDescription(
                `You have already used your daily spin!\n\nYou can spin it again <t:${Math.floor(
                  userData.dailyCooldown / 1000 + 86400
                )}:R>`
              )
              .setColor(colours.ERRORRED)
              .setTimestamp();

            if (Date.parse(userData.wheelCooldown) + 86400000 > Date.now())
              return interaction.reply({
                embeds: [onCooldown],
                ephemeral: true
              });

            const spinWheelButton = new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId("spinWheel")
                .setLabel("Spin the lucky wheel")
                .setEmoji(emojis.TRACER)
                .setStyle("SUCCESS")
            ]);

            await interaction.reply({
              embeds: [luckyWheelStart],
              components: [spinWheelButton]
            });

            const prizeWon = new MessageEmbed()
              .setDescription(
                `You can spin the lucky wheel again <t:${next24Hours}:F>`
              )
              .addFields({
                name: `🏆 Prize won: 🏆`,
                value: `${
                  prizeType.toLocaleLowerCase().includes("cash")
                    ? `₲${prize.toLocaleString()} ${prizeType}`
                    : ""
                }${
                  prizeType.toLocaleLowerCase().includes("rp")
                    ? `${prize.toLocaleString()} ${prizeType}`
                    : ""
                } ${
                  prizeType.toLocaleLowerCase().includes("dunkelcoins")
                    ? `${emojis.dunkelCoin.toLocaleString()} ${prize} ${prizeType}`
                    : ""
                }`
              })
              .setColor(colours.DEFAULT);

            if (prizeType.toLocaleLowerCase().includes("jackpot"))
              prizeWon.setTitle(`🎉 Jackpot 🎉`);
            else prizeWon.setTitle(`🎉 Congrats ${interaction.user.username}`);

            const filter = (i) => {
              return i.user.id === interaction.user.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                time: 30000
              });

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              if (i.customId === "spinWheel") {
                await collector.stop({
                  reason: "spun"
                });

                if (prizeType.toLocaleLowerCase().includes("cash"))
                  await userData.updateOne({
                    bank: userData.bank + prize,
                    netWorth: userData.netWorth + prize,
                    totalEarned: userData.totalEarned + prize,
                    wheelCooldown: new Date(Date.now())
                  });

                if (prizeType.toLocaleLowerCase().includes("rp")) {
                  await userData.updateOne({
                    RP: userData.RP + prize,
                    totalRPEarned: userData.totalRPEarned + prize,
                    wheelCooldown: new Date(Date.now())
                  });
                  if (checkRank(userData.rank, userData.RP + prize))
                    await client.emit(
                      "playerLevelUp",
                      interaction,
                      interaction.user
                    );
                }

                if (prizeType.toLocaleLowerCase().includes("dunkelcoins"))
                  await userData.updateOne({
                    DunkelCoins: userData.DunkelCoins + prize,
                    wheelCooldown: new Date(Date.now())
                  });

                return interaction.editReply({
                  embeds: [prizeWon]
                });
              }
            });

            const timedOut = new MessageEmbed()
              .setTitle(`🕒 Timed out`)
              .setDescription(
                `The 30 second timer ran out, you can always re-run the command.`
              )
              .setColor(colours.ERRORRED);

            collector.on("end", async (collected, reason) => {
              if (reason.reason === "spun")
                return interaction.editReply({
                  components: []
                });
              else
                return interaction.editReply({
                  embeds: [timedOut],
                  components: []
                });
            });
          }
        }
      }
    });
  }
};
