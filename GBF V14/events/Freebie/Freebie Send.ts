import chalk from "chalk";
import GBFClient from "../../handler/clienthandler";
import { FreebieProfileModel } from "../../schemas/Freebie Schemas/Server Profile Schema";
import {
  OneGameEpicGamesButton,
  OneGameEpicGamesEmbed,
  TwoGamesEpicGamesButton,
  TwoGamesEpicGamesEmbed
} from "../../GBF/Freebies/Epic Games/Epic Games Messages";

import { ColorResolvable, TextBasedChannel } from "discord.js";
import { TipButtons, TipMessage } from "../../GBF/Freebies/Extras/Promotions";

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

    //Default

    for (let i = 0; i < DefaultFreebieServers.length; i++) {
      const CurrentServerData = DefaultFreebieServers[i];

      const FreebieServer = client.guilds.cache.get(CurrentServerData.guildId);

      if (!FreebieServer) continue;

      const FreebieChannel = FreebieServer.channels.cache.get(
        CurrentServerData.DefaultChannel
      ) as TextBasedChannel;

      if (!FreebieChannel) continue;

      TipMessage.setColor(CurrentServerData.EmbedColor as ColorResolvable);

      const EpicGamesEmbeds = {
        1: OneGameEpicGamesEmbed,
        2: TwoGamesEpicGamesEmbed
      };

      const EpicGamesButtons = {
        1: OneGameEpicGamesButton,
        2: TwoGamesEpicGamesButton
      };

      if (launcher === LauncherNames["Epic Games"]) {
        EpicGamesEmbeds[games].setColor(
          CurrentServerData.EmbedColor as ColorResolvable
        );

        await FreebieChannel.send({
          embeds: [EpicGamesEmbeds[games]],
          components: [EpicGamesButtons[games]]
        });

        await FreebieChannel.send({
          embeds: [TipMessage],
          components: [TipButtons]
        });
      }
    }
  });
}
