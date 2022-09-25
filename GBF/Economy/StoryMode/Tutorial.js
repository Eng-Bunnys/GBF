const SlashCommand = require("../../../utils/slashCommands");

const colours = require("../../../GBFColor.json");
const emojis = require("../../../GBFEmojis.json");
const title = require("../../../gbfembedmessages.json");

const userSchema = require("../../../schemas/Economy Schemas/User Profile Schema");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

const { delay } = require("../../../utils/engine");

module.exports = class DunkelTutorial extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "tutorial",
      category: "Economy",
      description: "DunkelLuz tutorial",
      usage: "/tutorial",
      examples: "/tutorial",

      options: [
        {
          name: "character-name",
          description:
            "This will be your Dunkelluz character name, different from account name",
          type: "STRING",
          minLength: 4,
          maxLength: 20,
          required: true
        }
      ],

      devOnly: true,
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: true,
      Partner: false
    });
  }

  async execute({ client, interaction }) {
    const userData = await userSchema.findOne({
      userId: interaction.user.id
    });

    const accountRequired = new MessageEmbed()
      .setTitle(`${emojis.ERROR} Not yet!`)
      .setColor(colours.ERRORRED)
      .setDescription(
        `A DunkelLuz account is required to use this feature, you can create one for free using \`/account login\` or transfer an existing account to this Discord account using the same command.`
      )
      .setFooter({
        text: `This system is in place to help protect your progress in-case you lost your Discord account or moved to a new one`
      })
      .setTimestamp();

    if (!userData)
      return interaction.reply({
        embeds: [accountRequired],
        ephemeral: true
      });

    const alreadyComplete = new MessageEmbed()
      .setTitle(`${emojis.ERROR} You can't use this`)
      .setDescription(`You've already completed the DunkelLuz tutorial`)
      .setColor(colours.ERRORRED);

    if (userData.introComplete)
      return interaction.reply({
        embeds: [alreadyComplete],
        ephemeral: true
      });

    const characterName = interaction.options.getString("character-name");

    function userNameCheck(username) {
      const nWordCheck = /nigg/gi;
      const rWordCheck = /re[a-zA-Z]ard/gi;
      const fWordCheck = /[a-zA-Z]a[a-zA-Z]got/gi;

      if (
        nWordCheck.test(username) ||
        rWordCheck.test(username) ||
        fWordCheck.test(username)
      )
        return true;
      else return false;
    }

    const badUsername = new MessageEmbed()
      .setTitle(`${emojis.ERROR} You can't do that`)
      .setDescription(
        `The character name entered has been flagged by our system as inappropriate, please choose another name.`
      )
      .setColor(colours.ERRORRED)
      .setFooter({
        text: `GBF Security and safety | If you think this is a mistake please contact support`
      })
      .setTimestamp();

    if (userNameCheck(characterName))
      return interaction.reply({
        embeds: [badUsername],
        ephemeral: true
      });

    const confirmName = new MessageEmbed()
      .setTitle(`Before we land ✈️`)
      .setDescription(
        `You **cannot** change your character name after the tutorial, are you sure you want "${characterName}" to be your character's name?`
      )
      .setColor(colours.DEFAULT)
      .setTimestamp();

    const confirmDenyButtons = new MessageActionRow().addComponents([
      new MessageButton()
        .setCustomId("confirmName")
        .setLabel("Confirm")
        .setEmoji(emojis.VERIFY)
        .setStyle("SUCCESS"),
      new MessageButton()
        .setCustomId("denyName")
        .setLabel("Deny")
        .setEmoji(emojis.ERROR)
        .setStyle("DANGER")
    ]);

    const confirmDenyButtonsD = new MessageActionRow().addComponents([
      new MessageButton()
        .setCustomId("confirmNameD")
        .setLabel("Confirm")
        .setDisabled(true)
        .setEmoji(emojis.VERIFY)
        .setStyle("SUCCESS"),
      new MessageButton()
        .setCustomId("denyNameD")
        .setLabel("Deny")
        .setDisabled(true)
        .setEmoji(emojis.ERROR)
        .setStyle("DANGER")
    ]);

    await interaction.reply({
      embeds: [confirmName],
      components: [confirmDenyButtons],
      ephemeral: true
    });

    const filter = (i) => {
      return i.user.id === interaction.user.id;
    };

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 300000
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();
      await delay(750);

      const deniedChange = new MessageEmbed()
        .setTitle(`${emojis.ERROR} Mission Failed`)
        .setDescription(`${userData.userName} left`)
        .setColor(colours.ERRORRED);

      if (i.customId === "confirmName") {
        const welcomeMessage = new MessageEmbed()
          .setTitle(
            `Welcome ${characterName} to DunkelLuz, the city of Saints and Sinners`
          )
          .setColor(colours.DEFAULT)
          .setDescription(
            `Arman Aventis: “So you finally decided to visit us old friend, how’s Serbia? Or actually just ignore it I know it’s gone to shit after the war… well, let me introduce you to DunkelLuz! This is the city of dreams my friend, we’re here to get big, I’ll show you the wonders and beauty of this city”`
          )
          .addFields(
            {
              name: "Casino",
              value: `${characterName}: “Of course you’d take me to a Casino first thing”\nArman Aventis: “This is where I spend most of my time, you sit on a comfy chair with many beautiful women around you while you win the big bucks, super exciting, you can spin the big wheel in the middle once every day for free and win crazy prizes or play any of the casino games over there at the table”`
            },
            {
              name: "Vehicles & Weapons",
              value: `Arman Aventis: “DunkelLuz is a beautiful city, there’s a car dealership not too far, you can get yourself a nice car to cruise around or of course “repossess” one but you’ll need to meet a good friend of mine for that first, call me anytime and I’ll set you up, then you can get weapons, which you’ll most likely need, I’ll also hook you up just hit me up”`
            },
            {
              name: "First Mission Intro",
              value: `Arman Aventis: So look, you’re a tough guy who can handle a lot, I heard about the war stories and you Mr. Hero, you can handle some pressure, I know some mean looking motherfu*kers who are willing to do anything for a quick buck, they’ll take 70% and the 30% will be enough for you to enjoy too, I know it's not much but they have to trust you first, I’ll give you the details later, now I show you the rest of this shit hole”`
            },
            {
              name: "\u200b",
              value: `Arman Aventis: BUT I MISSED YOU OLD FRIEND I THOUGHT I’D NEVER SEE YOU AGAIN HAHAHA LETS GO OUT, DRINKS ON ME...\n\nI say that because I know you'll only drink 2`
            }
          )
          .setTimestamp();

        const missionDetails = {
          missionName: "Tutorial",
          userSetCharacterName: characterName
        };

        await client.emit(
          "dunkelMissionPassed",
          interaction,
          interaction.user,
          missionDetails
        );

        return interaction.editReply({
          embeds: [welcomeMessage],
          components: []
        });
      }
      if (i.customId === "denyName") {
        await collector.stop();
        return interaction.editReply({
          components: [confirmDenyButtonsD],
          embeds: [deniedChange]
        });
      }
    });
  }
};
