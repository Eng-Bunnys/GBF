import { redBright, whiteBright, underline } from "chalk";

import { textSync } from "figlet";

import { capitalize, removeSpacesInUrls } from "../../utils/Engine";

import { ActivityType, Events, Guild } from "discord.js";
import GBFClient from "../../handler/clienthandler";
import {
  NumberOfFreebies,
  GameTitle,
  GameTwoTitle,
} from "../../GBF/Freebies/Game Settings/Epic Games Settings.json";

export default function botReady(client: GBFClient) {
  client.on(Events.ClientReady, async () => {
    const totalUsers =
      client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0) +
      40000;

    removeSpacesInUrls(`C:\\GBF\\GBF Live\\GBF\\Freebies\\Game Settings`);

    let FreebiePresence: string;
    let PresenceType:
      | ActivityType.Playing
      | ActivityType.Streaming
      | ActivityType.Listening
      | ActivityType.Watching
      | ActivityType.Competing;

    if (NumberOfFreebies === 1) {
      FreebiePresence = `${GameTitle}, free on Epic Games!`;
      PresenceType = ActivityType.Playing;
    }
    if (NumberOfFreebies === 2) {
      FreebiePresence = `${GameTitle} & ${GameTwoTitle} are Free on Epic Games!`;
      PresenceType = ActivityType.Watching;
    }
    if (NumberOfFreebies === 3) {
      FreebiePresence = `3 Free Games on Epic Games!`;
      PresenceType = ActivityType.Watching;
    }

    client.user.setPresence({
      activities: [{ name: FreebiePresence, type: PresenceType }],
      status: "online",
    });

    console.log(
      redBright(
        textSync(`${client.user.username}`, {
          horizontalLayout: "full",
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
    console.log(`Caught uncaughtException: ${err}`);
  });
}
