import { GatewayIntentBits } from "discord.js";
import GBFClient from "./utils/client";
import path from "path";
import { DefaultCommands } from "./handler/clienthandler";
const { TOKEN } = require(path.join(__dirname, "./config/GBFconfig.json"));

export const client = new GBFClient({
  Version: "2.5.0",
  CommandsFolder: "../commands",
  EventsFolder: "../events",
  Prefix: "!!",
  LogActions: true,
  SupportServer: "https://discord.gg/yrM7fhgNBW",
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildWebhooks
  ],
  IgnoredHelpCategories: ["Developer", "Storymode"],
  config: path.join(__dirname, "./config/GBFconfig.json"),
  Developers: ["333644367539470337", "841854342255345664"],
  TestServers: [
    "827589582932410388",
    "850005402863140895",
    "800076239490252810",
    "439890528583286784"
  ],
  Partners: [
    "333644367539470337",
    "841854342255345664",
    "320914878724571136",
    "339822247613300746",
    "365647018393206785",
    "422072784131194880",
    "539058806358016030"
  ],
  DisabledCommands: ["love"]
});

(async () => {
  client.login(TOKEN);
})();
