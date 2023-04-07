const {
  MessageEmbed,
  Permissions,
  MessageButton,
  MessageActionRow,
  MessageAttachment
} = require("discord.js");
const SlashCommand = require("../../utils/slashCommands");

const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");
const title = require("../../gbfembedmessages.json");

const { createCanvas, loadImage } = require("canvas");

const axios = require("axios");

module.exports = class DeveloperTestingCommand extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "dev",
      category: "Dev",
      description: "Command that's currently in development",
      usage: "",
      examples: "",

      options: [
        {
          name: "user",
          description: "user",
          type: "USER",
          required: false
        },
        {
          name: "user-2",
          description: "user-2",
          type: "USER"
        }
      ],

      devOnly: true,
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: false,
      Partner: false
    });
  }

  async execute({ client, interaction }) {
    if (interaction.user.id !== "333644367539470337")
      return interaction.reply({
        content: `This is a closed beta command, that means that it is still under development. (That just means you can't use it yet <:frogSmile:972806676963033139>)`
      });

    console.log(`${interaction.user.tag} used the command`);
    return interaction.channel.send({
      content: `Test`
    });
    // const user = interaction.options.getUser("user") || interaction.user;
    // const url = `https://discord.com/api/users/${user.id}`;

    // await axios
    //   .get(url, {
    //     headers: {
    //       Authorization: `Bot ${client.token}`
    //     }
    //   })
    //   .then(async (res) => {
    //     const { banner, accent_color } = res.data;
    //     console.log(res.data);
    //     if (banner) {
    //       console.log(`${user.username} has a banner`);
    //       const extension = banner.startsWith("a_") ? "gif" : "png";
    //       const url = `https://cdn.discordapp.com/banners/${user.id}/${banner}.${extension}?size=4096`;
    //       await interaction.channel.send({
    //         content: `${url}`
    //       });
    //     }
    //   });
  }
};
