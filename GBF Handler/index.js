const { Client, IntentsBitField } = require("discord.js");
require("dotenv/config");

const GBFHandler = require('./handler');

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

client.login(process.env.TOKEN);
