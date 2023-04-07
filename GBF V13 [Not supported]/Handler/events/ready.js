const { cyanBright, whiteBright, underline } = require("chalk");

const { textSync } = require("figlet");

const GBFVersion = require("../GBF Info.json");

const { capitalize } = require("../utils/engine");

module.exports = (client) => {
  client.on("ready", async () => {
    const totalUsers = client.guilds.cache.reduce(
      (acc, guild) => acc + guild.memberCount,
      0
    );
    client.user.setActivity(`GBF Bot`, {
      type: "WATCHING",
    });

    console.log(
      cyanBright(
        textSync(`${client.user.username}`, {
          horizontalLayout: "full",
        })
      )
    );

    console.log(
      cyanBright(
        underline(
          `${client.user.username} is now online! v${GBFVersion.Version}`
        )
      )
    );

    console.log(
      whiteBright(
        `> Total BETA testers: ${totalUsers.toLocaleString()}\n> Total BETA Servers: ${client.guilds.cache.size.toLocaleString()}\n---------------------------------\n` +
          `> Discord Verified: ${
            client.user.verified ? "Yes" : "No"
          }\n---------------------------------` +
          `\n> Presence: ${capitalize(
            client.user.presence.status
          )}\n> Status: ${client.user.presence.activities[0].name}`
      )
    );

    process.on("unhandledRejection", (reason, promise) => {
      console.log(
        "[ERROR] Unhandled Rejection at: Promise ",
        promise,
        " reason: ",
        reason.message
      );
    });
  });
};
