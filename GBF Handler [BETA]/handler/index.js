const GBFHandler = require("./handler/src");
const { Client, Intents } = require("discord.js");
const path = require("path");
require("dotenv/config");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

client.on("ready", () => {
  console.log(`${client.user?.username} is now online!`);
});

new GBFHandler({
  client,
  commandsDir: path.join(__dirname, "commands"),
})

client.login(process.env.TOKEN);
