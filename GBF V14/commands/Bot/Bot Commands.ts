const SlashCommand = require("../../utils/slashCommands").default;

import {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  Client,
  ColorResolvable,
  Guild
} from "discord.js";

import duration from "humanize-duration";

import colours from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

const NP1 =
  "API error, After sometime has passed you can try again and it should be working";
const DB2 =
  "Database error, If it is related to the server menu please rerun the command and it will work";
const PERM3 =
  "Permission error, The bot does not have the required permissions to do a certain action";
const PERM4 =
  "Permission error, The user does not have the required perimissions to run a certain command";
const BAN5 = "User has been banned from using the bot";
const TOGGLE6 = "Command has been disabled from the server";
const UnknownBanE = `The user is not banned in the server`;

export default class BotSub extends SlashCommand {
  constructor(client: Client) {
    super(client, {
      name: "bot",
      description: "General bot commands",
      category: "Bot-Info",
      cooldown: 0,
      development: false,
      subcommands: {
        invite: {
          description: "GBF related links",
          execute: async ({ client, interaction }) => {
            const Links = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setLabel("Bot Invite link")
                  .setStyle(ButtonStyle.Link)
                  .setEmoji("<:GBFLogo:838990392128307231>")
                  .setURL(
                    "https://discord.com/api/oauth2/authorize?client_id=795361755223556116&permissions=1642787765494&scope=bot%20applications.commands"
                  )
              )
              .addComponents(
                new ButtonBuilder()
                  .setLabel("Support server")
                  .setStyle(ButtonStyle.Link)
                  .setEmoji("<:LogoTransparent:838994085527945266>")
                  .setURL("https://discord.gg/uggACsjX8q")
              )
              .addComponents(
                new ButtonBuilder()
                  .setLabel("Top.gg")
                  .setStyle(ButtonStyle.Link)
                  .setEmoji("<:tog:882279600506433607>")
                  .setURL("https://top.gg/bot/795361755223556116/vote")
              )
              .addComponents(
                new ButtonBuilder()
                  .setLabel("PayPal")
                  .setStyle(ButtonStyle.Link)
                  .setEmoji("<:PayPalLogo:1095867191318032464>")
                  .setURL(
                    "https://paypal.me/youssefothamn?country.x=EG&locale.x=en_US"
                  )
              );

            const inviteEmbed = new EmbedBuilder()
              .setTitle(`${emojis.LOGOTRANS} GBF Links`)
              .addFields(
                {
                  name: "Invite me to your server!",
                  value: `- [Bot invite link](${"https://discord.com/api/oauth2/authorize?client_id=795361755223556116&permissions=1642787765494&scope=bot%20applications.commands"})`,
                  inline: true
                },
                {
                  name: "Support server!",
                  value: `- [Support server link](${"https://discord.gg/uggACsjX8q"})`,
                  inline: true
                },
                {
                  name: "\u200b",
                  value: "\u200b",
                  inline: true
                },
                {
                  name: `Vote for ${client.user.username} on Top.gg!`,
                  value: `- [Vote here](${"https://top.gg/bot/795361755223556116/vote"})`,
                  inline: true
                },
                {
                  name: `Donate using PayPal`,
                  value: `- [Donate here](${"https://paypal.me/youssefothamn?country.x=EG&locale.x=en_US"} "I'm Batman 🦇")`,
                  inline: true
                },
                {
                  name: "\u200b",
                  value: "\u200b",
                  inline: true
                }
              )
              .setColor(colours.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            return interaction.reply({
              embeds: [inviteEmbed],
              components: [Links]
            });
          }
        },
        uptime: {
          description: "See how long GBF has been awake",
          execute: async ({ client, interaction }) => {
            const NP1ErrorEmbed = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} NP1 Error `)
              .setDescription(
                `Please run \`/error np1\` to know more about the error and how to fix it`
              )
              .setColor(colours.ERRORRED as ColorResolvable)
              .setTimestamp();

            let uptime = duration(client.uptime, {
              units: ["y", "mo", "w", "d", "h", "m", "s"],
              round: true
            });

            const UptimeEmbed = new EmbedBuilder()
              .setTitle(`${client.user.username}'s uptime`)
              .setDescription(uptime)
              .setColor(colours.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            return interaction
              .reply({
                embeds: [UptimeEmbed]
              })
              .catch((err: Error) => {
                console.log(`Uptime Command Error: ${err.message}`);
                return interaction.reply({
                  embeds: [NP1ErrorEmbed],
                  ephemeral: true
                });
              });
          }
        },
        users: {
          description: "See GBF's user stats",
          execute: async ({ client, interaction }) => {
            let totalUsersArray: Array<number> = [];
            await client.guilds.cache.map((guild: Guild) => {
              totalUsersArray.push(guild.memberCount);
              return totalUsersArray;
            });

            let totalNumberOfUsers: number =
              totalUsersArray.reduce((a, b) => a + b, 0);

            const totalServers: number = client.guilds.cache.size;

            const averageUsers: number = Number(
              (totalNumberOfUsers / totalServers).toFixed(0)
            );

            const displayButtons = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel(`${totalNumberOfUsers.toLocaleString()} users`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
                .setCustomId(`totalUsersDisabled`),
              new ButtonBuilder()
                .setLabel(`${totalServers.toLocaleString()} servers`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
                .setCustomId(`totalServersDisabled`),
              new ButtonBuilder()
                .setLabel(
                  `${averageUsers.toLocaleString()} average users per server`
                )
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
                .setCustomId(`averageUsersDisabled`)
            );

            const usersEmbed = new EmbedBuilder()
              .setTitle(`${client.user.username}'s user stats`)
              .addFields(
                {
                  name: "Total users",
                  value: `${totalNumberOfUsers.toLocaleString()}`,
                  inline: true
                },
                {
                  name: "Total servers",
                  value: `${totalServers.toLocaleString()}`,
                  inline: true
                },
                {
                  name: "Average users per server",
                  value: `${averageUsers.toLocaleString()}`,
                  inline: true
                }
              )
              .setColor(colours.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
              })
              .setTimestamp();

            return interaction.reply({
              embeds: [usersEmbed],
              components: [displayButtons]
            });
          }
        },
        ping: {
          description: "Check GBF's ping 🏓",
          execute: async ({ client, interaction }) => {
            const pingEmbed = new EmbedBuilder()
              .setTitle(`Pong 🏓`)
              .setDescription(
                `Bot Ping: \`${Math.abs(
                  Date.now() - interaction.createdTimestamp
                )}ms\`\nAPI Latency: \`${Math.round(client.ws.ping)}ms\``
              )
              .setColor(colours.DEFAULT as ColorResolvable);

            return interaction.reply({
              embeds: [pingEmbed]
            });
          }
        },
        errors: {
          description: "GBF Bot errors",
          args: [
            {
              name: "error",
              description: "The error code",
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "NP1",
                  value: "np1"
                },
                {
                  name: "DB2",
                  value: "db2"
                },
                {
                  name: "Perm3",
                  value: "perm3"
                },
                {
                  name: "Perm4",
                  value: "perm4"
                },
                {
                  name: "Ban5",
                  value: "ban5"
                },
                {
                  name: "Toggle6",
                  value: "toggle6"
                },
                {
                  name: "UnknownBanE",
                  value: "UnknownBanE"
                },
                {
                  name: "List",
                  value: "list"
                }
              ],
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const errorType: string = interaction.options.getString(
              "error",
              true
            );

            if (errorType === "np1") {
              const np1Error = new EmbedBuilder()
                .setTitle("NP1 Error")
                .setColor(colours.DEFAULT as ColorResolvable)
                .setDescription(`⚠ ${NP1}`)
                .setFooter({
                  text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [np1Error]
              });
            } else if (errorType === "db2") {
              const db2Error = new EmbedBuilder()
                .setTitle("DB2 Error")
                .setColor(colours.DEFAULT as ColorResolvable)
                .setDescription(`⚠ ${DB2}`)
                .setFooter({
                  text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [db2Error]
              });
            } else if (errorType === "perm3") {
              const perm3Error = new EmbedBuilder()
                .setTitle("PERM3 Error")
                .setColor(colours.DEFAULT as ColorResolvable)
                .setDescription(`⚠ ${PERM3}`)
                .setFooter({
                  text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [perm3Error]
              });
            } else if (errorType === "perm4") {
              const perm4Error = new EmbedBuilder()
                .setTitle("PERM4 Error")
                .setColor(colours.DEFAULT as ColorResolvable)
                .setDescription(`⚠ ${PERM4}`)
                .setFooter({
                  text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [perm4Error]
              });
            } else if (errorType === "ban5") {
              const ban5Error = new EmbedBuilder()
                .setTitle("BAN5 Error")
                .setColor(colours.DEFAULT as ColorResolvable)
                .setDescription(`⚠ ${BAN5}`)
                .setFooter({
                  text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [ban5Error]
              });
            } else if (errorType === "toggle6") {
              const toggle6Error = new EmbedBuilder()
                .setTitle("TOGGLE6 Error")
                .setColor(colours.DEFAULT as ColorResolvable)
                .setDescription(`⚠ ${TOGGLE6}`)
                .setFooter({
                  text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [toggle6Error]
              });
            } else if (errorType === "UnknownBanE") {
              const UnknownBanEerror = new EmbedBuilder()
                .setTitle("UnknownBanE Error")
                .setColor(colours.DEFAULT as ColorResolvable)
                .setDescription(`⚠ ${UnknownBanE}`)
                .setFooter({
                  text: `If the error continues and the error is NOT a ban or toggle please contact support`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [UnknownBanEerror]
              });
            } else if (errorType === "list") {
              const valuetext = `\`Please use the slash list to choose the error\``;

              const listEmbed = new EmbedBuilder()
                .setTitle("GBF ERRORS")
                .setColor(colours.DEFAULT as ColorResolvable)
                .setTimestamp()
                .addFields(
                  {
                    name: `${emojis.ERROR} NP1`,
                    value: valuetext
                  },
                  {
                    name: `${emojis.ERROR} DB2`,
                    value: valuetext
                  },
                  {
                    name: `${emojis.ERROR} PERM3`,
                    value: valuetext
                  },
                  {
                    name: `${emojis.ERROR} PERM4`,
                    value: valuetext
                  },
                  {
                    name: `${emojis.ERROR} BAN5`,
                    value: valuetext
                  },
                  {
                    name: `${emojis.ERROR} TOGGLE6`,
                    value: valuetext
                  },
                  {
                    name: `${emojis.ERROR} UnknownBanE`,
                    value: valuetext
                  }
                )
                .setFooter({
                  text: `Requested by: ${interaction.user.username}`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [listEmbed]
              });
            }
          }
        },
        tos: {
          description: "GBF's ToS for general use and what we collect",
          execute: async ({ client, interaction }) => {
            const ToS_Embed = new EmbedBuilder()
              .setTitle(
                `${emojis.LOGOTRANS} GBF Terms of service and privacy policy`
              )
              .setColor(colours.DEFAULT as ColorResolvable)
              .addFields(
                {
                  name: `GBF Bot`,
                  value: `By using GBF Bot or DunkelLuz services you agree to our terms and conditions\nYour agreement with us includes these Terms and our Privacy Policy (“Agreements”). You acknowledge that you have read and understood Agreements, and agree to be bound of them.\n\nIf you do not agree with (or cannot comply with) Agreements, then you may not use the Service, but please let us know by emailing at gbfofficesteam@gmail.com so we can try to find a solution. These Terms apply to all visitors, users and others who wish to access or use Service.\n\nAny contests, sweepstakes or other promotions made available through Service may be governed by rules that are separate from these Terms of Service. If you participate in any Promotions, please review the applicable rules as well as our Privacy Policy. If the rules for a Promotion conflict with these Terms of Service, Promotion rules will apply.`
                },
                {
                  name: "Accounts",
                  value: `When you create an account with us, you guarantee that you are above the age of 13, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on Service.\n\nYou are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password, whether your password is with our Service or a third-party service. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.\n\nWe may terminate or suspend your account and bar access to Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of Terms.`
                },
                {
                  name: "Data",
                  value: `This section will talk about the data that is collected and stored on our services, this section will not include what GBF has access to since this is determined by the user.`
                },
                {
                  name: "Data [GBF Bot]",
                  value: `By using GBF Bot you agree to give us access to the following information:\n\`Logging:\`\n• Guild ID\n• Logging Channel ID\n\nNo data is collected if basic GBF is used.`
                },
                {
                  name: "Data [DunkelLuz]",
                  value: `By using DunkelLuz services you agree to give us access to the following information:\n• User ID\n• DunkelLuz Account creation date\n• DunkelLuz Account details (Password and Username)\n• Account rank\n• Cash in wallet\n• Money in bank\n• Total net worth\n• Total cash earned\n• Total RP earned`
                },
                {
                  name: "Timer System",
                  value: `By using GBF Timers you agree to give us access to the following information:\n• User ID\n• Time that you use the timer system\n• ID of the timer you're using\n• Topic of the session`
                }
              );

            return interaction.reply({
              embeds: [ToS_Embed],
              ephemeral: true
            });
          }
        }
      }
    });
  }
}
