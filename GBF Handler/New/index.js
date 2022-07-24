const GBFHandler = require("./handler")
const { Client, IntentsBitField } = require("discord.js");
const path = require("path");
require("dotenv/config");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`${client.user?.username} is now online!`);
});

new GBFHandler({
  client,
  mongoURI: process.env.MONGO_URI,
  commandsDir: path.join(__dirname, "commands"),
  testServers: ["439890528583286784"],
});

client.login(process.env.TOKEN);
