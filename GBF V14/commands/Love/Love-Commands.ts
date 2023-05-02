const SlashCommand = require("../../utils/slashCommands").default;

import colors from "../../GBF/GBFColor.json";

import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  Client,
  User,
  ColorResolvable,
  Interaction,
  CommandInteraction,
  ComponentType
} from "discord.js";

import client from "nekos.life";

const { sfw } = new client();

import fetch from "node-fetch";

import { delay } from "../../utils/Engine";

interface ExecuteFunction {
  client: Client;
  interaction: CommandInteraction;
}

export default class LoveCommand extends SlashCommand {
  constructor(client: Client) {
    super(client, {
      name: "love",
      description: "Love commands like Hug, Kiss etc",
      category: "Love",
      cooldown: 4,
      development: false,
      subcommands: {
        bite: {
          description: "Bite someone! Or yourself...",
          args: [
            {
              name: "user",
              type: ApplicationCommandOptionType.User,
              description: "The user that you want to bite",
              required: true
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const mentionedUser: User = interaction.options.getUser("user");

            const res = await fetch("https://api.waifu.pics/sfw/bite");
            const img = (await res.json()).url;

            const selfBite = new EmbedBuilder()
              .setTitle("Ummm")
              .setDescription(`**<@${interaction.user.id}> bit themselves??**`)
              .setImage(img)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const mainEmbed = new EmbedBuilder()
              .setTitle("STOP BITING AAA")
              .setDescription(
                `**<@${interaction.user.id}> bites ${mentionedUser}**`
              )
              .setImage(img)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (mentionedUser.id === interaction.user.id) {
              return interaction
                .reply({
                  embeds: [selfBite]
                })
                .catch((err: Error) => {
                  return interaction.reply({
                    content:
                      "Seems like there was something wrong with the API, Please check back later!"
                  });
                });
            } else {
              return interaction
                .reply({
                  embeds: [mainEmbed]
                })
                .catch((err: Error) => {
                  return interaction.reply({
                    content:
                      "Seems like there was something wrong with the API, Please check back later!"
                  });
                });
            }
          }
        },
        bonk: {
          description: "Bonk a user 🔨",
          args: [
            {
              name: "user",
              type: ApplicationCommandOptionType.User,
              description: "The user that you want to bonk",
              required: true
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const mentionedUser: User = interaction.options.getUser("user");

            const res = await fetch("https://api.waifu.pics/sfw/bonk");
            const img = (await res.json()).url;

            const selfBonk = new EmbedBuilder()
              .setTitle(`Error: User is lonely <:PepeLaugh:755582130175868979>`)
              .setDescription(
                `Please mention someone who's not you <:facepalm:705007575745298453>`
              )
              .setColor(colors.ERRORRED as ColorResolvable);

            const BonkEmbed = new EmbedBuilder()
              .setTitle(`BONK <:BONK:864267943206715453>`)
              .setDescription(
                `**<@${interaction.user.id}> bonks ${mentionedUser}**`
              )
              .setImage(img)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (mentionedUser.id === interaction.user.id) {
              return interaction.reply({
                embeds: [selfBonk]
              });
            } else {
              return interaction
                .reply({
                  embeds: [BonkEmbed]
                })
                .catch((err: Error) => {
                  return interaction.reply({
                    content:
                      "Seems like there was something wrong with the API, Please check back later!"
                  });
                });
            }
          }
        },
        bully: {
          description: "Bully a user 😭",
          args: [
            {
              name: "user",
              type: ApplicationCommandOptionType.User,
              description: "The user that you want to bully",
              required: true
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const mentionedUser: User = interaction.options.getUser("user");

            const res = await fetch("https://api.waifu.pics/sfw/bully");
            const img = (await res.json()).url;

            if (mentionedUser.id === interaction.user.id) {
              const selfBully = new EmbedBuilder()
                .setTitle(`Error: User has no friends to bully`)
                .setDescription(
                  `Mention someone that is not <@${interaction.user.id}> to bully!\n\`Mention someone that's not you lol\``
                )
                .setColor(colors.ERRORRED as ColorResolvable);

              return interaction.reply({
                embeds: [selfBully]
              });
            }

            const BullyEmbed = new EmbedBuilder()
              .setTitle("WTH")
              .setDescription(
                `**<@${interaction.user.id}> bullies ${mentionedUser}**`
              )
              .setImage(img)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            return interaction
              .reply({
                embeds: [BullyEmbed]
              })
              .catch((err: Error) => {
                console.log(`Love Bully Command Error:\n${err.message}`);
                return interaction.reply({
                  content:
                    "Seems like there was something wrong with the API, Please check back later!",
                  ephemeral: true
                });
              });
          }
        },
        cuddle: {
          description: "Cuddle a user 🤗",
          args: [
            {
              name: "user",
              type: ApplicationCommandOptionType.User,
              description: "The user that you want to cuddle",
              required: true
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const mentionedUser: User = interaction.options.getUser("user");

            const slaplink = await sfw.slap();

            const link = await sfw.cuddle();

            const SelfCuddle = new EmbedBuilder()
              .setTitle(`Error: User is lonely`)
              .setDescription(
                "Hey if you don't have anyone to cuddle you could always cuddle me! <:trollface:838959517965353060>"
              )
              .setColor(colors.ERRORRED as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const BotHug = new EmbedBuilder()
              .setTitle("Ewwwwww get away from me")
              .setDescription(`**<@!${interaction.user.id}> TOUCHED ME!!!**`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setImage(slaplink.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const CuddleEmbed = new EmbedBuilder()
              .setTitle("Cuddles!")
              .setDescription(
                `**<@!${interaction.user.id}> is cuddling with ${mentionedUser}**`
              )
              .setColor(colors.DEFAULT as ColorResolvable)
              .setImage(link.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (interaction.user.id === mentionedUser.id) {
              return interaction.reply({
                embeds: [SelfCuddle]
              });
            }

            if (mentionedUser.id === client.user.id) {
              return interaction.reply({
                embeds: [BotHug]
              });
            }

            return interaction.reply({
              embeds: [CuddleEmbed]
            });
          }
        },
        hold: {
          description: "Hold a user's hands 🤝",
          args: [
            {
              name: "user",
              type: ApplicationCommandOptionType.User,
              description: "The user that you want to hold",
              required: true
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const mentionedUser: User = interaction.options.getUser("user");

            const res = await fetch("https://api.waifu.pics/sfw/handhold");
            const img = (await res.json()).url;

            if (mentionedUser.id === interaction.user.id) {
              const SelfHold = new EmbedBuilder()
                .setTitle("Ummm...")
                .setDescription(
                  `**<@${interaction.user.id}> held hands with themselves??**`
                )
                .setImage(img)
                .setColor(colors.DEFAULT as ColorResolvable)
                .setFooter({
                  text: `Requested by: ${interaction.user.tag}`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [SelfHold]
              });
            }

            const HoldEmbed = new EmbedBuilder()
              .setTitle("So cute!")
              .setDescription(
                `**<@${interaction.user.id}> is holding hands with ${mentionedUser}**`
              )
              .setImage(img)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            return interaction
              .reply({
                embeds: [HoldEmbed]
              })
              .catch((err: Error) => {
                console.log(`Love Hold Command Error:\n${err.message}`);
                return interaction.reply({
                  content:
                    "Seems like there was something wrong with the API, Please check back later!"
                });
              });
          }
        },
        kiss: {
          description: "Kiss a user 😘",
          args: [
            {
              name: "user",
              type: ApplicationCommandOptionType.User,
              description: "The user that you want to kiss",
              required: true
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const mentionedUser: User = interaction.options.getUser("user");

            let link = await sfw.kiss();
            let slaplink = await sfw.slap();

            const SelfKiss = new EmbedBuilder()
              .setTitle(`Error: User is lonely`)
              .setDescription("lol")
              .setColor(colors.ERRORRED as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const BotKiss = new EmbedBuilder()
              .setTitle("Ewwwwww get away from me")
              .setDescription(
                `**<@!${interaction.user.id}> TRIED TO KISS ME!!!**`
              )
              .setColor(colors.DEFAULT as ColorResolvable)
              .setImage(slaplink.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const KissEmbed = new EmbedBuilder()
              .setTitle("So cute!")
              .setDescription(
                `**<@${interaction.user.id}> kissed ${mentionedUser}**`
              )
              .setColor("#e91e63")
              .setImage(link.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (interaction.user.id === mentionedUser.id) {
              return interaction.reply({
                embeds: [SelfKiss]
              });
            }

            if (mentionedUser.id === client.user.id) {
              return interaction.reply({
                embeds: [BotKiss]
              });
            }

            return interaction.reply({
              embeds: [KissEmbed]
            });
          }
        },
        hug: {
          description: "Hug a user 🤗",
          args: [
            {
              name: "user",
              type: ApplicationCommandOptionType.User,
              description: "The user that you want to hug",
              required: true
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const mentionedUser: User = interaction.options.getUser("user");

            let slaplink = await sfw.slap();

            let link = await sfw.hug();

            const SelfHug = new EmbedBuilder()
              .setTitle(
                `Error: User can't find someone to hug <:PepeLaugh:755582130175868979>`
              )
              .setDescription(
                `You could always hug me <:pleadingface:799827859505807380>`
              )
              .setColor(colors.ERRORRED as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const BotHug = new EmbedBuilder()
              .setTitle("Ewwwwww get away from me")
              .setDescription(`**<@!${interaction.user.id}> TOUCHED ME!!!**`)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setImage(slaplink.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const HugEmbed = new EmbedBuilder()
              .setTitle("So cute!")
              .setDescription(
                `**<@!${interaction.user.id}> is hugging ${mentionedUser}**`
              )
              .setColor(colors.DEFAULT as ColorResolvable)
              .setImage(link.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (interaction.user.id === mentionedUser.id) {
              return interaction.reply({
                embeds: [SelfHug]
              });
            }

            if (mentionedUser.id === client.user.id) {
              return interaction.reply({
                embeds: [BotHug]
              });
            }

            return interaction.reply({
              embeds: [HugEmbed]
            });
          }
        },
        poke: {
          description: "Poke a user 👈",
          args: [
            {
              name: "user",
              type: ApplicationCommandOptionType.User,
              description: "The user that you want to poke",
              required: true
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const mentionedUser: User = interaction.options.getUser("user");

            const link = await sfw.poke();

            if (mentionedUser.id === interaction.user.id) {
              const SelfPoke = new EmbedBuilder()
                .setTitle("Um okay")
                .setDescription(
                  "You poked yourself! Now please mention another user"
                )
                .setColor(colors.ERRORRED as ColorResolvable)
                .setFooter({
                  text: `Requested by: ${interaction.user.tag}`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [SelfPoke]
              });
            }

            const PokeEmbed = new EmbedBuilder()
              .setTitle("Poke!")
              .setDescription(
                `**<@!${interaction.user.id}> is poking ${mentionedUser}**`
              )
              .setColor(colors.DEFAULT as ColorResolvable)
              .setImage(link.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            return interaction
              .reply({
                embeds: [PokeEmbed]
              })
              .catch((err: Error) => {
                console.log(`Love Poke Command Error:\n${err.message}`);
                return interaction.reply({
                  content:
                    "Seems like there was something wrong with the API, Please check back later!",
                  ephemeral: true
                });
              });
          }
        },
        ship: {
          description: "Ship two user's together 💗",
          args: [
            {
              name: "user",
              type: ApplicationCommandOptionType.User,
              description: "The user that you want to ship",
              required: true
            },
            {
              name: "user-two",
              type: ApplicationCommandOptionType.User,
              description:
                "Second user that you want to ship, user will be chosen if left empty",
              required: false
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const shipTarget1: User = interaction.options.getUser("user");
            const shipTarget2: User =
              interaction.options.getUser("user-two") || interaction.user;

            const shipPercentage = Math.floor(Math.random() * 100);

            const shipEmbed = new EmbedBuilder()
              .setTitle(
                "<a:flyinghearts:833542646579462164> | Matchmaking | <a:flyinghearts:833542646579462164>"
              )
              .setDescription(`🔻 | ${shipTarget1} \n🔺 | ${shipTarget2}`)
              .setColor("#ff007f")
              .addFields({
                name: "Matchmaking Result:",
                value: ` Their love-score is ${shipPercentage}%! 💘`
              })
              .setFooter({
                text: `They call me cupid 💘`,
                iconURL: interaction.user.displayAvatarURL()
              });

            return interaction.reply({
              embeds: [shipEmbed]
            });
          }
        },
        slap: {
          description: "Slap a user ✋",
          args: [
            {
              name: "user",
              type: ApplicationCommandOptionType.User,
              description: "The user that you want to slap",
              required: true
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const mentionedUser: User = interaction.options.getUser("user");

            let link = await sfw.slap();

            const SlapEmbed = new EmbedBuilder()
              .setTitle("Ouch!")
              .setDescription(
                `**<@!${interaction.user.id}> slapped ${mentionedUser}**`
              )
              .setColor(colors.DEFAULT as ColorResolvable)
              .setImage(link.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const ResponseSlap = new EmbedBuilder()
              .setTitle("Ouch!")
              .setDescription(
                `**${mentionedUser} slapped <@!${interaction.user.id}> back!**`
              )
              .setColor(colors.DEFAULT as ColorResolvable)
              .setImage(link.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const SelfSlap = new EmbedBuilder()
              .setTitle(`...`)
              .setDescription(
                "You slapped yourself congrats! Now please mention someone!"
              )
              .setColor(colors.DEFAULT as ColorResolvable);

            const slapButton = new ButtonBuilder()
              .setCustomId("slap")
              .setEmoji("🤚")
              .setLabel(`Slap ${interaction.user.username} back`)
              .setStyle(ButtonStyle.Danger);

            const slapButtonD = slapButton.setDisabled(true);

            const slapRow: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([slapButton]);
            const slapRowD: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([slapButtonD]);

            if (mentionedUser.id === interaction.user.id) {
              return interaction.reply({
                embeds: [SelfSlap]
              });
            } else {
              await interaction.reply({
                embeds: [SlapEmbed],
                components: [slapRow]
              });
            }

            const filter = (i: Interaction) => {
              return i.user.id === mentionedUser.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                idle: 20000,
                componentType: ComponentType.Button
              });

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              if (i.customId === "slap") {
                if (i.user.id === mentionedUser.id) {
                  await i.editReply({
                    embeds: [ResponseSlap],
                    components: [slapRowD]
                  });
                  return;
                } else {
                  await interaction.followUp({
                    content: `**${i.user.username}** you cannot use that, only **${mentionedUser.username}** can use this button!`,
                    ephemeral: true
                  });
                }
              }

              collector.on("end", async () => {
                interaction.editReply({
                  components: [slapRowD]
                });
              });
            });
          }
        },
        tickle: {
          description: "Tickle a user",
          args: [
            {
              name: "user",
              type: ApplicationCommandOptionType.User,
              description: "The user that you want to tickle",
              required: true
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const mentionedUser: User = interaction.options.getUser("user");

            let link = await sfw.tickle();

            const TickleEmbed = new EmbedBuilder()
              .setTitle("Tickle!")
              .setDescription(
                `**<@!${interaction.user.id}> is tickling ${mentionedUser}**`
              )
              .setColor(colors.DEFAULT as ColorResolvable)
              .setImage(link.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const SelfTickle = new EmbedBuilder()
              .setTitle("I ran into an error! <:error:822091680605011978>")
              .setDescription(
                "You tickled yourself congrats! Now please mention someone"
              )
              .setColor(colors.ERRORRED as ColorResolvable);

            if (mentionedUser.id === interaction.user.id) {
              return interaction.reply({
                embeds: [SelfTickle]
              });
            }

            const tickleFight = new ButtonBuilder()
              .setCustomId("fight")
              .setLabel("Tickle fight!")
              .setStyle(ButtonStyle.Primary);

            const fightRow: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([tickleFight]);

            const tickleFightD = tickleFight.setDisabled(true);

            const fightRowD: ActionRowBuilder<any> =
              new ActionRowBuilder().addComponents([tickleFightD]);

            await interaction.reply({
              embeds: [TickleEmbed],
              components: [fightRow]
            });

            const filter = (i) => i.customId;

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                time: 15000,
                componentType: ComponentType.Button
              });

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              setTimeout(() => {
                i.editReply({
                  components: [fightRowD]
                });
              }, 14850); //14850

              if (i.customId === "fight") {
                const ResponseTickle = new EmbedBuilder()
                  .setTitle("Tickle!")
                  .setDescription(
                    `**${mentionedUser} tickled <@${interaction.user.id}> back, TICKLE FIGHT!**`
                  )
                  .setColor(colors.DEFAULT as ColorResolvable)
                  .setImage(link.url)
                  .setFooter({
                    text: `Requested by: ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                  });

                if (i.user.id === mentionedUser.id) {
                  interaction.editReply({
                    embeds: [ResponseTickle],
                    components: [fightRowD]
                  });
                } else {
                  await interaction.followUp({
                    content: `**${i.user.username}** you cannot use that, only **${mentionedUser.username}** can use this button!`,
                    ephemeral: true
                  });
                }
              }
            });
          }
        },
        kick: {
          description: "Kick a user straight in the face 🦵",
          args: [
            {
              name: "user",
              type: ApplicationCommandOptionType.User,
              description: "The user that you want to kick",
              required: true
            }
          ],
          execute: async ({ client, interaction }: ExecuteFunction) => {
            const mentionedUser: User = interaction.options.getUser("user");

            const res = await fetch("https://api.waifu.pics/sfw/kick");
            const img = (await res.json()).url;

            if (mentionedUser.id === interaction.user.id) {
              const SelfKick = new EmbedBuilder()
                .setTitle("Um okay")
                .setDescription(
                  "You kicked yourself! Now please mention another user"
                )
                .setColor(colors.DEFAULT as ColorResolvable);

              return interaction.reply({
                embeds: [SelfKick],
                ephemeral: true
              });
            }

            const KickEmbed = new EmbedBuilder()
              .setTitle("Ouch!")
              .setDescription(
                `**<@${interaction.user.id}> kicks ${mentionedUser}**`
              )
              .setImage(img)
              .setColor(colors.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            return interaction
              .reply({
                embeds: [KickEmbed]
              })
              .catch((err: Error) => {
                console.log(`Love Kick Command Error:\n${err.message}`);
                return interaction.reply({
                  content:
                    "Seems like there was something wrong with the API, Please check back later!",
                  ephemeral: true
                });
              });
          }
        }
      }
    });
  }
}
