import GBFClient from "../../../handler/clienthandler";
import { GBFUserProfileModel } from "../../../schemas/User Schemas/User Profile Schema";
import SlashCommand from "../../../utils/slashCommands";

import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  CommandInteractionOptionResolver,
  ComponentType,
  EmbedBuilder,
} from "discord.js";

import colors from "../../../GBF/GBFColor.json";
import emojis from "../../../GBF/GBFEmojis.json";
import CommandLinks from "../../../GBF/GBFCommands.json";
import { chooseRandomFromArray, delay } from "../../../utils/Engine";

export default class MarriageCommands extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "marriage",
      description: "Marry or divorce a user",
      category: "Economy",
      development: true,
      subcommands: {
        marry: {
          description: "Marry someone!",
          args: [
            {
              name: "user",
              description: "The user that you want to marry",
              type: ApplicationCommandOptionType.User,
              required: true
            },
            {
              name: "ring",
              description: "The ring that you want to use to propose",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "Oval Diamond Ring",
                  value: `Oval Diamond Ring`
                },
                {
                  name: "Heart Diamond Ring",
                  value: "Heart Diamond Ring"
                },
                {
                  name: "Oval Musgravite Ring",
                  value: "Oval Musgravite Ring"
                },
                {
                  name: "Heart Musgravite Ring",
                  value: "Heart Musgravite Ring"
                },
                {
                  name: "Oval Painite Ring",
                  value: "Oval Painite Ring"
                },
                {
                  name: "Heart Painite Ring",
                  value: "Heart Painite Ring"
                },
                {
                  name: "Heart Pink Star Ring",
                  value: "Heart Pink Star Ring"
                }
              ],
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const TargetUser = (
              interaction.options as CommandInteractionOptionResolver
            ).getUser("user", true);

            const RingChoice = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("ring", true);

            const UnableToRun = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colors.ERRORRED as ColorResolvable);

            const UserData = await GBFUserProfileModel.findOne({
              userID: interaction.user.id
            });

            const TargetData = await GBFUserProfileModel.findOne({
              userID: TargetUser.id
            });

            if (!UserData) {
              UnableToRun.setDescription(
                `You don't have a SueLuz account, create one using: ${CommandLinks.SueLuzRegister}`
              );
              return interaction.reply({
                embeds: [UnableToRun],
                ephemeral: true
              });
            }

            if (!TargetData) {
              UnableToRun.setDescription(
                `${TargetUser.username} does not have a SueLuz account`
              );
              return interaction.reply({
                embeds: [UnableToRun],
                ephemeral: true
              });
            }

            if (UserData.Marriage.Married) {
              UnableToRun.setDescription(`You're already married... 💀`);
              return interaction.reply({
                embeds: [UnableToRun],
                ephemeral: true
              });
            }
            if (TargetData.Marriage.Married) {
              UnableToRun.setDescription(
                `${TargetUser.username} is already married, poor you...`
              );
              return interaction.reply({
                embeds: [UnableToRun],
                ephemeral: true
              });
            }

            const RingNotOwned = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setDescription(`You don't own the ${RingChoice}`)
              .setColor(colors.ERRORRED as ColorResolvable);

            if (!UserData.inventory.rings[RingChoice])
              return interaction.reply({
                embeds: [RingNotOwned],
                ephemeral: true
              });

            const Pronouns = {
              "M": "his",
              "F": "her",
              "T": "their"
            };

            const TargetUserUsername =
              TargetData.characterProfile.characterName;
            const UserUsername = UserData.characterProfile.characterName;
            const UserPronouns =
              Pronouns[UserData.characterProfile.characterSex];

            const MarriageText = [
              `${TargetUserUsername}, ${UserUsername} wants you to be ${UserPronouns} one and only, ${UserPronouns} to wake up everyday and choose and love you, to feel lucky to call you ${UserPronouns}, do you choose to give ${UserUsername} your hand, love and trust.`,
              `${UserUsername} loves ${TargetUserUsername} more than any metaphor can ever try to express, ${TargetUserUsername}, you are ${UserUsername}'s smile, ${UserPronouns} joy, comfort and love, do you promise to be there for ${UserUsername}, provide your care and love, now and forever.`,
              `"${TargetUserUsername}, my love for you can't be expressed using just words, my love, I vow to be there for you, during the easy and the hard, I promise to comfort you when you're crying, feed you when you're hungry, be there for you when you need me and most important, I vow to love you till death does us part, my love, will you be my one and only, my sunshine." - ${UserUsername}`
            ];

            const ProposalMessage = new EmbedBuilder()
              .setTitle(`💗 ${interaction.user.username} is propsing 💗`)
              .setColor("#FA99C8")
              .setDescription(`${chooseRandomFromArray(MarriageText)}`);

            const MarriageButtons: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                  .setCustomId("AcceptMarriage")
                  .setEmoji("💗")
                  .setLabel("Accept")
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId("DeclineMarriage")
                  .setEmoji("💔")
                  .setLabel("Decline")
                  .setStyle(ButtonStyle.Secondary)
              ]);

            await interaction.reply({
              embeds: [ProposalMessage],
              components: [MarriageButtons]
            });

            const collector =
              interaction.channel.createMessageComponentCollector({
                componentType: ComponentType.Button
              });

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              if (i.user.id !== TargetUser.id)
                await interaction.followUp({
                  content: `You can't use that, stop trying to ruin their moment 😡`,
                  ephemeral: true
                });

              if (i.customId === "AcceptMarriage") {
                const MarriageAccepted = new EmbedBuilder()
                  .setTitle(`💐 Just Married 💗💍`)
                  .setColor("#FA99C8")
                  .setDescription(
                    `${TargetUserUsername} and ${UserUsername} are now officially MARRIED 💐💗💍`
                  )
                  .setFooter({
                    text: `This is so CUTEEE`
                  });

                UserData.inventory.rings[RingChoice] = false;

                await UserData.save();

                await UserData.updateOne({
                  Marriage: {
                    Married: true,
                    MarriedTo: TargetUser.id,
                    MarriageDate: new Date(Date.now()),
                    Ring: RingChoice
                  }
                });

                await TargetData.updateOne({
                  Marriage: {
                    Married: true,
                    MarriedTo: interaction.user.id,
                    MarriageDate: new Date(Date.now()),
                    Ring: RingChoice
                  }
                });

                const AcceptButton: ActionRowBuilder<any> =
                  new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                      .setCustomId("none")
                      .setDisabled(true)
                      .setStyle(ButtonStyle.Secondary)
                      .setLabel(`${TargetUserUsername} SAID YES`)
                      .setEmoji("💗")
                  ]);

                await interaction.followUp({
                  embeds: [MarriageAccepted]
                });

                await interaction.editReply({
                  components: [AcceptButton]
                });

                collector.stop();
              }

              if (i.customId === "DeclineMarriage") {
                const DeclinedMarriage = new EmbedBuilder()
                  .setTitle(`🙁 That's unfortunate 😢`)
                  .setColor("#FA99C8")
                  .setDescription(
                    `${TargetUserUsername} rejected ${UserUsername}'s proposal`
                  )
                  .setFooter({
                    text: `It's okay, everything will be okay just breathe`
                  });

                await interaction.followUp({
                  embeds: [DeclinedMarriage],
                  components: []
                });

                await interaction.editReply({
                  components: []
                });

                collector.stop();
                return;
              }
            });
          }
        }
      }
    });
  }
}
