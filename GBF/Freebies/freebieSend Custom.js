const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  Permissions,
} = require("discord.js");

const { redBright, greenBright, underline, whiteBright } = require("chalk");

const titles = require("../../gbfembedmessages.json");
const emojis = require("../../GBFEmojis.json");
const colours = require("../../GBFColor.json");

const RegisterSchema = require("../../schemas/Freebie Schemas/Server Profile Schema");

const {
  tipEmbed,
  tipMessageButtons,
} = require("../../Freebie Settings/freebieTipMessages");
const {
  EpicGamesOneGameEmbed,
  EpicGamesTwoGamesEmbed,
  EpicGamesThreeGamesEmbed,
  EpicGamesOneGameButtons,
  EpicGamesTwoGamesButtons,
  EpicGamesThreeGamesButtons,
} = require("../../Freebie Settings/freebieEpicMessages");

const {
  SteamOneGameEmbed,
  SteamOneGameButton,
  SteamTwoGamesEmbed,
  SteamTwoGamesButton,
  SteamThreeGamesEmbed,
  SteamThreeGamesButton,
} = require("../../Freebie Settings/freebieSteamMessages");

const {
  oneGOGGame,
  twoGOGGames,
  threeGOGGames,
  oneGOGGameButton,
  twoGOGGamesButton,
  threeGOGGamesButton,
} = require("../../Freebie Settings/freebieGOGMessages");

const {
  onePRIMEGame,
  twoPRIMEGames,
  threePRIMEGames,
  onePRIMEameButton,
  twoPRIMEGamesButton,
  threePRIMEGamesButton,
} = require("../../Freebie Settings/freebiePrimeMessages");

const {
  oneORIGINGame,
  twoORIGINGames,
  threeORIGINGames,
  oneORIGINGameButton,
  twoORIGINGamesButton,
  threeORIGINGamesButton,
} = require("../../Freebie Settings/freebieOriginMessages");

const {
  oneUBISOFTGame,
  twoUBISOFTGames,
  threeUBISOFTGames,
  oneUBISOFTGameButton,
  twoUBISOFTGamesButton,
  threeUBISOFTGamesButton,
} = require("../../Freebie Settings/freebieUbisoftMessages");

const {
  EGSOneGame,
  EGSTwoGames,
  EGSThreeGames,
  STeamOneGame,
  STeamTwoGames,
  STeamThreeGames,
  GOGOneGame,
  GOGTwoGames,
  GOGThreeGames,
  PRIMEGamingOneGame,
  PRIMEGamingTwoGames,
  PRIMEGamingThreeGames,
  ORIGINOneGame,
  ORIGINTwoGames,
  ORIGINThreeGames,
  UBISOFTOneGame,
  UBISOFTTwoGames,
  UBISOFTThreeGames,
} = require("../../Freebie Settings/freebieEmitters");

const botInvite = `https://discord.com/api/oauth2/authorize?client_id=795361755223556116&permissions=1642788809975&scope=bot%20applications.commands`;
const topGG = `https://top.gg/bot/795361755223556116/vote`;
const serverInvite = `https://discord.gg/yrM7fhgNBW`;

const defaultTipTitle = `Enjoying GBF?`;
const defaultTipMessage = `If you are enjoying GBF's services and would like to support us you can do it for completely free! Vote for us on top.gg, you can [click here](${topGG}) to vote for us! Every vote really helps <:02lotsoflove:772489764154507294>`;
const defaultTipFooter = `If you have any questions or anything to say you can tell us in the support server: /invite`;

module.exports = (client) => {
  client.on("freebieSend", async (launcher, numberOfGames, member) => {
    const delay = async (ms = 1000) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const customRegisteredServers = await RegisterSchema.find({
      Enabled: true,
      useDefault: false,
    });

    if (customRegisteredServers.length <= 0)
      return console.log(redBright(`There are no custom Freebie Servers`));

    console.log(
      greenBright(
        underline(
          `Number of custom freebie servers: ${customRegisteredServers.length} || Sending ${numberOfGames} ${launcher} freebies`
        )
      )
    );

    let providerName;

    switch (launcher) {
      case "EPIC": {
        providerName = `Epic Games`;
        break;
      }
      case "STEAM": {
        providerName = `Steam`;
        break;
      }
      case "GOG": {
        providerName = `GOG`;
        break;
      }
      case "PRIME": {
        providerName = `Prime Gaming`;
        break;
      }
      case "ORIGIN": {
        providerName = `Origin/EA`;
        break;
      }
      case "UBI": {
        providerName = `Ubisoft`;
        break;
      }
      default: {
        providerName = ``;
        break;
      }
    }

    let customTipMessage;
    let embedTipTitle;
    let embedTipFooter;
    let mentionedRole;
    let freebieChannelType;
    let freebieRole;

    async function sendToCustom(
      channel,
      role,
      freebieEmbed,
      freebieButton,
      tipTitle,
      tipMessage,
      tipFooter,
      i
    ) {
      freebieEmbed.setColor(customRegisteredServers[i].embedColor);
      tipEmbed.setColor(customRegisteredServers[i].embedColor);

      channel
        .send({
          embeds: [freebieEmbed],
          components: [freebieButton],
        })

        .then(() => {
          if (
            customRegisteredServers[i].Ping === true &&
            customRegisteredServers[i].rolePing
          )
            channel.send({
              content: `${role}`,
            });
        });
    }

    async function sendCustom() {
      for (let i = 0; i < customRegisteredServers.length; i++) {
        const registeredServerFetch = await client.guilds.cache.get(
          customRegisteredServers[i].guildId
        );
        if (!registeredServerFetch)
          console.log(
            redBright(
              `${i + 1} : ${
                customRegisteredServers[i].guildId
              } couldn't be found`
            )
          );
        if (registeredServerFetch) {
          let customFreebieChannel;
          mentionedRole;

          switch (launcher) {
            case "EPIC":
              freebieChannelType = await client.channels.cache.get(
                customRegisteredServers[i].EGSChannel
              );
              freebieRole = await registeredServerFetch.roles.cache.get(
                customRegisteredServers[i].EGSPing
              );
              break;
            case "STEAM":
              freebieChannelType = await client.channels.cache.get(
                customRegisteredServers[i].SteamChannel
              );
              freebieRole = await registeredServerFetch.roles.cache.get(
                customRegisteredServers[i].SteamPing
              );
              break;
            default:
              freebieChannelType = await client.channels.cache.get(
                customRegisteredServers[i].OtherChannel
              );
              freebieRole = await registeredServerFetch.roles.cache.get(
                customRegisteredServers[i].OtherPing
              );
              break;
          }

          if (freebieChannelType) customFreebieChannel = freebieChannelType;
          else
            customFreebieChannel = await client.channels.cache.get(
              customRegisteredServers[i].Channel
            );

          if (freebieRole) mentionedRole = freebieRole;
          else
            mentionedRole = await registeredServerFetch.roles.cache.get(
              customRegisteredServers[i].rolePing
            );

          if (!mentionedRole)
            mentionedRole = `I could not find the specified role for the frebeie ping.`;
          if (
            customFreebieChannel &&
            customFreebieChannel.viewable &&
            customFreebieChannel
              .permissionsFor(registeredServerFetch.me)
              .has(Permissions.FLAGS.SEND_MESSAGES)
          ) {
            console.log(
              whiteBright(`${i + 1} : ${registeredServerFetch.name}`) +
                redBright(`  [${registeredServerFetch.memberCount} members]`)
            );

            const checkPremium =
              customRegisteredServers[i].Premium ||
              customRegisteredServers[i].Partner;

            const epicGamesSetting =
              customRegisteredServers[i].activeCategory === 1 ||
              customRegisteredServers[i].activeCategory === 0 ||
              customRegisteredServers[i].activeCategory === 3 ||
              customRegisteredServers[i].activeCategory === 7 ||
              customRegisteredServers[i].activeCategory === 5;
            const steamSetting =
              customRegisteredServers[i].activeCategory === 2 ||
              customRegisteredServers[i].activeCategory === 0 ||
              customRegisteredServers[i].activeCategory === 3 ||
              customRegisteredServers[i].activeCategory === 7 ||
              customRegisteredServers[i].activeCategory === 6;
            const otherSetting =
              customRegisteredServers[i].activeCategory === 4 ||
              customRegisteredServers[i].activeCategory === 0 ||
              customRegisteredServers[i].activeCategory === 7 ||
              customRegisteredServers[i].activeCategory === 6;

            if (checkPremium && customRegisteredServers[i].tipMessage)
              customTipMessage = customRegisteredServers[i].tipMessage;
            else customTipMessage = defaultTipMessage;

            if (checkPremium && customRegisteredServers[i].tipTitle)
              embedTipTitle = customRegisteredServers[i].tipTitle;
            else embedTipTitle = defaultTipTitle;

            if (checkPremium && customRegisteredServers[i].tipFooter)
              embedTipFooter = customRegisteredServers[i].tipFooter;
            else embedTipFooter = defaultTipFooter;

            if (
              EGSOneGame(launcher, numberOfGames) === true &&
              epicGamesSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                EpicGamesOneGameEmbed,
                EpicGamesOneGameButtons,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              EGSTwoGames(launcher, numberOfGames) === true &&
              epicGamesSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                EpicGamesTwoGamesEmbed,
                EpicGamesTwoGamesButtons,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              EGSThreeGames(launcher, numberOfGames) === true &&
              epicGamesSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                EpicGamesThreeGamesEmbed,
                EpicGamesThreeGamesButtons,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              STeamOneGame(launcher, numberOfGames) === true &&
              steamSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                SteamOneGameEmbed,
                SteamOneGameButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }
            if (
              STeamTwoGames(launcher, numberOfGames) === true &&
              steamSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                SteamTwoGamesEmbed,
                SteamTwoGamesButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              STeamThreeGames(launcher, numberOfGames) === true &&
              steamSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                SteamThreeGamesEmbed,
                SteamThreeGamesButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              GOGOneGame(launcher, numberOfGames) === true &&
              otherSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                oneGOGGame,
                oneGOGGameButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              GOGTwoGames(launcher, numberOfGames) === true &&
              otherSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                twoGOGGames,
                twoGOGGamesButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              GOGThreeGames(launcher, numberOfGames) === true &&
              otherSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                threeGOGGames,
                threeGOGGamesButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              PRIMEGamingOneGame(launcher, numberOfGames) === true &&
              otherSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                onePRIMEGame,
                onePRIMEameButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              PRIMEGamingTwoGames(launcher, numberOfGames) === true &&
              otherSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                twoPRIMEGames,
                twoPRIMEGamesButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              PRIMEGamingThreeGames(launcher, numberOfGames) === true &&
              otherSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                threePRIMEGames,
                threePRIMEGamesButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              ORIGINOneGame(launcher, numberOfGames) === true &&
              otherSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                oneORIGINGame,
                oneORIGINGameButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              ORIGINTwoGames(launcher, numberOfGames) === true &&
              otherSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                twoORIGINGames,
                twoORIGINGamesButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              ORIGINThreeGames(launcher, numberOfGames) === true &&
              otherSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                threeORIGINGames,
                threeORIGINGamesButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              UBISOFTOneGame(launcher, numberOfGames) === true &&
              otherSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                oneUBISOFTGame,
                oneUBISOFTGameButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              UBISOFTTwoGames(launcher, numberOfGames) === true &&
              otherSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                twoUBISOFTGames,
                twoUBISOFTGamesButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            if (
              UBISOFTThreeGames(launcher, numberOfGames) === true &&
              otherSetting === true
            ) {
              sendToCustom(
                customFreebieChannel,
                mentionedRole,
                threeUBISOFTGames,
                threeUBISOFTGamesButton,
                embedTipTitle,
                customTipMessage,
                embedTipFooter,
                i
              );
            }

            await delay(1500);
          }
        }
      }
    }

    sendCustom();
  });
};
