import chalk from "chalk";
import GBFClient from "../../handler/clienthandler";
import { FreebieProfileModel } from "../../schemas/Freebie Schemas/Server Profile Schema";
import {
  OneGameEpicGamesButton,
  OneGameEpicGamesEmbed,
  ThreeGamesEpicGamesButton,
  ThreeGamesEpicGamesEmbed,
  TwoGamesEpicGamesButton,
  TwoGamesEpicGamesEmbed
} from "../../GBF/Freebies/Epic Games/Epic Games Messages";

import {
  ColorResolvable,
  Guild,
  Role,
  TextBasedChannel,
  hyperlink
} from "discord.js";
import { TipButtons, TipMessage } from "../../GBF/Freebies/Extras/Promotions";

import {
  SteamOneGameButton,
  SteamOneGameEmbed,
  SteamThreeGamesButton,
  SteamThreeGamesEmbed,
  SteamTwoGamesButton,
  SteamTwoGamesEmbed
} from "../../GBF/Freebies/Steam/Steam Messages";
import {
  GOGOneGameButton,
  GOGOneGameEmbed,
  GOGThreeGamesButton,
  GOGThreeGamesEmbed,
  GOGTwoGamesButton,
  GOGTwoGamesEmbed
} from "../../GBF/Freebies/GOG/GOG Messages";
import {
  OriginOneGameButton,
  OriginOneGameEmbed,
  OriginThreeGamesButton,
  OriginThreeGamesEmbed,
  OriginTwoGamesButton,
  OriginTwoGamesEmbed
} from "../../GBF/Freebies/Origin/Origin Messages";
import {
  UbisoftOneGameButton,
  UbisoftOneGameEmbed,
  UbisoftThreeGamesButton,
  UbisoftThreeGamesEmbed,
  UbisoftTwoGamesButton,
  UbisoftTwoGamesEmbed
} from "../../GBF/Freebies/Ubisoft/Ubisoft Messages";
import { getRole } from "../../utils/Engine";

enum LauncherNames {
  "Epic Games" = "Epic Games",
  "Steam" = "Steam",
  "GOG" = "GOG",
  "Prime" = "Prime Gaming",
  "Ubisoft" = "Ubisoft",
  "EA" = "EA"
}

export default function SendFreebie(client: GBFClient) {
  client.on("FreebieSend", async (launcher: string, games: number) => {
    const DefaultFreebieServers = await FreebieProfileModel.find({
      Enabled: true,
      UseDefault: true
    });

    const CustomFreebieServers = await FreebieProfileModel.find({
      Enabled: true,
      UseDefault: false
    });

    if (DefaultFreebieServers.length == 0 || !DefaultFreebieServers)
      console.log(chalk.redBright("There are no default servers"));
    else
      console.log(
        chalk.cyanBright(
          `Attempting to send ${launcher} Freebies to ${DefaultFreebieServers.length.toLocaleString()} default servers`
        )
      );

    if (!CustomFreebieServers || CustomFreebieServers.length == 0)
      console.log(chalk.redBright("There are no custom servers"));
    else
      console.log(
        chalk.cyanBright(
          `Attempting to send ${launcher} Freebies to ${CustomFreebieServers.length.toLocaleString()} custom servers`
        )
      );

    const EpicGamesEmbeds = {
      1: OneGameEpicGamesEmbed,
      2: TwoGamesEpicGamesEmbed,
      3: ThreeGamesEpicGamesEmbed
    };

    const EpicGamesButtons = {
      1: OneGameEpicGamesButton,
      2: TwoGamesEpicGamesButton,
      3: ThreeGamesEpicGamesButton
    };

    const SteamEmbeds = {
      1: SteamOneGameEmbed,
      2: SteamTwoGamesEmbed,
      3: SteamThreeGamesEmbed
    };

    const SteamButtons = {
      1: SteamOneGameButton,
      2: SteamTwoGamesButton,
      3: SteamThreeGamesButton
    };

    const GOGEmbeds = {
      1: GOGOneGameEmbed,
      2: GOGTwoGamesEmbed,
      3: GOGThreeGamesEmbed
    };

    const GOGButtons = {
      1: GOGOneGameButton,
      2: GOGTwoGamesButton,
      3: GOGThreeGamesButton
    };

    const EAEmbeds = {
      1: OriginOneGameEmbed,
      2: OriginTwoGamesEmbed,
      3: OriginThreeGamesEmbed
    };

    const EAButtons = {
      1: OriginOneGameButton,
      2: OriginTwoGamesButton,
      3: OriginThreeGamesButton
    };

    const UbisfotEmbeds = {
      1: UbisoftOneGameEmbed,
      2: UbisoftTwoGamesEmbed,
      3: UbisoftThreeGamesEmbed
    };

    const UbisoftButtons = {
      1: UbisoftOneGameButton,
      2: UbisoftTwoGamesButton,
      3: UbisoftThreeGamesButton
    };

    function MentionRole(
      Enabled: boolean,
      Server: Guild,
      RoleID: string
    ): [boolean, Role?] {
      if (!Enabled) return [false, null];

      const MentionedRole = getRole(Server, RoleID);

      if (!MentionRole) return [false, null];
      else return [true, MentionedRole];
    }

    //Default

    const DefaultPromises = [];
    let DefaultServers = 0;

    for (let i = 0; i < DefaultFreebieServers.length; i++) {
      const CurrentServerData = DefaultFreebieServers[i];

      const FreebieServer = client.guilds.cache.get(CurrentServerData.guildId);

      if (!FreebieServer) continue;

      const FreebieChannel = FreebieServer.channels.cache.get(
        CurrentServerData.DefaultChannel
      ) as TextBasedChannel;

      if (!FreebieChannel) continue;

      DefaultServers++;

      TipMessage.setColor(CurrentServerData.EmbedColor as ColorResolvable);

      const DefaultMentionMessage = MentionRole(
        CurrentServerData.DefaultMention,
        FreebieServer,
        CurrentServerData.DefaultRole
      );

      if (launcher === LauncherNames["Epic Games"]) {
        EpicGamesEmbeds[games].setColor(
          CurrentServerData.EmbedColor as ColorResolvable
        );

        DefaultPromises.push(
          FreebieChannel.send({
            embeds: [EpicGamesEmbeds[games]],
            components: [EpicGamesButtons[games]]
          })
        );

        DefaultPromises.push(
          FreebieChannel.send({
            embeds: [TipMessage],
            components: [TipButtons]
          })
        );

        if (DefaultMentionMessage[0]) {
          DefaultPromises.push(
            FreebieChannel.send({
              content: `${DefaultMentionMessage[1]}`
            })
          );
        }
      }

      if (launcher === LauncherNames.Steam) {
        SteamEmbeds[games].setColor(
          CurrentServerData.EmbedColor as ColorResolvable
        );

        DefaultPromises.push(
          FreebieChannel.send({
            embeds: [SteamEmbeds[games]],
            components: [SteamButtons[games]]
          })
        );

        DefaultPromises.push(
          FreebieChannel.send({
            embeds: [TipMessage],
            components: [TipButtons]
          })
        );

        if (DefaultMentionMessage[0]) {
          DefaultPromises.push(
            FreebieChannel.send({
              content: `${DefaultMentionMessage[1]}`
            })
          );
        }
      }

      if (launcher === LauncherNames.GOG) {
        GOGEmbeds[games].setColor(
          CurrentServerData.EmbedColor as ColorResolvable
        );

        DefaultPromises.push(
          FreebieChannel.send({
            embeds: [GOGEmbeds[games]],
            components: [GOGButtons[games]]
          })
        );

        DefaultPromises.push(
          FreebieChannel.send({
            embeds: [TipMessage],
            components: [TipButtons]
          })
        );

        if (DefaultMentionMessage[0]) {
          DefaultPromises.push(
            FreebieChannel.send({
              content: `${DefaultMentionMessage[1]}`
            })
          );
        }
      }

      if (launcher === LauncherNames.EA) {
        EAEmbeds[games].setColor(
          CurrentServerData.EmbedColor as ColorResolvable
        );

        DefaultPromises.push(
          FreebieChannel.send({
            embeds: [EAEmbeds[games]],
            components: [EAButtons[games]]
          })
        );

        DefaultPromises.push(
          FreebieChannel.send({
            embeds: [TipMessage],
            components: [TipButtons]
          })
        );

        if (DefaultMentionMessage[0]) {
          DefaultPromises.push(
            FreebieChannel.send({
              content: `${DefaultMentionMessage[1]}`
            })
          );
        }
      }

      if (launcher === LauncherNames.Ubisoft) {
        UbisfotEmbeds[games].setColor(
          CurrentServerData.EmbedColor as ColorResolvable
        );

        DefaultPromises.push(
          FreebieChannel.send({
            embeds: [UbisfotEmbeds[games]],
            components: [UbisoftButtons[games]]
          })
        );

        DefaultPromises.push(
          FreebieChannel.send({
            embeds: [TipMessage],
            components: [TipButtons]
          })
        );

        if (DefaultMentionMessage[0]) {
          DefaultPromises.push(
            FreebieChannel.send({
              content: `${DefaultMentionMessage[1]}`
            })
          );
        }
      }
    }

    await Promise.all(DefaultPromises);
    if (DefaultServers > 0)
      console.log(
        chalk.greenBright(
          `Sent ${launcher} Freebies to ${DefaultServers.toLocaleString()} default servers`
        )
      );

    // Custom

    let CustomServers = 0;
    const CustomPromises = [];

    for (let j = 0; j < CustomFreebieServers.length; j++) {
      const CurrentServerData = CustomFreebieServers[j];

      const FreebieServer = client.guilds.cache.get(CurrentServerData.guildId);

      if (!FreebieServer) continue;

      let FreebieChannel: TextBasedChannel;

      TipMessage.setColor(CurrentServerData.EmbedColor as ColorResolvable);

      if (launcher === LauncherNames["Epic Games"]) {
        if (!CurrentServerData.EGSEnabled) continue;

        FreebieChannel = FreebieServer.channels.cache.get(
          CurrentServerData.EGSChannel
        ) as TextBasedChannel;

        if (!FreebieChannel)
          FreebieChannel = FreebieServer.channels.cache.get(
            CurrentServerData.DefaultChannel
          ) as TextBasedChannel;

        if (!FreebieChannel) continue;

        CustomServers++;

        const MentionedRoleMessage = MentionRole(
          CurrentServerData.EGSMention,
          FreebieServer,
          CurrentServerData.EGSRole
        );

        EpicGamesEmbeds[games].setColor(
          CurrentServerData.EmbedColor as ColorResolvable
        );

        CustomPromises.push(
          FreebieChannel.send({
            embeds: [EpicGamesEmbeds[games]],
            components: [EpicGamesButtons[games]]
          })
        );

        CustomPromises.push(
          FreebieChannel.send({
            embeds: [TipMessage],
            components: [TipButtons]
          })
        );

        if (MentionedRoleMessage[0]) {
          CustomPromises.push(
            FreebieChannel.send({
              content: `${MentionedRoleMessage[1]}`
            })
          );
        }
      }

      if (launcher === LauncherNames.Steam) {
        if (!CurrentServerData.SteamEnabled) continue;

        FreebieChannel = FreebieServer.channels.cache.get(
          CurrentServerData.SteamChannel
        ) as TextBasedChannel;

        if (!FreebieChannel)
          FreebieChannel = FreebieServer.channels.cache.get(
            CurrentServerData.DefaultChannel
          ) as TextBasedChannel;

        if (!FreebieChannel) continue;

        CustomServers++;

        const MentionedRoleMessage = MentionRole(
          CurrentServerData.SteamMention,
          FreebieServer,
          CurrentServerData.SteamRole
        );

        SteamEmbeds[games].setColor(
          CurrentServerData.EmbedColor as ColorResolvable
        );

        CustomPromises.push(
          FreebieChannel.send({
            embeds: [SteamEmbeds[games]],
            components: [SteamButtons[games]]
          })
        );

        CustomPromises.push(
          FreebieChannel.send({
            embeds: [TipMessage],
            components: [TipButtons]
          })
        );

        if (MentionedRoleMessage[0]) {
          CustomPromises.push(
            FreebieChannel.send({
              content: `${MentionedRoleMessage[1]}`
            })
          );
        }
      }

      if (
        launcher === LauncherNames.GOG ||
        launcher === LauncherNames.EA ||
        launcher === LauncherNames.Ubisoft
      ) {
        if (!CurrentServerData.OtherEnabled) continue;

        FreebieChannel = FreebieServer.channels.cache.get(
          CurrentServerData.OtherChannel
        ) as TextBasedChannel;

        if (!FreebieChannel)
          FreebieChannel = FreebieServer.channels.cache.get(
            CurrentServerData.DefaultChannel
          ) as TextBasedChannel;

        if (!FreebieChannel) continue;

        CustomServers++;

        const MentionedRoleMessage = MentionRole(
          CurrentServerData.OtherMention,
          FreebieServer,
          CurrentServerData.OtherRole
        );

        if (launcher === LauncherNames.GOG) {
          GOGEmbeds[games].setColor(
            CurrentServerData.EmbedColor as ColorResolvable
          );

          CustomPromises.push(
            FreebieChannel.send({
              embeds: [GOGEmbeds[games]],
              components: [GOGButtons[games]]
            })
          );

          CustomPromises.push(
            FreebieChannel.send({
              embeds: [TipMessage],
              components: [TipButtons]
            })
          );

          if (MentionedRoleMessage[0]) {
            CustomPromises.push(
              FreebieChannel.send({
                content: `${MentionedRoleMessage[1]}`
              })
            );
          }
        }

        if (launcher === LauncherNames.Ubisoft) {
          UbisfotEmbeds[games].setColor(
            CurrentServerData.EmbedColor as ColorResolvable
          );

          CustomPromises.push(
            FreebieChannel.send({
              embeds: [UbisfotEmbeds[games]],
              components: [UbisoftButtons[games]]
            })
          );

          CustomPromises.push(
            FreebieChannel.send({
              embeds: [TipMessage],
              components: [TipButtons]
            })
          );

          if (MentionedRoleMessage[0]) {
            CustomPromises.push(
              FreebieChannel.send({
                content: `${MentionedRoleMessage[1]}`
              })
            );
          }
        }

        if (launcher === LauncherNames.EA) {
          EAEmbeds[games].setColor(
            CurrentServerData.EmbedColor as ColorResolvable
          );

          CustomPromises.push(
            FreebieChannel.send({
              embeds: [EAEmbeds[games]],
              components: [EAButtons[games]]
            })
          );

          CustomPromises.push(
            FreebieChannel.send({
              embeds: [TipMessage],
              components: [TipButtons]
            })
          );

          if (MentionedRoleMessage[0]) {
            CustomPromises.push(
              FreebieChannel.send({
                content: `${MentionedRoleMessage[1]}`
              })
            );
          }
        }
      }
    }

    await Promise.all(CustomPromises);
    if (CustomServers > 0)
      console.log(
        chalk.greenBright(
          `Sent ${launcher} Freebies to ${CustomServers.toLocaleString()} custom servers`
        )
      );
  });
}
