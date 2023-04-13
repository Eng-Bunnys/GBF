const SlashCommand = require("../../utils/slashCommands");

const emojis = require("../../GBF/GBFEmojis.json");
const colours = require("../../GBF/GBFColor.json");

const fetch = require("node-fetch");

const { EmbedBuilder } = require("discord.js");

module.exports = class AnimalSlash extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "animals",
      description: "Get pictures of cute animals!",
      category: "Animals",
      botPermission: [],
      cooldown: 5,
      development: false,
      subcommands: {
        bird: {
          description: "Shows a picture of a bird 🐦",
          execute: async ({ client, interaction }) => {
            const NP1ErrorEmbed = new EmbedBuilder()
              .setTitle(`${emojis.ERROR} NP1 Error `)
              .setDescription(
                `Please run \`/error np1\` to know more about the error and how to fix it`
              )
              .setColor(colours.ERRORRED)
              .setTimestamp();

            const res = await fetch("http://shibe.online/api/birds");
            const img = (await res.json())[0];
            const birdembed = new EmbedBuilder()
              .setTitle("Chip chirp 🐦")
              .setImage(img)
              .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
              })
              .setTimestamp()
              .setColor(colours.DEFAULT);
            return interaction
              .reply({
                embeds: [birdembed]
              })
              .catch((err) => {
                console.log(`Bird Command Error: ${err.message}`);
                return interaction.reply({
                  embeds: [NP1ErrorEmbed]
                });
              });
          }
        },
        dog: {
          description: "Shows a picture of a doggo 🐶",
          execute: async ({ client, interaction }) => {
            const res = await fetch("https://dog.ceo/api/breeds/image/random");
            const img = (await res.json()).message;
            const dogembed = new EmbedBuilder()
              .setTitle("What the dog doin! 🐶")
              .setImage(img)
              .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
              })
              .setTimestamp()
              .setColor(colours.DEFAULT);

            return interaction.reply({
              embeds: [dogembed]
            });
          }
        },
        duck: {
          description: "Shows a picture of a duck 🦆",
          execute: async ({ client, interaction }) => {
            const res = await fetch("https://random-d.uk/api/v2/random");
            const img = (await res.json()).url;

            const duckembed = new EmbedBuilder()
              .setTitle("Quack! 🦆")
              .setImage(img)
              .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
              })
              .setTimestamp()
              .setColor(colours.DEFAULT);
            return interaction.reply({
              embeds: [duckembed]
            });
          }
        },
        fox: {
          description: "Shows a picture of a fox 🦊",
          execute: async ({ client, interaction }) => {
            const res = await fetch("https://randomfox.ca/floof/");
            const img = (await res.json()).image;
            const foxembed = new EmbedBuilder()
              .setTitle("Fox! 🦊")
              .setImage(img)
              .setFooter({
                text: `Requested by: ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
              })
              .setTimestamp()
              .setColor(colours.DEFAULT);

            return interaction.reply({
              embeds: [foxembed]
            });
          }
        }
      }
    });
  }
};
