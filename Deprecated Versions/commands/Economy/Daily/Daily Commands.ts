import SlashCommand from "../../../utils/slashCommands";

import { EmbedBuilder, ColorResolvable } from "discord.js";

import colors from "../../../GBF/GBFColor.json";
import emojis from "../../../GBF/GBFEmojis.json";

import { GBFUserProfileModel } from "../../../schemas/User Schemas/User Profile Schema";

import { loginReward } from "../../../utils/TimerLogic";
import GBFClient from "../../../handler/clienthandler";

const next24Hours = Math.round((Date.now() + 24 * 60 * 60 * 1000) / 1000);

export default class DailyCommands extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "daily",
      description: "Claim your daily SueLuz rewards",
      category: "Economy",
      subcommands: {
        claim: {
          description: "Login in daily to get cool free prizes",
          execute: async ({ client, interaction }) => {
            const userData = await GBFUserProfileModel.findOne({
              userID: interaction.user.id
            });

            if (!userData) {
              const newAccount = new GBFUserProfileModel({
                userID: interaction.user.id,
                dailyStreak: 1,
                dailyCooldown: new Date(Date.now()),
                bank: 6500,
                dunkelCoins: 750
              });

              await newAccount.save();

              const newAccountEmbed = new EmbedBuilder()
                .setTitle(`Daily Collected ${emojis.MaxRank}`)
                .setColor(colors.DEFAULT as ColorResolvable)
                .setDescription(
                  `Hey!\nThanks for logging in GBF today, as a thank you, you'll receive a reward based on the day of the week and your daily streak!\n\nI've given you an extra reward as a welcome gift 😉\n\n• 250 DunkelCoins ${emojis.dunkelCoin}\n• ₲5,000`
                );

              return interaction.reply({
                embeds: [newAccountEmbed]
              });
            }

            if (!userData.dailyCooldown) {
              const newAccount = new EmbedBuilder()
                .setTitle(`Daily Collected ${emojis.MaxRank}`)
                .setColor(colors.DEFAULT as ColorResolvable)
                .setDescription(
                  `Hey!\nThanks for logging in GBF today, as a thank you, you'll receive a reward based on the day of the week and your daily streak!\n\nI've given you an extra reward as a welcome gift 😉\n\n• 250 DunkelCoins ${emojis.dunkelCoin}\n• ₲5,000`
                );

              await userData.updateOne({
                bank: userData.bank + 5000,
                dunkelCoins: userData.dunkelCoins + 250,
                dailyCooldown: new Date(Date.now()),
                dailyStreak: 1
              });

              return interaction.reply({
                embeds: [newAccount]
              });
            }

            const currentStreak: number = userData.dailyStreak + 1;

            const lostStreak = new EmbedBuilder()
              .setTitle(`Daily Collected 💰`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `Collected your daily login reward [Day: ${
                  loginReward()[0]
                } / 7]\n\n• ${
                  loginReward()[1]
                } Timer XP\n\nYou failed to keep up the daily streak, your last streak was ${(
                  currentStreak - 1
                ).toLocaleString()} days.\nYou can collect your next daily: <t:${next24Hours}:F>`
              )
              .setFooter({
                text: `If you think there is a mistake please contact support (/bot invite) || The streak dies after 48 hours of not claiming your reward`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (userData.dailyCooldown.getTime() + 172800000 < Date.now()) {
              await userData.updateOne({
                dailyStreak: 1,
                dailyCooldown: new Date(Date.now())
              });

              return interaction.reply({
                embeds: [lostStreak]
              });
            }

            const onCooldown = new EmbedBuilder()
              .setTitle(`⏰ You can't do that yet`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `You've already collected your daily login reward [Day: ${
                  loginReward(currentStreak)[0]
                }]\n\nYou can collect it again <t:${Math.floor(
                  userData.dailyCooldown.getTime() / 1000 + 86400
                )}:R>.`
              )
              .setTimestamp();

            if (userData.dailyCooldown.getTime() + 86400000 > Date.now())
              return interaction.reply({
                embeds: [onCooldown],
                ephemeral: true
              });

            const dailyReward =
              loginReward(currentStreak)[1] != 0
                ? `₲${loginReward(currentStreak)[1].toLocaleString()}`
                : `${loginReward(
                    currentStreak
                  )[2].toLocaleString()} DunkelCoins ${emojis.dunkelCoin}`;

            const collectedReward = new EmbedBuilder()
              .setTitle(`Daily Collected 💰`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `Collected your daily login reward [Day: ${
                  loginReward(currentStreak)[0]
                } / 7]\n\n• ${dailyReward} , You can collect your next daily: <t:${next24Hours}:F>.`
              )
              .setTimestamp();

            await userData.updateOne({
              dailyCooldown: new Date(Date.now()),
              dailyStreak: userData.dailyStreak + 1,
              bank:
                loginReward(currentStreak)[1] != 0
                  ? userData.bank + (loginReward(currentStreak)[1] as number)
                  : userData.bank,

              dunkelCoins:
                loginReward(currentStreak)[2] != 0
                  ? userData.dunkelCoins +
                    (loginReward(currentStreak)[2] as number)
                  : userData.dunkelCoins
            });

            return interaction.reply({
              embeds: [collectedReward]
            });
          }
        }
      }
    });
  }
}
