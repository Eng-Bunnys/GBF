import SlashCommand from "../../utils/slashCommands";

import colors from "../../GBF/GBFColor.json";
import emojis from "../../GBF/GBFEmojis.json";

import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ColorResolvable,
  CommandInteractionOptionResolver
} from "discord.js";

import fetch from "node-fetch";

import GBFClient from "../../handler/clienthandler";

export default class Search extends SlashCommand {
  constructor(client: GBFClient) {
    super(client, {
      name: "search",
      description: "Search the wiki, urban dictionary or my anime list",
      category: "Utility",
      botPermission: [],
      cooldown: 5,
      subcommands: {
        urban: {
          description: "Search the urban dictionary",
          args: [
            {
              name: "query",
              description: "The search query",
              type: ApplicationCommandOptionType.String,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const Question = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("query");

            try {
              const response = await fetch(
                `https://mashape-community-urban-dictionary.p.rapidapi.com/define?term=${Question}`,
                {
                  method: "GET",
                  headers: {
                    "x-rapidapi-host":
                      "mashape-community-urban-dictionary.p.rapidapi.com",
                    "x-rapidapi-key":
                      "693ff5fa5dmsh9a0687dcd36d548p19344cjsn67a5f0097ced"
                  }
                }
              ).then((response) => response.json());

              let definition: string;
              if (response.list[0].definition.length > 1024) {
                definition =
                  response.list[0].definition.substring(0, 983) +
                  "... \n**Click the Above Link to Continue**";
              } else {
                definition = response.list[0].definition;
              }

              let example: string;
              if (response.list[0].example == "") {
                example = "None";
              } else {
                if (response.list[0].example.length > 1024) {
                  example =
                    response.list[0].example.substring(0, 983) +
                    "... \n**Click the Above Link to Continue**";
                } else {
                  example = response.list[0].example;
                }
              }

              const QuestionButton: ActionRowBuilder<any> =
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setLabel(Question)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${response.list[0].permalink}`)
                );

              const ThumbsUp = Number(response.list[0].thumbs_up);
              const ThumbsDown = Number(response.list[0].thumbs_down);

              const percentageDifference = (
                ((ThumbsUp - ThumbsDown) / ThumbsUp) *
                100
              ).toFixed(1);

              const ResponseEmbed = new EmbedBuilder()
                .setTitle(`Definition of ${response.list[0].word}`)
                .setDescription(`${definition}\n\n**Example**\n${example}`)
                .addFields(
                  {
                    name: "👍",
                    value: `${ThumbsUp.toLocaleString()}`,
                    inline: true
                  },
                  {
                    name: "👎",
                    value: `${ThumbsDown.toLocaleString()}`,
                    inline: true
                  }
                )
                .setColor(colors.DEFAULT as ColorResolvable)
                .setThumbnail(
                  "https://cdn.discordapp.com/emojis/839326629544722443.png?v=1"
                )
                .setURL(`${response.list[0].permalink}`)
                .setFooter({
                  text: `Made by ${response.list[0].author}, ${percentageDifference}% upvoted`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [ResponseEmbed],
                components: [QuestionButton]
              });
            } catch (error) {
              const NoResponse = new EmbedBuilder()
                .setTitle(`Search Error`)
                .setDescription(`No data was retrieved for ${Question}`)
                .setColor(colors.ERRORRED as ColorResolvable)
                .setFooter({
                  text: `JS: ${error}`,
                  iconURL: interaction.user.displayAvatarURL()
                });
              return interaction.reply({
                embeds: [NoResponse],
                ephemeral: true
              });
            }
          }
        },
        wiki: {
          description: "Search the wiki for a topic",
          args: [
            {
              name: "query",
              description: "The search query",
              type: ApplicationCommandOptionType.String,
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            const SearchQuery = (
              interaction.options as CommandInteractionOptionResolver
            ).getString("query");

            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
              SearchQuery
            )}`;

            let response;
            try {
              response = await fetch(url).then((res) => res.json());
            } catch (e) {
              console.log(e);
              return interaction.reply({
                content: "I ran into an error, try again later",
                ephemeral: true
              });
            }
            //Multiple results
            try {
              if (response.type === "disambiguation") {
                const MultipleResults = new EmbedBuilder()
                  .setTitle(response.title)
                  .setThumbnail(
                    `https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/2244px-Wikipedia-logo-v2.svg.png`
                  )
                  .setDescription(
                    `${response.extract}\nLinks For Topic You Searched [Link](${response.content_urls.desktop.page}).`
                  )
                  .setColor(colors.DEFAULT as ColorResolvable)
                  .setURL(response.content_urls.desktop.page)
                  .setFooter({
                    text: `Requested by: ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                  });

                return interaction.reply({
                  embeds: [MultipleResults]
                });
                //One result
              } else {
                const OneResult = new EmbedBuilder()
                  .setTitle(response.title)
                  .setDescription(response.extract)
                  .setThumbnail(
                    `https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/2244px-Wikipedia-logo-v2.svg.png`
                  )
                  .setColor(colors.DEFAULT as ColorResolvable)
                  .setFooter({
                    text: `Requested by: ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                  })
                  .setURL(response.content_urls.desktop.page);
                return interaction.reply({
                  embeds: [OneResult]
                });
              }
            } catch {
              const NotFound = new EmbedBuilder()
                .setTitle(`${emojis.ERROR} Invalid Query`)
                .setDescription(`I can't find anything for \`${SearchQuery}\``)
                .setColor(colors.DEFAULT as ColorResolvable)
                .setFooter({
                  text: `Requested by: ${interaction.user.username}`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [NotFound],
                ephemeral: true
              });
            }
          }
        },
        worldclock: {
          description: "Shows the time in different time zones",
          execute: async ({ client, interaction }) => {
            let gmt = new Date().toLocaleString("en-US", {
              timeZone: "Europe/London"
            });
            let est = new Date().toLocaleString("en-US", {
              timeZone: "America/New_York"
            });
            let pst = new Date().toLocaleString("en-US", {
              timeZone: "America/Los_Angeles"
            });
            let cst = new Date().toLocaleString("en-US", {
              timeZone: "America/Mexico_City"
            });
            let cet = new Date().toLocaleString("en-US", {
              timeZone: "CET"
            });
            let mst = new Date().toLocaleString("en-US", {
              timeZone: "America/Phoenix"
            });
            let aest = new Date().toLocaleString("en-US", {
              timeZone: "Australia/Sydney"
            });
            let awst = new Date().toLocaleString("en-US", {
              timeZone: "Australia/Perth"
            });
            let kst = new Date().toLocaleString("en-US", {
              timeZone: "Asia/Seoul"
            });
            let ist = new Date().toLocaleString("en-US", {
              timeZone: "Asia/Calcutta"
            });
            let bst = new Date().toLocaleString("en-US", {
              timeZone: "Asia/Dhaka"
            });

            const WorldClock = new EmbedBuilder()
              .setTitle("World Clock - Timezones")
              .addFields(
                {
                  name: ":flag_us: New York (EST)",
                  value: `${est}\n(GMT-5)`,
                  inline: true
                },
                {
                  name: ":flag_us: Los Angles (PST)",
                  value: `${pst}\n(GMT-8)`,
                  inline: true
                },
                {
                  name: ":flag_us: Mexico City (CST)",
                  value: `${cst}\n(GMT-7)`,
                  inline: true
                },
                {
                  name: ":flag_eu: London (GMT)",
                  value: `${gmt}\n(GMT+0/GMT+1)`,
                  inline: true
                },
                {
                  name: ":flag_eu: Central (CET)",
                  value: `${cet}\n(GMT+1)`,
                  inline: true
                },
                { name: "\u200B", value: "\u200B", inline: true },
                {
                  name: ":flag_kr: Korean (KST)",
                  value: `${kst}\n(GMT+9)`,
                  inline: true
                },
                {
                  name: ":flag_in: India (IST)",
                  value: `${ist}\n(GMT+05:30)`,
                  inline: true
                },
                {
                  name: ":flag_bd: Bangladesh (BST)",
                  value: `${bst} (GMT+6)`,
                  inline: true
                },
                {
                  name: ":flag_au: Sydney (AEST)",
                  value: `${aest}\n(GMT+11)`,
                  inline: true
                },
                {
                  name: ":flag_au: Perth (AWST)",
                  value: `${awst}\n(GMT+8)`,
                  inline: true
                },
                { name: "\u200B", value: "\u200B", inline: true }
              )
              .setColor(colors.DEFAULT as ColorResolvable)
              .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            await interaction.reply({
              embeds: [WorldClock]
            });
          }
        }
      }
    });
  }
}