import { GatewayIntentBits } from "discord.js";
import GBFClient from "./utils/client";
import path from "path";
import { DefaultCommands } from "./handler/clienthandler";
const { TOKEN } = require(path.join(__dirname, "./config/GBFconfig.json"));

export const client = new GBFClient({
  Version: "2.5.0", // The version that your bot is running on [Required]
  CommandsFolder: "../commands", // The commands folder [Req]
  EventsFolder: "../events", // The events folder [Req]
  Prefix: "!!", // Your bot's prefix [Req]
  LogActions: true, // Log handler actions like which commands are ignored, registering commands etc.
  SupportServer: "", // Link to your support server
  intents: [ // The intents that the bot needs
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildWebhooks
  ],
  IgnoredHelpCategories: [], // The categories that you don't want to display in the help menu
  config: path.join(__dirname, "./config/GBFconfig.json"), // The location of the config file
  Developers: [], // Developer IDs
  TestServers: [], // The test server IDs
  Partners: [], // Partner IDs
  DisabledCommands: [], // Disabled command names (Have to match)
  DMCommands: false // If false, commands can't be ran in DMs, will be overriden in commands if the dmEnabled option is set
});

(async () => {
  client.login(TOKEN);
})();
