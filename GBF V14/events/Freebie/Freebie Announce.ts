import { Role, TextBasedChannel } from "discord.js";

import chalk from "chalk";

import { FreebieProfileModel } from "../../schemas/Freebie Schemas/Server Profile Schema";

import GBFClient from "../../handler/clienthandler";
import { getRole } from "../../utils/Engine";

export default function freebieAnnouncement(client: GBFClient) {
  client.on(
    "freebieAnnouncement",
    async (message: string, mention: boolean) => {
      const FreebieServers = await FreebieProfileModel.find({
        Enabled: true
      });

      if (FreebieServers.length <= 0)
        return console.log(chalk.redBright(`There are no Freebie Servers`));

      let ServerCount = 0;

      const AnnouncePromises = [];

      for (let i = 0; i < FreebieServers.length; i++) {
        const CurrentIteration = FreebieServers[i];

        const FreebieServer = client.guilds.cache.get(CurrentIteration.guildId);

        if (!FreebieServer) continue;

        const FreebieChannel = FreebieServer.channels.cache.get(
          CurrentIteration.DefaultChannel
        ) as TextBasedChannel;

        if (!FreebieChannel) continue;

        ServerCount++;

        const FreebieRole = getRole(
          FreebieServer,
          CurrentIteration.DefaultRole
        );

        let AnnouncementMessage = `${message}`;

        if (CurrentIteration.DefaultMention && FreebieRole && mention)
          AnnouncementMessage += `\n${FreebieRole}`;

        AnnouncePromises.push(
          FreebieChannel.send({
            content: `${AnnouncementMessage}`
          })
        );
      }

      await Promise.all(AnnouncePromises);
      if (ServerCount > 0)
        console.log(
          chalk.magentaBright(
            `Sending announcement message tp ${ServerCount.toLocaleString()} servers`
          )
        );
    }
  );
}
