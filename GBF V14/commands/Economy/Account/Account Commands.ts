const SlashCommand = require("../../../utils/slashCommands").default;

import {
  ApplicationCommandOptionType,
  Client,
  ColorResolvable,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder
} from "discord.js";

import UserProfileSchema from "../../../schemas/User Schemas/User Profile Schema";

import colors from "../../../GBF/GBFColor.json";
import emojis from "../../../GBF/GBFEmojis.json";
import CommandLinks from "../../../GBF/GBFCommands.json";
import { genderString, getTruePercentage } from "../../../utils/SueLuz Engine";
import { xpRequiredAccount } from "../../../utils/TimerLogic";

interface ExecuteFunction {
  client: Client;
  interaction: CommandInteraction;
}

export default class SueLuzAccountCommands extends SlashCommand {
  constructor(client: Client) {
    super(client, {
      name: "account",
      description: "SueLuz Economy account commands",
      cooldown: 5,
      development: true,
      subcommands: {
        create: {
          description: "Create your SueLuz character",
          args: [
            {
              name: "name",
              description: "The name your character will go by",
              type: ApplicationCommandOptionType.String,
              maxLength: 14,
              required: true
            },
            {
              name: "gender",
              description: "Specify your character's gender",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Male",
                  value: "M"
                },
                {
                  name: "Fe-Male",
                  value: "F"
                },
                {
                  name: "Other",
                  value: "T"
                }
              ],
              required: true
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const characterName = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("name", true);

            const characterGender = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("gender", true);

            const userProfile = await UserProfileSchema.findOne({
              userID: interaction.user.id
            });

            const WelcomeMessage = new EmbedBuilder()
              .setTitle(`${emojis.MaxRank} Welcome to SueLuz ✈️`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `\`Sue:\` "Welcome to SueLuz ${characterName}, a city of sinners and saints, your goal is to survive, you do that by climbing the leaderboard and taking out the top leaders, it won't be easy though.\n\nI'll give you ₲500 and a pistol to help you get started, you'll need it.`
              )
              .setFooter({
                text: `SueLuz: The city of saints and sinners`
              });

            const missionCompleted = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(`You've already completed the tutorial`);

            if (userProfile && userProfile.completedMissions.intro)
              return interaction.reply({
                embeds: [missionCompleted],
                ephemeral: true
              });

            if (!userProfile) {
              const newUserProfile = new UserProfileSchema({
                userID: interaction.user.id,
                creationDate: new Date(Date.now()),
                characterProfile: {
                  characterName: characterName,
                  characterSex: characterGender
                },
                cash: 500,
                totalEarned: 2000,
                completedMissions: {
                  intro: true
                },
                weapons: {
                  pistol: true
                }
              });

              await newUserProfile.save();
            } else {
              await userProfile.updateOne({
                creationDate: new Date(Date.now()),
                characterProfile: {
                  characterName: characterName,
                  characterSex: characterGender
                },
                cash: userProfile.cash + 500,
                totalEarned: userProfile.totalEarned + 500,
                completedMissions: {
                  intro: true
                },
                weapons: {
                  pistol: true
                }
              });
            }

            interface ITasksCompleted {
              [key: string]: boolean;
            }

            const tasksCompleted: ITasksCompleted = {
              "Welcome To SueLuz": true
            };

            client.emit(
              "missionComplete",
              interaction,
              interaction.user,
              tasksCompleted,
              "intro"
            );

            return interaction.reply({
              embeds: [WelcomeMessage]
            });
          }
        },
        profile: {
          description: "Check your SueLuz profile or another user's profile",
          args: [
            {
              name: "user",
              description: "The user that you want to check their profile",
              type: ApplicationCommandOptionType.User
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const targetUser =
              interaction.options.getUser("user", false) || interaction.user;

            const userData = await UserProfileSchema.findOne({
              userID: targetUser.id
            });

            const noData = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(
                `${targetUser.username} does not have a SueLuz account.${
                  targetUser.id === interaction.user.id
                    ? `\n\nCreate a new account using: ` +
                      CommandLinks.SueLuzRegister
                    : ""
                }`
              );

            if (!userData)
              return interaction.reply({
                embeds: [noData],
                ephemeral: true
              });

            const privateProfile = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable)
              .setDescription(`${targetUser.username}'s profile is private.`);

            if (
              userData.privateProfile &&
              targetUser.id !== interaction.user.id &&
              !userData.friends.includes(interaction.user.id)
            )
              return interaction.reply({
                embeds: [privateProfile],
                ephemeral: true
              });

            const missionsCompleted = getTruePercentage(
              userData.completedMissions
            );

            const achievementsUnlocked = getTruePercentage(
              userData.achievements
            );

            const badgesEarned = getTruePercentage(userData.badges);

            const weaponsPurchased = getTruePercentage(userData.weapons);

            const rankProgression = (
              (userData.RP / xpRequiredAccount(userData.Rank + 1)) *
              100
            ).toFixed(0);

            const userProfile = new EmbedBuilder()
              .setTitle(`${targetUser.username}'s SueLuz Stats`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .addFields(
                {
                  name: `${
                    userData.characterProfile.characterSex === "M" ? "🧔🏽‍♂️" : "👩🏽"
                  } Character:`,
                  value: `• Name: \`${
                    userData.characterProfile.characterName
                  }\`\n• Sex: \`${genderString(
                    userData.characterProfile.characterSex
                  )}\`\n• Creation Date: <t:${Math.round(
                    userData.creationDate.getTime() / 1000
                  )}:F>`,
                  inline: true
                },
                {
                  name: "🔫 Story Progression:",
                  value: `• Missions Completed: \`${missionsCompleted}%\`\n• Achievements Unlocked: \`${achievementsUnlocked}%\`\n• Badges Earned: \`${badgesEarned}%\`\n• Weapons Owned: \`${weaponsPurchased}%\``,
                  inline: true
                },
                {
                  name: "💰 Money:",
                  value: `• Wallet: \`₲${userData.cash.toLocaleString()}\`\n• Bank: \`₲${userData.bank.toLocaleString()}\`\n• Total: \`₲${(
                    userData.cash + userData.bank
                  ).toLocaleString()}\`\n Total Earned: \`₲${userData.totalEarned.toLocaleString()}\``,
                  inline: true
                },
                {
                  name: "🥇 Rank:",
                  value: `• Rank: \`${userData.Rank.toLocaleString()}\`\n• RP: \`${userData.RP.toLocaleString()} / ${xpRequiredAccount(
                    userData.Rank + 1
                  ).toLocaleString()} [${rankProgression}%]\``
                }
              );

            return interaction.reply({
              embeds: [userProfile]
            });
          }
        }
      }
    });
  }
}
