const { GatewayIntentBits } = require("discord.js");

const GBFClient = require("./utils/client");
const path = require("path");
const { TOKEN } = require(path.join(__dirname, "./config/GBFconfig.json"));

const client = new GBFClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

(async () => {
  client.login(TOKEN);
})();
