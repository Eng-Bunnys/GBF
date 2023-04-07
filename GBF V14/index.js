const { IntentsBitField } = require("discord.js");

const GBFClient = require("./utils/client");
const path = require("path");
const { TOKEN } = require(path.join(__dirname, "./config/GBFconfig.json"));

const client = new GBFClient({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildEmojisAndStickers,
    IntentsBitField.Flags.GuildWebhooks
  ]
});

(async () => {
  client.login(TOKEN);
})();
