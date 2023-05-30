import { GatewayIntentBits } from "discord.js";
import GBFClient from "./utils/client";
import path from "path";
const { TOKEN } = require(path.join(__dirname, "./config/GBFconfig.json"));

export const client = new GBFClient({
  CommandsFolder: "../commands",
  EventsFolder: "../events",
  Prefix: "!!",
  SupportServer: "",
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildWebhooks
  ],
  HelpMenu: true,
  IgnoredHelpCategories: [],
  config: path.join(__dirname, "./config/GBFconfig.json"),
  Developers: [],
  TestServers: [],
  Partners: []
});

(async () => {
  client.login(TOKEN);
})();
