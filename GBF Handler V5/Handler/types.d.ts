import {
  ApplicationCommandOptionData,
  ApplicationCommandSubCommand,
  ApplicationCommandSubGroup,
  ApplicationCommandType,
  BitFieldResolvable,
  CommandInteraction,
  GatewayIntentBits,
} from "discord.js";
import { GBF } from "./GBF";

export type AppConfig = {
  TOKEN: string;
  MongoURI?: string;
};

export type IgnoreEvents = string[] | "All";

export interface IGBF {
  CommandsFolder?: string;
  EventsFolder?: string;
  LogActions?: boolean;
  AutoLogin?: boolean;
  IgnoredEvents?: IgnoreEvents;
  BotConfig?: AppConfig | string;
  intents: GatewayIntentBits[] | BitFieldResolvable<string, number>;
}

export interface SlashExecute {
  client: GBF;
  interaction: CommandInteraction;
}

export interface SlashOptions {
  name: string;
  description: string;
  ContextType?:
    | ApplicationCommandType.Message
    | ApplicationCommandType.ChatInput
    | ApplicationCommandType.User;
  NSFW?: boolean;
  options?: ApplicationCommandOptionData[];
  UserPermissions?: bigint[];
  BotPermissions?: bigint[];
  cooldown?: number;
  development?: boolean;
  DMEnabled?: boolean;
  DeveloperOnly?: boolean;
  groups?: ApplicationCommandSubGroup;
  subcommands?: ApplicationCommandSubCommand;
  execute: ({
    client,
    interaction,
  }: SlashExecute) => Promise<CommandInteraction | any> | any;
}

export interface Config {
  TOKEN: string;
  MongoURI: string;
}
