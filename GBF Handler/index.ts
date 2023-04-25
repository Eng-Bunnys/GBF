import { GatewayIntentBits } from "discord.js";

import GBFClient from "./utils/client";
import path from "path";
const { TOKEN } = require(path.join(__dirname, "./config/GBFconfig.json"));

const client = new GBFClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildWebhooks
  ]
});

(async () => {
  client.login(TOKEN);
})();
