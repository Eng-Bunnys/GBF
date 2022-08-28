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

    const defaultRegisteredServers = await RegisterSchema.find({
      Enabled: true,
      useDefault: true,
    });

    if (defaultRegisteredServers.length <= 0)
      return console.log(redBright(`There are no default Freebie Servers`));

    console.log(
      greenBright(
        underline(
          `Number of default freebie servers: ${defaultRegisteredServers.length} || Sending ${numberOfGames} ${launcher} freebies`
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

    async function sendToDefault(
      channel,
      role,
      freebieEmbed,
      freebieButton,
      tipTitle,
      tipMessage,
      tipFooter,
      i
    ) {
      freebieEmbed.setColor(colours.DEFAULT);
      freebieEmbed.setFooter({
        text: `${providerName} Freebies powered by GBF, sent by ${member.username} [Default Settings]`,
      });
      tipEmbed.setColor(colours.DEFAULT);

      channel
        .send({
          embeds: [freebieEmbed],
          components: [freebieButton],
        })

        .then(() => {
          if (
            defaultRegisteredServers[i].Ping === true &&
            defaultRegisteredServers[i].rolePing
          )
            channel.send({
              content: `${role}`,
            });
        });
    }

    async function sendDefault() {
      for (let i = 0; i < defaultRegisteredServers.length; i++) {
        const registeredServerFetch = await client.guilds.fetch(
          defaultRegisteredServers[i].guildId
        );

        if (registeredServerFetch) {
          const customFreebieChannel = await client.channels.fetch(
            defaultRegisteredServers[i].Channel
          );

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

            const epicGamesSetting =
              defaultRegisteredServers[i].activeCategory === 1 ||
              defaultRegisteredServers[i].activeCategory === 0 ||
              defaultRegisteredServers[i].activeCategory === 3 ||
              defaultRegisteredServers[i].activeCategory === 7 ||
              defaultRegisteredServers[i].activeCategory === 5;
            const steamSetting =
              defaultRegisteredServers[i].activeCategory === 2 ||
              defaultRegisteredServers[i].activeCategory === 0 ||
              defaultRegisteredServers[i].activeCategory === 3 ||
              defaultRegisteredServers[i].activeCategory === 7 ||
              defaultRegisteredServers[i].activeCategory === 6;
            const otherSetting =
              defaultRegisteredServers[i].activeCategory === 4 ||
              defaultRegisteredServers[i].activeCategory === 0 ||
              defaultRegisteredServers[i].activeCategory === 7 ||
              defaultRegisteredServers[i].activeCategory === 6;

            customTipMessage = defaultTipMessage;

            embedTipTitle = defaultTipTitle;

            embedTipFooter = defaultTipFooter;

            if (defaultRegisteredServers[i].Ping) {
              mentionedRole = await registeredServerFetch.roles.cache.get(
                defaultRegisteredServers[i].rolePing
              );

              if (!mentionedRole)
                mentionedRole = `The \`freebie ping role\` is no longer available, please update using \`/freebie update\``;
            }
            if (
              EGSOneGame(launcher, numberOfGames) === true &&
              epicGamesSetting === true
            ) {
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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
              sendToDefault(
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

    sendDefault();
  });
};
