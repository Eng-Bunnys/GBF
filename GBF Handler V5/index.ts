import { GatewayIntentBits } from "discord.js";
import { GBF } from "./Handler/GBF";
import path from "path";
import { BuiltInCommands, BuiltInEvents } from "./Handler/types";

export const client = new GBF({
  CommandsFolder: path.join(__dirname, "./Commands"),
  EventsFolder: path.join(__dirname, "./Events"),
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
  AutoLogin: true,
  LogActions: true,
  TestServers: ["1187559385359200316"],
  Developers: ["333644367539470337"],
  DisabledHandlerCommands: [BuiltInCommands["Bot Ban"]],
  DisabledHandlerEvents: [],
});
