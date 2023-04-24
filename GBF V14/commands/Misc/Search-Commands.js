const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType
} = require("discord.js");
const SlashCommand = require("../../utils/slashCommands");

const colors = require("../../GBF/GBFColor.json");
const emojis = require("../../GBF/GBFEmojis.json");

const fetch = require("node-fetch");

module.exports = class Search extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "search",
      description: "Search the wiki, urban dictionary or my anime list",
      category: "Utility",
      botPermission: [],
      cooldown: 5,
      development: false,
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
            const question = interaction.options.getString("query");
            try {
              const response = await fetch(
                `https://mashape-community-urban-dictionary.p.rapidapi.com/define?term=${question}`,
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

              let definition;
              if (response.list[0].definition.length > 1024) {
                definition =
                  response.list[0].definition.substring(0, 983) +
                  "... \n**Click the Above Link to Continue**";
              } else {
                definition = response.list[0].definition;
              }

              let example;
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

              const questionButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setLabel(question)
                  .setStyle(ButtonStyle.Link)
                  .setURL(`${response.list[0].permalink}`)
              );

              const firstDig = Number(response.list[0].thumbs_up);
              const secondDig = Number(response.list[0].thumbs_down);

              const percentageDifference = (
                ((firstDig - secondDig) / firstDig) *
                100
              ).toFixed(1);

              const mainEmbed = new EmbedBuilder()
                .setTitle(`Definition of ${response.list[0].word}`)
                .setDescription(`${definition}\n\n**Example**\n${example}`)
                .addFields(
                  {
                    name: "👍",
                    value: `${response.list[0].thumbs_up}`,
                    inline: true
                  },
                  {
                    name: "👎",
                    value: `${response.list[0].thumbs_down}`,
                    inline: true
                  }
                )

                .setColor(colors.DEFAULT)
                .setThumbnail(
                  "https://cdn.discordapp.com/emojis/839326629544722443.png?v=1"
                )
                .setURL(`${response.list[0].permalink}`)
                .setFooter({
                  text: `Made by ${response.list[0].author}, ${percentageDifference}% upvoted`,
                  iconURL: interaction.user.displayAvatarURL()
                });

              return interaction.reply({
                embeds: [mainEmbed],
                components: [questionButton]
              });
            } catch (error) {
              const BadSearch = new EmbedBuilder()
                .setTitle(`Search Error`)
                .setDescription(
                  `I was unable to find ${question}\nPlease provide a valid search query`
                )
                .setColor(colors.ERRORRED)
                .setFooter({
                  text: `JS: ${error}`,
                  iconURL: interaction.user.displayAvatarURL()
                });
              return interaction.reply({
                embeds: [BadSearch],
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
            const wiki = interaction.options.getString("query");

            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
              wiki
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
                const mainembed = new EmbedBuilder()
                  .setTitle(response.title)
                  .setThumbnail(
                    `https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/2244px-Wikipedia-logo-v2.svg.png`
                  )
                  .setDescription(
                    `${response.extract}\nLinks For Topic You Searched [Link](${response.content_urls.desktop.page}).`
                  )
                  .setColor(colors.DEFAULT)
                  .setURL(response.content_urls.desktop.page)
                  .setFooter({
                    text: `Requested by: ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                  });

                return interaction.reply({
                  embeds: [mainembed]
                });
                //One result
              } else {
                const otherembed = new EmbedBuilder()
                  .setTitle(response.title)
                  .setDescription(response.extract)
                  .setThumbnail(
                    `https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/2244px-Wikipedia-logo-v2.svg.png`
                  )
                  .setColor(colors.DEFAULT)
                  .setFooter({
                    text: `Requested by: ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL()
                  })
                  .setURL(response.content_urls.desktop.page);
                return interaction.reply({
                  embeds: [otherembed]
                });
              }
            } catch {
              const NotFound = new EmbedBuilder()
                .setTitle(`${emojis.ERROR} Invalid Query`)
                .setDescription(
                  `I can't find anything for \`${wiki}\`\nPlease provide a valid query.`
                )
                .setColor("e91e63")
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

            const worldClock = new EmbedBuilder()
              .setTitle("World Clock - Timezones")

              .addField(":flag_us: New York (EST)", `${est}\n(GMT-5)`, true)
              .addField(":flag_us: Los Angles (PST)", `${pst}\n(GMT-8)`, true)
              .addField(":flag_us: Mexico City (CST)", `${cst}\n(GMT-7)`, true)

              .addField(":flag_eu: London (GMT)", `${gmt}\n(GMT+0/GMT+1)`, true)
              .addField(":flag_eu: Central (CET)", `${cet}\n(GMT+1)`, true)
              .addField("\u200B", "\u200B", true)

              .addField(":flag_kr: Korean (KST)", `${kst}\n(GMT+9)`, true)
              .addField(":flag_in: India (IST)", `${ist}\n(GMT+05:30)`, true)
              .addField(":flag_bd: Bangladesh (BST)", `${bst} (GMT+6)`, true)

              .addField(":flag_au: Sydney (AEST)", `${aest}\n(GMT+11)`, true)
              .addField(":flag_au: Perth (AWST)", `${awst}\n(GMT+8)`, true)
              .addField("\u200B", "\u200B", true)
              .setColor("#e91e63")
              .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
              });

            await interaction.reply({
              embeds: [worldClock]
            });
          }
        }
      }
    });
  }
};
