const SlashCommand = require("../../utils/slashCommands");
const title = require("../../GBF/Embed Messages.json");
const colors = require("../../GBF/GBFColor.json");

const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ApplicationCommandOptionType
} = require("discord.js");

const client = require("nekos.life");

const { sfw } = new client();

const fetch = require("node-fetch");

const { delay } = require("../../utils/engine");

module.exports = class LoveCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "love",
      description: "Love commands like Hug, Kiss etc",
      category: "Love",
      userPermission: [],
      botPermission: [],
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
          execute: async ({ client, interaction }) => {
            const mentionedUser = interaction.options.getUser("user");

            const res = await fetch("https://api.waifu.pics/sfw/bite");
            const img = (await res.json()).url;

            const selfBite = new EmbedBuilder()
              .setTitle("Ummm")
              .setDescription(`**<@${interaction.user.id}> bit themselves??**`)
              .setImage(img)
              .setColor(colors.DEFAULT)
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
              .setColor(colors.DEFAULT)
              .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (mentionedUser.id === interaction.user.id) {
              return interaction
                .reply({
                  embeds: [selfBite]
                })
                .catch((err) => {
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
                .catch((err) => {
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
          execute: async ({ client, interaction }) => {
            const mentionedUser = interaction.options.getUser("user");

            const res = await fetch("https://api.waifu.pics/sfw/bonk");
            const img = (await res.json()).url;

            const weirdargs = new EmbedBuilder()

              .setTitle(
                title.ERROR,
                `Error: User is lonely <:PepeLaugh:755582130175868979>`
              )
              .setDescription(
                `Please mention someone who's not you <:facepalm:705007575745298453>`
              )
              .setColor(colors.ERRORRED);

            const mainembed = new EmbedBuilder()

              .setTitle(`BONK <:BONK:864267943206715453>`)
              .setDescription(
                `**<@${interaction.user.id}> bonks ${mentionedUser}**`
              )
              .setImage(img)
              .setColor(colors.DEFAULT)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (mentionedUser.id === interaction.user.id) {
              return interaction.reply({
                embeds: [weirdargs]
              });
            } else {
              return interaction
                .reply({
                  embeds: [mainembed]
                })
                .catch((err) => {
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
          execute: async ({ client, interaction }) => {
            const mentionedUser = interaction.options.getUser("user");

            const res = await fetch("https://api.waifu.pics/sfw/bully");
            const img = (await res.json()).url;

            if (mentionedUser.id === interaction.user.id) {
              const weirdargs = new EmbedBuilder()

                .setTitle(title.ERROR, ` Error: User has no friends to bully`)
                .setDescription(
                  `Mention someone that is not <@${interaction.user.id}> to bully!\n\`Mention someone that's not you lol\``
                )
                .setColor(colors.ERRORRED);

              return interaction.reply({
                embeds: [weirdargs]
              });
            }

            const mainembed = new EmbedBuilder()

              .setTitle("WTH")
              .setDescription(
                `**<@${interaction.user.id}> bullies ${mentionedUser}**`
              )
              .setImage(img)
              .setColor(colors.DEFAULT)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            return interaction
              .reply({
                embeds: [mainembed]
              })
              .catch((err) => {
                return interaction.reply({
                  content:
                    "Seems like there was something wrong with the API, Please check back later!"
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
          execute: async ({ client, interaction }) => {
            const mentionedUser = interaction.options.getUser("user");

            let slaplink = await sfw.slap();

            let link = await sfw.cuddle();

            const norealuser = new EmbedBuilder()

              .setTitle(title.ERROR, ` Error: User is lonely`)
              .setDescription(
                "Hey if you don't have anyone to cuddle you could always cuddle me! <:trollface:838959517965353060>"
              )
              .setColor(colors.ERRORRED)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const hugbot = new EmbedBuilder()

              .setTitle("Ewwwwww get away from me")
              .setDescription(`**<@!${interaction.user.id}> TOUCHED ME!!!**`)
              .setColor("#e91e63")
              .setImage(slaplink.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const cuddleEmbed = new EmbedBuilder()

              .setTitle("Cuddles!")
              .setDescription(
                `**<@!${interaction.user.id}> is cuddling with ${mentionedUser}**`
              )
              .setColor("#e91e63")
              .setImage(link.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (interaction.user.id === mentionedUser.id) {
              return interaction.reply({
                embeds: [norealuser]
              });
            }

            if (mentionedUser.id === client.user.id) {
              return interaction.reply({
                embeds: [hugbot]
              });
            }

            return interaction.reply({
              embeds: [cuddleEmbed]
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
          execute: async ({ client, interaction }) => {
            const mentionedUser = interaction.options.getUser("user");

            const res = await fetch("https://api.waifu.pics/sfw/handhold");
            const img = (await res.json()).url;

            if (mentionedUser.id === interaction.user.id) {
              const userisweird = new EmbedBuilder()

                .setTitle("Ummm...")
                .setDescription(
                  `**<@${interaction.user.id}> held hands with themselves??**`
                )
                .setImage(img)
                .setColor(colors.DEFAULT)
                .setFooter({
                  text: `Requested by: ${interaction.user.tag}`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [userisweird]
              });
            }

            const mainembed = new EmbedBuilder()

              .setTitle("So cute!")
              .setDescription(
                `**<@${interaction.user.id}> is holding hands with ${mentionedUser}**`
              )
              .setImage(img)
              .setColor(colors.DEFAULT)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            return interaction
              .reply({
                embeds: [mainembed]
              })
              .catch((err) => {
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
          execute: async ({ client, interaction }) => {
            const mentionedUser = interaction.options.getUser("user");

            let link = await sfw.kiss();
            let slaplink = await sfw.slap();

            const norealuser = new EmbedBuilder()

              .setTitle(title.ERROR, ` Error: User is lonely`)
              .setDescription("lol")
              .setColor(colors.ERRORRED)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const hugbot = new EmbedBuilder()

              .setTitle("Ewwwwww get away from me")
              .setDescription(
                `**<@!${interaction.user.id}> TRIED TO KISS ME!!!**`
              )
              .setColor("#e91e63")
              .setImage(slaplink.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const kissEmbed = new EmbedBuilder()

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
                embeds: [norealuser]
              });
            }

            if (mentionedUser.id === client.user.id) {
              return interaction.reply({
                embeds: [hugbot]
              });
            }

            return interaction.reply({
              embeds: [kissEmbed]
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
          execute: async ({ client, interaction }) => {
            const mentionedUser = interaction.options.getUser("user");

            let slaplink = await sfw.slap();

            let link = await sfw.hug();

            const norealuser = new EmbedBuilder()

              .setTitle(
                title.ERROR,
                ` Error: User can't find someone to hug <:PepeLaugh:755582130175868979>`
              )
              .setDescription(
                `You could always hug me <:pleadingface:799827859505807380>`
              )
              .setColor(colors.ERRORRED)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const hugbot = new EmbedBuilder()

              .setTitle("Ewwwwww get away from me")
              .setDescription(`**<@!${interaction.user.id}> TOUCHED ME!!!**`)
              .setColor("#e91e63")
              .setImage(slaplink.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const hugEmbed = new EmbedBuilder()

              .setTitle("So cute!")
              .setDescription(
                `**<@!${interaction.user.id}> is hugging ${mentionedUser}**`
              )
              .setColor("#e91e63")
              .setImage(link.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            if (interaction.user.id === mentionedUser.id) {
              return interaction.reply({
                embeds: [norealuser]
              });
            }

            if (mentionedUser.id === client.user.id) {
              return interaction.reply({
                embeds: [hugbot]
              });
            }

            return interaction.reply({
              embeds: [hugEmbed]
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
          execute: async ({ client, interaction }) => {
            const mentionedUser = interaction.options.getUser("user");

            let link = await sfw.poke();

            if (mentionedUser.id === interaction.user.id) {
              let errorembed2 = new EmbedBuilder()

                .setTitle("Um okay")
                .setDescription(
                  "You poked yourself! Now please mention another user"
                )
                .setColor("#FF0000")
                .setFooter({
                  text: `Requested by: ${interaction.user.tag}`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [errorembed2]
              });
            }

            let pokeEmbed = new EmbedBuilder()

              .setTitle("Poke!")
              .setDescription(
                `**<@!${interaction.user.id}> is poking ${mentionedUser}**`
              )
              .setColor("#e91e63")
              .setImage(link.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            return interaction
              .reply({
                embeds: [pokeEmbed]
              })
              .catch((err) => {
                console.log(err + ` Poke command`);
                return interaction.reply({
                  embeds: [errorembedx]
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
          execute: async ({ client, interaction }) => {
            const shipTarget1 = interaction.options.getUser("user");
            const shipTarget2 =
              interaction.options.getUser("user-two") || interaction.user;

            const shipEmbed = new EmbedBuilder()
              .setTitle(
                "<a:flyinghearts:833542646579462164> | MatchMaking | <a:flyinghearts:833542646579462164>"
              )
              .setDescription(
                `
                            🔻 | ${shipTarget1} \n🔺 | ${shipTarget2}
                            `
              )
              .setColor("#ff007f")
              .addField(
                "MatchMaking Result",
                `
                              Their love-score is ${Math.floor(
                                Math.random() * 100
                              )}%! 💘
                            `
              )
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
          execute: async ({ client, interaction }) => {
            const mentionedUser = interaction.options.getUser("user");

            let link = await sfw.slap();

            const slapEmbed = new EmbedBuilder()

              .setTitle("Ouch!")
              .setDescription(
                `**<@!${interaction.user.id}> slapped ${mentionedUser}**`
              )
              .setColor("#e91e63")
              .setImage(link.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const slapEmbed2 = new EmbedBuilder()

              .setTitle("Ouch!")
              .setDescription(
                `**${mentionedUser} slapped <@!${interaction.user.id}> back!**`
              )
              .setColor("#e91e63")
              .setImage(link.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const errorEmbed = new EmbedBuilder()
              .setTitle("I ran into an error! <:error:822091680605011978>")
              .setDescription(
                "You slapped yourself congrats! Now please mention someone!"
              )
              .setColor("#FF0000");

            const slapButton = new ButtonBuilder()
              .setCustomId("slap")
              .setEmoji("🤚")
              .setLabel(`Slap ${interaction.user.username} back`)
              .setStyle(ButtonStyle.Danger);

            const slapButtonD = new ButtonBuilder()
              .setCustomId("slapD")
              .setEmoji("🤚")
              .setLabel(`Slap ${interaction.user.username} back`)
              .setStyle(ButtonStyle.Danger)
              .setDisabled(true);

            const slapRow = new ActionRowBuilder().addComponents([slapButton]);
            const slapRowD = new ActionRowBuilder().addComponents([
              slapButtonD
            ]);

            if (mentionedUser.id === interaction.user.id) {
              return interaction.reply({
                embeds: [errorEmbed]
              });
            } else {
              await interaction.reply({
                embeds: [slapEmbed],
                components: [slapRow]
              });
            }

            const filter = (i) => {
              return i.user.id === mentionedUser.id;
            };

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                idle: 20000
              });

            collector.on("collect", async (i) => {
              await i.deferUpdate();
              await delay(750);

              if (i.customId === "slap") {
                if (i.user.id === mentionedUser.id) {
                  return await i.editReply({
                    embeds: [slapEmbed2],
                    components: [slapRowD]
                  });
                } else {
                  await interaction.followUp({
                    content: `**${i.user.username}** you cannot use that, only **${mentionedUser.username}** can use this button!`,
                    ephemeral: true
                  });
                }
              }

              collector.on("end", async (end, reason) => {
                return interaction.editReply({
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
          execute: async ({ client, interaction }) => {
            const mentionedUser = interaction.options.getUser("user");

            let link = await sfw.tickle();

            const tickleEmbed = new EmbedBuilder()

              .setTitle("Tickle!")
              .setDescription(
                `**<@!${interaction.user.id}> is tickling ${mentionedUser}**`
              )
              .setColor("#e91e63")
              .setImage(link.url)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            const errorEmbed = new EmbedBuilder()
              .setTitle("I ran into an error! <:error:822091680605011978>")
              .setDescription(
                "You tickled yourself congrats! Now please mention someone"
              )
              .setColor("#FF0000");

            if (mentionedUser.id === interaction.user.id) {
              return interaction.reply({
                embeds: [errorEmbed]
              });
            }

            const tickleFight = new ButtonBuilder()
              .setCustomId("fight")
              .setLabel("Tickle fight!")
              .setStyle(ButtonStyle.Primary);

            const fightRow = new ActionRowBuilder().addComponents([
              tickleFight
            ]);

            const tickleFightD = new ButtonBuilder()
              .setCustomId("fight")
              .setLabel("Tickle fight!")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true);

            const fightRowD = new ActionRowBuilder().addComponents([
              tickleFightD
            ]);

            await interaction.reply({
              embeds: [tickleEmbed],
              components: [fightRow]
            });

            const filter = (i) => i.customId;

            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                time: 15000
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
                const tickleEmbed2 = new EmbedBuilder()

                  .setTitle("Tickle!")
                  .setDescription(
                    `**${mentionedUser} tickled <@${interaction.user.id}> back, TICKLE FIGHT!**`
                  )
                  .setColor("#e91e63")
                  .setImage(link.url)
                  .setFooter({
                    text: `Requested by: ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                  });

                if (i.user.id === mentionedUser.id) {
                  return interaction.editReply({
                    embeds: [tickleEmbed2],
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
          execute: async ({ client, interaction }) => {
            const mentionedUser = interaction.options.getUser("user");

            const res = await fetch("https://api.waifu.pics/sfw/kick");
            const img = (await res.json()).url;

            if (mentionedUser.id === interaction.user.id) {
              const NoMention = new EmbedBuilder()
                .setTitle("Um okay")
                .setDescription(
                  "You kicked yourself! Now please mention another user"
                )
                .setColor("#FF0000");

              return interaction.reply({
                embeds: [NoMention],
                ephemeral: true
              });
            }

            const mainembed = new EmbedBuilder()
              .setTitle("Ouch!")
              .setDescription(
                `**<@${interaction.user.id}> kicks ${mentionedUser}**`
              )
              .setImage(img)
              .setColor(colors.DEFAULT)
              .setFooter({
                text: `Requested by: ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            return interaction
              .reply({
                embeds: [mainembed]
              })
              .catch((err) => {
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
};
