import chalk, { redBright, whiteBright, underline } from "chalk";

import figlet, { textSync } from "figlet";

import { capitalize } from "../utils/Engine";

import { Client, Events } from "discord.js";

import GBFVersion from "../GBF/Version.json";

module.exports = (client: Client) => {
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
        underline(
          `${client.user.username} is now online! v${GBFVersion.Version}`
        )
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
};
