const { Client, IntentsBitField, Partials} = require("discord.js");
const path = require("path");
require("dotenv/config");

const GBFHandler = require("./handler");

const client = new Client({
  intents: [
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.on("ready", () => {
  console.log(`${client?.user.tag} is now online`);

  new GBFHandler({
    client,
    commandsDir: path.join(__dirname, "commands"),
    mongoURI: process.env.MONGO_URI,
    testServers: ["439890528583286784"]
  });

});

client.login(process.env.TOKEN);
