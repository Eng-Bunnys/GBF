const GBFHandler = require("./handler/src");
const { Client, IntentsBitField } = require("discord.js");
const path = require("path");
require("dotenv/config");

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
});

client.on("ready", () => {
  console.log(`${client.user?.username} is now online!`);
});

new GBFHandler({
  client,
  mongoURI: process.env.MONGO_URI,
  commandsDir: path.join(__dirname, "commands"),
});

client.login(process.env.TOKEN);
