import SlashCommand from "../../utils/slashCommands";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import {
  EmbedBuilder,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
  CommandInteractionOptionResolver,
  ColorResolvable,
  GuildMember,
} from "discord.js";

import fetch from "node-fetch";
import figlet from "figlet";

import GBFClient from "../../handler/clienthandler";
import { chooseRandomFromArray } from "../../utils/Engine";

export default class FunCommands extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "fun",
      description: "Fun and miscallenous commands",
      category: "Fun",
      botPermission: [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
      ],
      cooldown: 5,
      subcommands: {
        ["8ball"]: {
          description: "Ask the magic 8ball a question",
          args: [
            {
              name: "question",
              description: "The question you want to ask the magic 8ball",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
          execute: async ({ client, interaction }) => {
            const MessageArgs = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("question", true);

            const EightBallAnswers = [
              "Yes",
              "No",
              "Maybe",
              "Ask Later",
              "No time to tell now",
              "As I see it, yes.",
              "Cannot predict now.",
              "Concentrate and ask again.",
              "It is certain.",
              "I don't know ",
            ];

            const Result = chooseRandomFromArray(EightBallAnswers);

            const EightBallAnswerEmbed = new EmbedBuilder()
              .setTitle("🎱 Magic 8Ball")
              .setDescription(
                `**Question »** ${MessageArgs} \n **Answer »** ${Result}`
              )
              .setColor(colors.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
              });

            return interaction.reply({
              embeds: [EightBallAnswerEmbed],
            });
          },
        },
        ascii: {
          description: "Change text to ascii",
          args: [
            {
              name: "text",
              description: "The text that you want to convert to ascii",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
          execute: async ({ client, interaction }) => {
            const msg = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("text");

            const APIError = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} NP1 Error `)
              .setDescription(
                `Error fetching data from the API, please try again later.`
              )
              .setColor(colors.ERRORRED as ColorResolvable)
              .setTimestamp();

            await interaction.deferReply({
              ephemeral: true,
            });

            figlet.text(msg, function (err, data) {
              if (err) {
                console.log("Something went wrong");
                console.dir(err);
              }
              if (data.length > 2000)
                return interaction.reply({
                  content: "Please provide text shorter than 2000 characters",
                  ephemeral: true,
                });

              return interaction.channel
                .send({
                  content: "```" + data + "```",
                })
                .catch((err) => {
                  console.log(`Ascii Command Error: ${err.message}`);
                  return interaction.reply({
                    embeds: [APIError],
                    ephemeral: true,
                  });
                });
            });
          },
        },
        destroy: {
          description: "Create a message with a timer 👀",
          args: [
            {
              name: "message",
              description: "The message that you want to create",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
          execute: async ({ client, interaction }) => {
            const msg = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("message");

            const MessageSent = await interaction.reply({
              content: msg,
              allowedMentions: {
                parse: [],
              },
              fetchReply: true,
            });

            setTimeout(
              () =>
                interaction.editReply({
                  content:
                    "This message is going to blow up any second now! 💣",
                  allowedMentions: {
                    parse: [],
                  },
                }),
              2500
            );

            setTimeout(
              () =>
                interaction.editReply({
                  content: "GET DOWN IT'S GONNA EXPLODE!!",
                  allowedMentions: {
                    parse: [],
                  },
                }),
              5000
            );

            setTimeout(
              () =>
                interaction.editReply({
                  content:
                    "https://tenor.com/view/saussi%C3%A7on-explode-boom-gif-16089684",
                  allowedMentions: {
                    parse: [],
                  },
                }),
              8000
            );

            setTimeout(() => MessageSent.delete(), 10000);
          },
        },
        gayrate: {
          description: "Gay rate machine",
          args: [
            {
              name: "user",
              description: "The user that you want to use this machine on",
              type: ApplicationCommandOptionType.User,
            },
          ],
          execute: async ({ client, interaction }) => {
            const TargetUser =
              interaction.options.getUser("user") || interaction.user;

            const GayRateEmbed = new EmbedBuilder()
              .setTitle("Gay rate machine 🏳️‍🌈")
              .setDescription(
                `${TargetUser.username} is **${Math.floor(
                  Math.random() * 100
                )}%** gay 🏳️‍🌈`
              )
              .setColor(colors.DEFAULT as ColorResolvable);

            return interaction.reply({
              embeds: [GayRateEmbed],
            });
          },
        },
        pprate: {
          description: "Rate a user's pp 😳",
          args: [
            {
              name: "user",
              description: "The user that you want to... Oh my 😳",
              type: ApplicationCommandOptionType.User,
            },
          ],
          execute: async ({ client, interaction }) => {
            const TargetUser =
              interaction.options.getUser("user") || interaction.user;

            const items = [
              "=",
              "==",
              "===",
              "====",
              "=====",
              "======",
              "=======",
              "",
            ];

            const PPLength = chooseRandomFromArray(items);

            const PPRateEmbed = new EmbedBuilder()
              .setTitle("PP rating machine")
              .setColor(colors.DEFAULT as ColorResolvable);

            if (PPLength === "=") {
              PPRateEmbed.setDescription(
                `**${TargetUser.username}'s PP:**\n` +
                  "8" +
                  PPLength +
                  "D" +
                  `\n**${TargetUser.username} I rate your PP a 1 🤢🤮**\nPut that thing away! 🤢`
              );

              const MessageReply = await interaction.reply({
                embeds: [PPRateEmbed],
                fetchReply: true,
              });

              MessageReply.react("1️⃣");
              MessageReply.react("🤮");
            } else if (PPLength === "==") {
              PPRateEmbed.setDescription(
                `**${TargetUser.username}'s PP:**\n` +
                  "8" +
                  PPLength +
                  "D" +
                  `\n**${TargetUser.username} I rate your PP a 2 🤮**\nWhere did you get the confidence to do this ?!🧐🤨😐`
              );

              const MessageReply = await interaction.reply({
                embeds: [PPRateEmbed],
                fetchReply: true,
              });
              MessageReply.react("2️⃣");
              MessageReply.react("🥱");
            } else if (PPLength === "===") {
              PPRateEmbed.setDescription(
                `**${TargetUser.username}'s PP:**\n` +
                  "8" +
                  PPLength +
                  "D" +
                  `\n**${TargetUser.username} I rate your PP a 4 👍**\nIts not bad, good for you! You got decent length 😁`
              );

              const MessageReply = await interaction.reply({
                embeds: [PPRateEmbed],
                fetchReply: true,
              });
              MessageReply.react("4️⃣");
              MessageReply.react("👍");
            } else if (PPLength === "====") {
              PPRateEmbed.setDescription(
                `**${TargetUser.username}'s PP:**\n` +
                  "8" +
                  PPLength +
                  "D" +
                  `\n**${TargetUser.username} I rate your PP a 6 😄**\nNice cock bro! Average length! Looking good 😊`
              );

              const MessageReply = await interaction.reply({
                embeds: [PPRateEmbed],
                fetchReply: true,
              });
              MessageReply.react("6️⃣");
              MessageReply.react("😄");
            } else if (PPLength === "=====") {
              PPRateEmbed.setDescription(
                `**${TargetUser.username}'s PP:**\n` +
                  "8" +
                  PPLength +
                  "D" +
                  `\n**${TargetUser.username} I rate your PP a 8 😋**\nThat's one nice cock bro! Keep it up 🥰`
              );

              const MessageReply = await interaction.reply({
                embeds: [PPRateEmbed],
                fetchReply: true,
              });
              MessageReply.react("8️⃣");
              MessageReply.react("😋");
            } else if (PPLength === "======") {
              PPRateEmbed.setDescription(
                `**${TargetUser.username}'s PP:**\n` +
                  "8" +
                  PPLength +
                  "D" +
                  `\n**${TargetUser.username} I rate your PP a 9 🤩**\nI'm jealous how do you even walk with that massive shlong!`
              );

              const MessageReply = await interaction.reply({
                embeds: [PPRateEmbed],
                fetchReply: true,
              });
              MessageReply.react("9️⃣");
              MessageReply.react("🤩");
            } else if (PPLength === "=======") {
              PPRateEmbed.setDescription(
                `**${TargetUser.username}'s PP:**\n` +
                  "8" +
                  PPLength +
                  "D" +
                  `\n**${TargetUser.username} I rate your PP a 10 😍**\nThis you?`
              );
              PPRateEmbed.setImage(
                "https://i.ytimg.com/vi/Ux5cQbO_ybw/maxresdefault.jpg"
              );

              const MessageReply = await interaction.reply({
                embeds: [PPRateEmbed],
                fetchReply: true,
              });
              MessageReply.react("🔟");
              MessageReply.react("😍");
              MessageReply.react("😋");
              MessageReply.react("💦");
            } else {
              PPRateEmbed.setDescription(
                `**${TargetUser.username}'s PP:**\n` +
                  "8" +
                  PPLength +
                  "D" +
                  `\n**${TargetUser.username} I rate your PP a 0 😐**\nWTF is this 😶🥱`
              );

              const MessageReply = await interaction.reply({
                embeds: [PPRateEmbed],
                fetchReply: true,
              });
              MessageReply.react("0️⃣");
              MessageReply.react("😶");
            }
          },
        },
        topic: {
          description: "Gives a random question",
          execute: async ({ client, interaction }) => {
            const TopicQuestions = [
              "What are the top three things on your bucket list?",
              "How do you think you will die?",
              "If you could ask for a miracle, what would it be?",
              "What is the biggest risk you’ve ever taken?",
              "What would your ideal life look like?",
              "If someone gave you an envelope with your death date inside of it, would you open it?",
              "When have you been the most happy?",
              "What is your idea of the perfect day?",
              "Do you think your priorities have changed since you were younger?",
              "What keeps you up at night?",
              "What scares you most about your future?",
              "What is the most difficult thing you’ve ever done?",
              "What does success mean to you?",
              "What makes you smile?",
              "Is there a dream you’ve always had?",
              "What gives you butterflies?",
              "What motivates you most in life?",
              "What makes you feel discouraged?",
              "What’s something not many people know about you?",
              "What are you most passionate about?",
              "Who do you text the most?",
              "What was your favorite thing to do as a kid?",
              "What’s your dream job?",
              "What is your favorite weekend activity?",
              "What makes you most uncomfortable about dating?",
              "If you could have dinner with anyone living or not, who would it be?",
              "Are you a cat person or a dog person?",
              "What is the silliest thing you’ve posted online?",
              "What was your worst wardrobe mistake?",
              "What is the best restaurant you’ve been to?",
              "What is your favorite kitchen smell?",
              "When you die, what do you want to be reincarnated as?",
              "What is your favorite guilty pleasure TV show?",
              "Who would you swap lives with for a day?",
              "If you could live anywhere in the world, where would it be?",
              "Would you prefer to live in an urban area or a rural area?",
              "What is the strangest gift you have ever received?",
              "What’s the best compliment you’ve ever received?",
              "Would you rather be invisible or have X-ray vision?",
              "If you could only save one item from a house fire, what would it be?",
              `You're house is on fire and you can only save one person do you: save your mom,dad or do you let both of them die?`,
              "If you could have picked your own name, what would it be?",
              "What time period would you travel to?",
              "What is one thing you can’t live without?",
              "What is your least favorite chore?",
              "Who are you most thankful for and why?",
              "What makes you most proud?",
              "What makes you the happiest?",
              "Who makes you the happiest?",
              "If you could be an animal, what would it be and why?",
              "If you could be any age, what age would you choose?",
              "When is the last time you laughed so hard that you cried?",
              "What did you think was the most challenging part of being a kid?",
              "If you could be any age, what age would you choose?",
              "What are you reading right now?",
              "How long can you go without checking your phone?",
              "Do you have a morning ritual?",
              "What bad habits do you wish you could stop?",
              "Are you a jealous person?",
              "If someone offered to tell you your future, would you accept it?",
              "If you were to remove one social media app from your phone, which would it be and why?",
              "If you were on death row, what would your last meal be?",
              "If you could sit down with your 13-year old self, what would you say?",
              "What makes you really angry?",
              "What’s your guilty pleasure?",
              "What bores you?",
              "If your plane was going down, who would you would call?",
              "What would you do if you were home alone and the power went out?",
              "What do you do in your free time?",
              "What do you wish you had more time for?",
              "What is your favorite movie soundtrack?",
            ];

            const TopicQuestion = chooseRandomFromArray(TopicQuestions);

            const TopicEmbed = new EmbedBuilder()
              .setTitle("<:BlueThinking:825400207344140298> Random Topic:")
              .addFields({
                name: "━━━━━━━━━",
                value: TopicQuestion,
              })
              .setColor("#00FFFF")
              .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setThumbnail(
                "https://cdn.discordapp.com/attachments/791309678092353536/822294803504562206/speech_ballon.gif"
              );

            return interaction.reply({
              embeds: [TopicEmbed],
            });
          },
        },
        kill: {
          description: "Kill a user",
          args: [
            {
              name: "target",
              description: "The user that you want to kill",
              type: ApplicationCommandOptionType.User,
            },
          ],
          execute: async ({ client, interaction }) => {
            const TargetUser =
              interaction.options.getUser("target", false) || interaction.user;

            const TargetDisplayName =
              interaction.guild.members.cache.get(TargetUser.id).nickname ||
              TargetUser.username;

            const UserDisplayName =
              (interaction.member as GuildMember).nickname ||
              interaction.user.username;

            const KillDialogue = [
              `${TargetDisplayName} watched a female comedian`,
              `Jett couldn't revive ${TargetDisplayName}`,
              `${TargetDisplayName}'s elytra broke`,
              `${TargetDisplayName} forgot their water bucket`,
              `${TargetDisplayName} bullied the quiet kid`,
              `${TargetDisplayName} fought the blue-haired girl`,
              `${TargetDisplayName} had america's oil`,
              `${TargetDisplayName} found the cure for cancer, the next day they magically disappeared`,
              `${TargetDisplayName} cancelled their subscription for living`,
              `${TargetDisplayName} died from AIDS...`,
              `${TargetDisplayName} died waiting for GBF to have good commands`,
              `${TargetDisplayName} was eaten by the duolingo owl...`,
              `${TargetDisplayName} killed their snapstreak with ${UserDisplayName} causing ${UserDisplayName} to get really angry at them then they shot them twice`,
              `${TargetDisplayName} missed their duolingo spanish lessons...`,
              `${TargetDisplayName} died from a heartbreak after being rejected by their crush ${UserDisplayName}`,
              `${TargetDisplayName} got dunk'd on by a fortnite kid cranking 90s`,
              `${TargetDisplayName} choked on their own saliva`,
              `${TargetDisplayName} died from a botched boob job`,
              `${TargetDisplayName} was stabbed by ${UserDisplayName} after they called their mom fat`,
              `${UserDisplayName} dropped a nokia phone on ${TargetDisplayName}`,
              `${TargetDisplayName} choked on..... water`,
              `${TargetDisplayName} died from loneliness`,
              `${TargetDisplayName} got dabbed on for being a hater`,
              `${TargetDisplayName} tripped on nothing and died`,
              `${TargetDisplayName} killed themselves after ${UserDisplayName} showed them some unfunny memes`,
              `${UserDisplayName} tried to kill ${TargetDisplayName} but failed`,
              `${TargetDisplayName} used bots in general`,
              `${TargetDisplayName} sent NSFW in general!`,
              `${TargetDisplayName} talked back to their mom`,
              `${TargetDisplayName} said a no no word in a Christian Minecraft server`,
              `${TargetDisplayName} got a stroke after watching jake paul`,
              `${TargetDisplayName} killed themselves after getting cheated on by ${UserDisplayName}`,
              `${TargetDisplayName} was blown up by a creeper`,
              `${UserDisplayName} tried to kill ${TargetDisplayName} but ${TargetDisplayName} shot ${UserDisplayName} twice`,
              `${TargetDisplayName} was ran over by ${UserDisplayName}`,
              `${TargetDisplayName} got into an argument with an angry feminist`,
              `${TargetDisplayName} default danced to death`,
              `${TargetDisplayName} drowned`,
              `${TargetDisplayName} drowned after being pushed into the water by ${UserDisplayName}`,
              `${TargetDisplayName} joined engineering`,
              `${TargetDisplayName} tried to study Linear Algebra`,
              `${TargetDisplayName} tried going to med school`,
              `${TargetDisplayName} chose the easy way out`,
              `${TargetDisplayName} might not come back`,
              `${TargetDisplayName} got dunked on`,
            ];

            const KillMessage = chooseRandomFromArray(KillDialogue);

            return interaction.reply({
              content: `${KillMessage}`,
            });
          },
        },
        yomama: {
          description:
            "Yomama so dumb she had to check the command description",
          args: [
            {
              name: "target",
              description: "The person to perform the epic troll on",
              type: ApplicationCommandOptionType.User,
            },
          ],
          execute: async ({ client, interaction }) => {
            const TargetUser =
              interaction.options.getUser("target") || interaction.user;

            const TrollEmoji = `<:trollface:838959517965353060>`;

            const ran = Math.floor(Math.random() * 5);

            const res = await fetch("https://api.yomomma.info");
            let joke = (await res.json()).joke;
            joke = joke.charAt(0).toLowerCase() + joke.slice(1);
            if (
              !joke.endsWith("!") &&
              !joke.endsWith(".") &&
              !joke.endsWith('"')
            )
              joke += "!";

            if (TargetUser.id === client.user.id) {
              if ((ran >= 3 && ran <= 5) || ran === 0) {
                return interaction.reply({
                  content: `${interaction.user.username}, ${joke} ${TrollEmoji}`,
                });
              } else {
                return interaction.reply({
                  content: `${interaction.user.username}, ${joke}`,
                });
              }
            }

            if ((ran >= 3 && ran <= 5) || ran === 0) {
              return interaction.reply({
                content: `${TargetUser.username}, ${joke} ${TrollEmoji}`,
              });
            } else {
              return interaction.reply({
                content: `${TargetUser.username}, ${joke}`,
              });
            }
          },
        },
      },
    });
  }
}
