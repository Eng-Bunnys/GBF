const { Client, IntentsBitField } = require("discord.js");
const path = require("path");
require("dotenv/config");

const GBFHandler = require("./handler");

const client = new Client({
  intents: [
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.Guilds,
  ],
});

client.on("ready", () => {
  console.log(`${client?.user.tag} is now online`);
});

new GBFHandler({
  client,
  commandsDir: path.join(__dirname, "commands"),
  mongoURI: process.env.MONGO_URI,
  testServers: ["GUILD ID GOES HERE", "CAN SUPPORT MULTIPLE GUILDS"]
});

client.login(process.env.TOKEN);
