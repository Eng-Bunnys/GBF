import SlashCommand from "../../../utils/slashCommands";

import {
  ApplicationCommandOptionType,
  ColorResolvable,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder
} from "discord.js";

import colors from "../../../GBF/GBFColor.json";
import emojis from "../../../GBF/GBFEmojis.json";
import CommandLinks from "../../../GBF/GBFCommands.json";

import { OwnedItems, getTruePercentage } from "../../../API/Economy/SueLuz Engine";
import { xpRequiredAccount } from "../../../utils/TimerLogic";
import GBFClient from "../../../handler/clienthandler";
import { GBFUserProfileModel } from "../../../schemas/User Schemas/User Profile Schema";
import { GBFCasinoModel } from "../../../schemas/User Schemas/Casino Schema";
import { capitalize } from "../../../utils/Engine";

interface ExecuteFunction {
  client: GBFClient;
  interaction: CommandInteraction;
}

export default class SueLuzAccountCommands extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "account",
      description: "SueLuz Economy account commands",
      category: "Economy",
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

            const userProfile = await GBFUserProfileModel.findOne({
              userID: interaction.user.id
            });

            const WelcomeMessage = new EmbedBuilder()
              .setTitle(`${emojis.MaxRank} Welcome to SueLuz ✈️`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(
                `\`Sue:\` "Welcome to SueLuz ${characterName}, a city of sinners and saints, your goal is to survive, you do that by climbing the leaderboard and taking out the top leaders, it won't be easy though.\n\nI'll give you ₲500 and a pistol to help you get started, you'll need it, and one more thing, I'll tell my friend Robin about you go check talk to him ${CommandLinks.MeetRobin}`
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
              const newUserProfile = new GBFUserProfileModel({
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
                  intro: true,
                  MeetRobin: false,
                  MojaveJob: false
                },
                weapons: {
                  pistol: true,
                  uzi: userProfile.weapons.uzi ? true : false
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

            const userData = await GBFUserProfileModel.findOne({
              userID: targetUser.id
            });

            let casinoData = await GBFCasinoModel.findOne({
              userID: interaction.user.id
            });

            if (!casinoData)
              //@ts-ignore
              casinoData = {
                Wins: 0,
                Losses: 0,
                CashSpent: 0,
                CashEarned: 0
              };

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

            const missionsCompleted = Math.round(
              getTruePercentage(userData.completedMissions)
            );

            const achievementsUnlocked = Math.round(
              getTruePercentage(userData.achievements)
            );

            const badgesEarned = Math.round(getTruePercentage(userData.badges));

            const BadgesMap = {
              "levelHundred": "💯"
            };

            const badgeKeys = Object.keys(userData.badges).filter(
              (key) => userData.badges[key]
            );

            const badgeValues = badgeKeys.map((key) => BadgesMap[key]);

            const badgeString =
              badgeValues.length == 0 ? "None" : badgeValues.join("");

            const weaponsPurchased = Math.round(
              getTruePercentage(userData.weapons)
            );

            const rankProgression = (
              (userData.RP / xpRequiredAccount(userData.Rank + 1)) *
              100
            ).toFixed(0);

            const casinoWinRate: string = `${(
              (casinoData.Wins / (casinoData.Wins + casinoData.Losses)) *
              100
            ).toFixed(0)}%`;

            const OwnedRingsPercentage = Math.round(
              getTruePercentage(userData.inventory.rings)
            );

            const OwnedRings = OwnedItems(userData.inventory.rings);

            const UserProfile = new EmbedBuilder()
              .setTitle(`${capitalize(targetUser.username)}'s SueLuz Stats`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setDescription(`${badgeString}`)
              .addFields(
                {
                  name: "🔫 Story Progression:",
                  value: `• Missions Completed: \`${missionsCompleted}%\`\n• Achievements Unlocked: \`${achievementsUnlocked}%\`\n• Badges Earned: \`${badgesEarned}%\`\n• Weapons Owned: \`${weaponsPurchased}%\``,
                  inline: true
                },
                {
                  name: "💰 Money:",
                  value: `• Wallet: \`₲${userData.cash.toLocaleString()}\`\n• Bank: \`₲${userData.bank.toLocaleString()}\`\n• Total: \`₲${(
                    userData.cash + userData.bank
                  ).toLocaleString()}\`\n• Total Earned: \`₲${userData.totalEarned.toLocaleString()}\``,
                  inline: true
                },
                {
                  name: "💍 Rings:",
                  value: `• Owned: ${OwnedRingsPercentage}%\n${OwnedRings}`,
                  inline: true
                },
                {
                  name: "🎰 Casino:",
                  value: `• Wins: \`${casinoData.Wins.toLocaleString()}\`\n• Losses: \`${casinoData.Losses.toLocaleString()}\`\n• Win Rate: \`${casinoWinRate}\`\n• Money Spent: \`₲${casinoData.CashSpent.toLocaleString()}\`\n• Money Earned: \`₲${casinoData.CashEarned.toLocaleString()}\``,
                  inline: true
                },
                {
                  name: "🥇 Rank:",
                  value: `• Rank: \`${userData.Rank.toLocaleString()}\`\n• RP: \`${userData.RP.toLocaleString()} / ${xpRequiredAccount(
                    userData.Rank + 1
                  ).toLocaleString()} [${rankProgression}%]\``,
                  inline: true
                }
              );

            return interaction.reply({
              embeds: [UserProfile]
            });
          }
        }
      }
    });
  }
}
