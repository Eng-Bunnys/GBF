import { redBright, whiteBright, underline } from "chalk";

import { textSync } from "figlet";

import { capitalize } from "../../utils/Engine";

import { Events } from "discord.js";
import GBFClient from "../../handler/clienthandler";

export default function botReady(client: GBFClient) {
  client.on(Events.ClientReady, async () => {
    const totalUsers = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0
    );

    client.user.setPresence({
      activities: [{ name: "GBF 2.5.0", type: 2 }],
      status: "online"
    });

    console.log(
      redBright(
        textSync(`${client.user.username}`, {
          horizontalLayout: "full"
        })
      )
    );

    console.log(
      redBright(
        underline(`${client.user.username} is now online! v${client.Version}`)
      )
    );

    console.log(
      whiteBright(
        `> Total app users: ${totalUsers.toLocaleString()}\n> Total Servers: ${client.guilds.cache.size.toLocaleString()}\n---------------------------------\n` +
          `> Discord Verified: ${
            client.user.verified ? "Yes" : "No"
          }\n---------------------------------` +
          `\n> Presence: ${capitalize(
            client.user.presence.status
          )}\n> Status: ${client.user.presence.activities[0].name}`
      )
    );

    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      console.log(
        "[ERROR] Unhandled Rejection at: Promise ",
        promise,
        " reason: ",
        reason.message
      );
    });
  });

  process.on("uncaughtException", (err: Error, origin: string) => {
    console.log(
      `Caught uncaughtException: ${err}\n` + `Exception origin: ${origin}`
    );
  });
}
