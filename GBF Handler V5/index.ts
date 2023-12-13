import { GatewayIntentBits } from "discord.js";
import GBF from "./handler/GBF";
import path from "path";

export const client = new GBF({
  intents: [GatewayIntentBits.Guilds],
  LogActions: true,
  AutoLogin: false,
  EventsFolder: path.join(__dirname, "./events")
 // config: path.join(__dirname, "./config/GBFconfig.json"), //Don't add if you want to use .env
});