import { GatewayIntentBits } from "discord.js";
import { GBF } from "./handler/GBF";
import path from "path";

export const client = new GBF({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
  LogActions: true,
  AutoLogin: true,
  CommandsFolder: path.join(__dirname, "./commands"),
  EventsFolder: path.join(__dirname, "./events"),
  // config: path.join(__dirname, "./config/GBFconfig.json"), //Don't add if you want to use .env
});
