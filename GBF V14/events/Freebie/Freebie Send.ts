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

import { ColorResolvable, TextBasedChannel } from "discord.js";
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
        chalk.greenBright(
          `There are ${DefaultFreebieServers.length.toLocaleString()} default servers`
        )
      );

    if (!CustomFreebieServers || CustomFreebieServers.length == 0)
      console.log(chalk.redBright("There are no custom servers"));
    else
      console.log(
        chalk.greenBright(
          `There are ${CustomFreebieServers.length.toLocaleString()} custom servers`
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

    //Default

    const DefaultPromises = [];

    for (let i = 0; i < DefaultFreebieServers.length; i++) {
      const CurrentServerData = DefaultFreebieServers[i];

      const FreebieServer = client.guilds.cache.get(CurrentServerData.guildId);

      if (!FreebieServer) continue;

      const FreebieChannel = FreebieServer.channels.cache.get(
        CurrentServerData.DefaultChannel
      ) as TextBasedChannel;

      if (!FreebieChannel) continue;

      TipMessage.setColor(CurrentServerData.EmbedColor as ColorResolvable);

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
      }
    }

    await Promise.all(DefaultPromises);
  });
}
