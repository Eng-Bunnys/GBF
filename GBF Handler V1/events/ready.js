const { redBright, whiteBright, underline } = require("chalk");

const { textSync } = require("figlet");

const GBFVersion = require("../GBF Info.json");

const { capitalize } = require("../utils/engine");

module.exports = (client) => {
  client.on("ready", async () => {
    const totalUsers =
      client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    
    client.user.setActivity(`GBF Handler`, {
      type: "LISTENING"
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
        `> Total app users: ${totalUsers.toLocaleString()}\n> Total Servers: ${client.guilds.cache.size.toLocaleString()}`
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
